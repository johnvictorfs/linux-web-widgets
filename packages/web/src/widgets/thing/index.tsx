import { widgetBuilder } from "~/lib/widget";

widgetBuilder(() => <div>asdasd</div>)
  .position(20, 20)
  .width(1880)
  .height(60)
  .windowType("dock")
  .build();
