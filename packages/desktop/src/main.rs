// Original license: https://github.com/tauri-apps/wry/tree/9041f9b10668fb0b933e87aa94716f9f008ce8c5
// Copyright 2020-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::{
    collections::HashMap,
    io::{BufRead, BufReader},
    process::{Command, Stdio},
    sync::Mutex,
    thread,
};

use gtk::prelude::{GtkWindowExt, WidgetExt};

use once_cell::sync::Lazy;
use tao::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoopBuilder, EventLoopProxy, EventLoopWindowTarget},
    platform::unix::WindowExtUnix,
    window::{Window, WindowBuilder, WindowId},
};
use wry::{http::Request, WebView, WebViewBuilder};

enum UserEvent {
    SetupWindow(WindowId, WindowProperties),
    Command(WindowId, CommandExecution),
    /**
     * WindowId, MessageId, Output
     */
    SendWindowMessage(WindowId, String, String),
    KillListener(String),
}

const WIDGETS: [(&str, &str); 2] = [
    ("Dock", "http://localhost:3000/dock.html"),
    ("SecondDock", "http://localhost:3000/second_dock.html"),
];

static LISTENERS: Lazy<Mutex<HashMap<String, WindowId>>> = Lazy::new(|| Mutex::new(HashMap::new()));

fn exec(cmd: &str, args: &[&str]) -> String {
    let output = Command::new(cmd)
        .args(args)
        .output()
        .expect("failed to execute cmd");

    String::from_utf8(output.stdout).unwrap()
}

fn exec_listener(
    cmd: &str,
    args: &[&str],
    callback: impl Fn(String) + Send + 'static,
    listener_id: &str,
) {
    let mut child = Command::new(cmd)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();
    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take();

    let cloned_id = listener_id.to_string();

    // Spawn a thread to handle stdout and wait for the child process to exit
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            let line = line.unwrap();

            if !LISTENERS.lock().unwrap().contains_key(&cloned_id) {
                break;
            }

            callback(line);
        }
        // Wait for the child process to exit to avoid zombie processes
        let _ = child.wait();
    });

    if let Some(stderr) = stderr {
        thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                let line = line.unwrap();
                println!("exec_listener error: {}", line);
            }
        });
    }
}

fn main() -> wry::Result<()> {
    let event_loop = EventLoopBuilder::<UserEvent>::with_user_event().build();
    let proxy = event_loop.create_proxy();
    let mut webviews = HashMap::new();

    for (title, url) in WIDGETS {
        let proxy_clone = proxy.clone();
        let widget_window =
            create_new_window(title.to_string(), url.to_string(), &event_loop, proxy_clone);

        webviews.insert(widget_window.0.id(), (widget_window.0, widget_window.1));
    }

    event_loop.run(move |event, _event_loop, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                window_id,
                ..
            } => {
                LISTENERS.lock().unwrap().retain(|_, v: &mut WindowId| *v != window_id);

                webviews.remove(&window_id);
                if webviews.is_empty() {
                    *control_flow = ControlFlow::Exit
                }
            }
            Event::UserEvent(UserEvent::KillListener(message_id)) => {
                LISTENERS.lock().unwrap().remove(&message_id);
            }
            Event::UserEvent(UserEvent::SendWindowMessage(id, message_id, output)) => {
                let output = output
                    .replace('"', "\\\"")
                    .replace('\n', "\\n")
                    .replace('\t', "\\t");

                let json_output = serde_json::to_string(&format!(
                    r#"{{"message_id": "{}", "output": "{}"}}"#,
                    message_id,
                    output.trim_end()
                ));

                let json_output = json_output.unwrap();

                let webview = &webviews.get(&id).unwrap().1;
                webview
                    .evaluate_script(&format!("window.postMessage({})", json_output))
                    .unwrap();
            }
            Event::UserEvent(UserEvent::Command(id, command)) => {
                let args = command
                    .args
                    .iter()
                    .map(|s| s.as_str())
                    .collect::<Vec<&str>>();

                let proxy_clone = proxy.clone();
                let message_id = command.message_id.clone();

                if command.listen {
                    // keep listening to command stdout
                    LISTENERS.lock().unwrap().insert(message_id.clone(), id);
                    let another_message_id = message_id.clone();

                    exec_listener(
                        command.command.as_str(),
                        &args,
                        move |output| {
                            let _ = proxy_clone.send_event(UserEvent::SendWindowMessage(
                                id,
                                message_id.clone(),
                                output,
                            ));
                        },
                        &another_message_id,
                    );

                    return;
                }

                let output = exec(&command.command, &args);

                let _ = proxy_clone.send_event(UserEvent::SendWindowMessage(
                    id,
                    command.message_id.clone(),
                    output,
                ));
            }
            Event::UserEvent(UserEvent::SetupWindow(id, window_properties)) => {
                let window = &webviews.get(&id).unwrap().0;

                // Remove old listeners from this window if it's reloaded
                LISTENERS.lock().unwrap().retain(|_, v| *v != id);

                if window_properties.window_type == "dock" {
                    println!("Setting window type to dock");
                    window.gtk_window().set_type_hint(gdk::WindowTypeHint::Dock);
                }

                if window_properties.width > 0 && window_properties.height > 0 {
                    println!(
                        "Resizing window to width: {}, height: {}",
                        window_properties.width, window_properties.height
                    );
                    window
                        .gtk_window()
                        .resize(window_properties.width, window_properties.height);
                }

                println!(
                    "Setting override redirect to {}",
                    window_properties.override_redirect
                );
                window
                    .gtk_window()
                    .window()
                    .unwrap()
                    .set_override_redirect(window_properties.override_redirect);

                if window_properties.x.is_some() && window_properties.y.is_some() {
                    println!(
                        "Moving window to x: {}, y: {}",
                        window_properties.x.unwrap(),
                        window_properties.y.unwrap()
                    );
                    window
                        .gtk_window()
                        .move_(window_properties.x.unwrap(), window_properties.y.unwrap());
                }

                window.gtk_window().hide();
                window.gtk_window().show();
            }
            _ => (),
        }
    });
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct WindowProperties {
    message_id: String,
    window_type: String,
    display: Option<String>,
    x: Option<i32>,
    y: Option<i32>,
    width: i32,
    height: i32,
    override_redirect: bool,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct CommandExecution {
    message_id: String,
    command: String,
    #[serde(default = "bool::default")] // this is `false`, for some reason
    listen: bool,
    args: Vec<String>,
}

fn create_new_window(
    title: String,
    url: String,
    event_loop: &EventLoopWindowTarget<UserEvent>,
    proxy: EventLoopProxy<UserEvent>,
) -> (Window, WebView) {
    let window = WindowBuilder::new()
        .with_title(title)
        .build(event_loop)
        .unwrap();

    #[cfg(not(any(
        target_os = "windows",
        target_os = "macos",
        target_os = "ios",
        target_os = "android"
    )))]

    let gtk_window = window.gtk_window();

    let gdk_window = gtk_window.window().unwrap();
    gdk_window.hide();
    gdk_window.set_accept_focus(false);
    gdk_window.set_keep_above(true);
    gdk_window.set_type_hint(gdk::WindowTypeHint::Dialog);

    let window_id = window.id();

    let handler = move |req: Request<String>| {
        let body = req.body();

        match body.as_str() {
            _ if body.starts_with("setup-window") => {
                let json_data = body.replace("setup-window:", "");
                let window_properties: WindowProperties = serde_json::from_str(&json_data).unwrap();
                let _ = proxy.send_event(UserEvent::SetupWindow(window_id, window_properties));
            }
            _ if body.starts_with("command") => {
                let json_data = body.replace("command:", "");
                let command_options: CommandExecution = serde_json::from_str(&json_data).unwrap();
                let _ = proxy.send_event(UserEvent::Command(window_id, command_options));
            }
            _ if body.starts_with("kill-listener") => {
                let message_id = body.replace("kill-listener:", "");
                let _ = proxy.send_event(UserEvent::KillListener(message_id));
            }
            _ => (),
        }
    };

    let webview_builder = WebViewBuilder::new()
        .with_clipboard(true)
        .with_url(url)
        .with_devtools(true)
        .with_ipc_handler(handler);

    let webview = {
        use tao::platform::unix::WindowExtUnix;
        use wry::WebViewBuilderExtUnix;
        let vbox = window.default_vbox().unwrap();
        webview_builder.build_gtk(vbox)
            .unwrap()
    };

    gdk_window.resize(570, 320);
    gtk_window.move_(0, 0);

    gdk_window.show();

    (window, webview)
}
