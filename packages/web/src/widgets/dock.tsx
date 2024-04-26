import { useState } from "preact/hooks";
import { widgetBuilder } from "~/lib/widget";

import "~/styles.css";

const Dock = () => {
  const [thing, setThing] = useState(false);

  return (
    <div className="p-4">
      dock new {thing.toString()}
      <button onClick={() => setThing(!thing)}>Click me</button>
    </div>
  );
};

widgetBuilder(Dock)
  .position(20, 20)
  .width(1880)
  .height(60)
  .windowType("dock")
  .build();
