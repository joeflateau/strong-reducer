import * as React from 'react';
import 'react-app-polyfill/ie11';
import * as ReactDOM from 'react-dom';
import { useStrongReducerWithProps } from '../.';

const App = () => {
  const [countBy, setCountBy] = React.useState(5);

  const [count, useDispatcher] = useStrongReducerWithProps(0, countBy);

  const [dispatcher] = useDispatcher({
    increase: () => countBy => count => count + countBy,

    set: (newCount: number) => () => newCount,

    setAsync: (newCount: number) => () => Promise.resolve(newCount),

    increaseAsync: () => countBy =>
      Promise.resolve(oldCount => oldCount + countBy),
  });

  return (
    <>
      <div>Count: {count}</div>
      <div>
        Increase by:{' '}
        <input
          type="number"
          value={countBy}
          onChange={ev => setCountBy(Number(ev.target.value))}
        />
      </div>

      <button onClick={dispatcher.increase}>Increase</button>
      <button onClick={() => dispatcher.set(10)}>Set to 10</button>
      <button onClick={() => dispatcher.setAsync(10)}>Set to 10 async</button>
      <button onClick={dispatcher.increaseAsync}>Increase Async</button>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
