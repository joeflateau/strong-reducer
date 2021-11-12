import * as React from "react";
import * as ReactDOM from "react-dom";
import { useStrongReducerWithProps } from "../src";

describe("it", () => {
  it("most basic example", () => {
    function App() {
      const [countBy, setCountBy] = React.useState(5);

      const [count, useDispatcher] = useStrongReducerWithProps(0, countBy);

      const [dispatcher] = useDispatcher({
        increase: () => (countBy) => (count) => count + countBy,

        set: (newCount: number) => () => newCount,

        setAsync: (newCount: number) => () => Promise.resolve(newCount),

        increaseAsync: () => (countBy) =>
          Promise.resolve((oldCount) => oldCount + countBy),
      });

      return (
        <>
          <div>{count}</div>
          <input
            type="number"
            onChange={(ev) => setCountBy(Number(ev.target.value))}
          />
          <button onClick={dispatcher.increase}>Increase</button>
          <button onClick={() => dispatcher.set(10)}>Set to 10</button>
          <button onClick={() => dispatcher.setAsync(10)}>
            Set to 10 async
          </button>
          <button onClick={dispatcher.increaseAsync}>Increase Async</button>
        </>
      );
    }

    const div = document.createElement("div");
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it("also renders without crashing", () => {
    function App() {
      const [countBy, setCountBy] = React.useState(1);

      const [count, useDispatcher] = useStrongReducerWithProps(0, countBy);

      const [dispatcher] = useDispatcher({
        increase: () => (countBy) => (count) => count + countBy,
        decrease: () => (countBy) => (count) => count - countBy,
        set: (value: number) => () => value,
        setWithUpdater: (value: number) => () => () => value,
        setAsync: (value: number) => () => Promise.resolve(value),
        setAsyncWithUpdater: (value: number) => () =>
          Promise.resolve(() => value),
        reset: () => () => 0,
      });

      return (
        <>
          <div>{count}</div>
          <input
            type="number"
            onChange={(ev) => setCountBy(Number(ev.target.value))}
          />
          <button onClick={dispatcher.increase}>Increase</button>
          <button onClick={dispatcher.decrease}>Decrease</button>
          <button onClick={dispatcher.reset}>Reset</button>

          <button onClick={() => dispatcher.set(10)}>Set</button>
          <button onClick={() => dispatcher.setWithUpdater(30)}>
            Set with updater
          </button>
          <button onClick={() => dispatcher.setAsync(10)}>Set async</button>
          <button onClick={() => dispatcher.setAsyncWithUpdater(10)}>
            Set with async updater
          </button>
        </>
      );
    }

    const div = document.createElement("div");
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
