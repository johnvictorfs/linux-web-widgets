// Original license: https://github.com/tauri-apps/wry/tree/9041f9b10668fb0b933e87aa94716f9f008ce8c5
// Copyright 2020-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::collections::HashMap;

use gtk::prelude::{GtkWindowExt, WidgetExt};

use tao::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoopBuilder, EventLoopProxy, EventLoopWindowTarget},
    platform::unix::WindowExtUnix,
    window::{Window, WindowBuilder, WindowId},
};
use wry::{http::Request, WebView, WebViewBuilder};

enum UserEvent {
    SetupWindow(WindowId, WindowProperties),
}

fn main() -> wry::Result<()> {
    let event_loop = EventLoopBuilder::<UserEvent>::with_user_event().build();
    let proxy = event_loop.create_proxy();
    let new_window = create_new_window(
        format!("Widget"),
        format!("http://localhost:3000/dock.html"),
        &event_loop,
        proxy,
    );

    // new_window.0.gtk_window().show();

    let mut webviews = HashMap::new();
    webviews.insert(new_window.0.id(), (new_window.0, new_window.1));

    event_loop.run(move |event, _event_loop, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                window_id,
                ..
            } => {
                webviews.remove(&window_id);
                if webviews.is_empty() {
                    *control_flow = ControlFlow::Exit
                }
            }
            Event::UserEvent(UserEvent::SetupWindow(id, window_properties)) => {
                if window_properties.window_type == "dock" {
                    println!("Setting window type to dock");
                    webviews
                        .get(&id)
                        .unwrap()
                        .0
                        .gtk_window()
                        .set_type_hint(gdk::WindowTypeHint::Dock);
                }

                if window_properties.x.is_some() && window_properties.y.is_some() {
                    println!(
                        "Moving window to x: {}, y: {}",
                        window_properties.x.unwrap(),
                        window_properties.y.unwrap()
                    );
                    webviews
                        .get(&id)
                        .unwrap()
                        .0
                        .gtk_window()
                        .move_(window_properties.x.unwrap(), window_properties.y.unwrap());
                }

                if window_properties.width > 0 && window_properties.height > 0 {
                    println!(
                        "Resizing window to width: {}, height: {}",
                        window_properties.width, window_properties.height
                    );
                    webviews
                        .get(&id)
                        .unwrap()
                        .0
                        .gtk_window()
                        .resize(window_properties.width, window_properties.height);
                }

                webviews.get(&id).unwrap().0.gtk_window().hide();
                webviews.get(&id).unwrap().0.gtk_window().show();
            }
            _ => (),
        }
    });
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct WindowProperties {
    window_type: String,
    display: Option<String>,
    x: Option<i32>,
    y: Option<i32>,
    width: i32,
    height: i32,
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

    #[cfg(any(
        target_os = "windows",
        target_os = "macos",
        target_os = "ios",
        target_os = "android"
    ))]
    let builder = WebViewBuilder::new(&window);

    #[cfg(not(any(
        target_os = "windows",
        target_os = "macos",
        target_os = "ios",
        target_os = "android"
    )))]
    let builder = {
        use wry::WebViewBuilderExtUnix;
        let vbox = window.default_vbox().unwrap();
        WebViewBuilder::new_gtk(vbox)
    };

    let gtk_window = window.gtk_window();

    let gdk_window = gtk_window.window().unwrap();
    gdk_window.hide();
    gdk_window.set_override_redirect(true);
    gdk_window.set_accept_focus(false);
    gdk_window.set_keep_above(true);
    gdk_window.set_type_hint(gdk::WindowTypeHint::Dialog);

    let window_id = window.id();

    let handler = move |req: Request<String>| {
        let body = req.body();

        match body.as_str() {
            _ if body.starts_with("setup-window") => {
                let json_data = body.replace("setup-window:", "");
                println!("Received setup-window event: {}", json_data);
                let window_properties: WindowProperties = serde_json::from_str(&json_data).unwrap();
                let _ = proxy.send_event(UserEvent::SetupWindow(window_id, window_properties));
            }
            _ => {}
        }
    };

    let webview = builder
        .with_url(url)
        .with_ipc_handler(handler)
        .build()
        .unwrap();

    gdk_window.resize(570, 320);
    gtk_window.move_(0, 0);

    gdk_window.show();

    (window, webview)
}
