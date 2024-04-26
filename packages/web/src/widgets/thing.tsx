import { useState } from "preact/hooks";
import { widgetBuilder } from "~/lib/widget";

const Dock = () => {
  const [thing, setThing] = useState(false);
  return (
    <div>
      thing {thing.toString()}
      <button onClick={() => setThing(!thing)}>Click me</button>
      {/* My Dock: {thing.toString()} */}
      {/* <Button onClick={() => myThing(!thing)} /> */}
    </div>
  );
};

widgetBuilder(Dock).width(200).height(200).windowType("dock").build();
