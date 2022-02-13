# strong-reducer

A useReducer hook for React that's easy to use with Typescript.

## Install

```shell
npm i strong-reducer
```

or

```shell
yarn add strong-reducer
```

## Use

```typescript
const [countBy, setCountBy] = React.useState(5);

const [count, useDispatcher] = useStrongReducerWithProps(
  0, // <------------------------------------- initial state
  countBy // <-------------------------------- reducer props
)({
  increase: // <------------------------------ dispatcher method name
    () =>  // <------------------------------- dispatcher method args (none)
      countBy => // <------------------------- reducer props
        count => count + countBy, // <-------- state updater
  
  set: // <----------------------------------- dispatcher method name
    (newCount: number) => // <---------------- dispatcher method args
      () => // <------------------------------ reducer props (omitted)
        newCount, // <------------------------ new state
  
  setAsync: // <------------------------------ dispatcher method name
    (newCount: number) => // <---------------- dispatcher method args
      () =>   // <---------------------------- reducer props (omitted)
        Promise.resolve(newCount), // <------- new state (async)
  
  increaseAsync: // <------------------------- dispatcher method name
    () => // <-------------------------------- dispatcher method args (none)
      countBy =>   // <----------------------- reducer props
        Promise.resolve( // <-------------------------------------------
          oldCount => oldCount + countBy // <- new state (async, updater)
        ), // <---------------------------------------------------------
  
  reload: // <-------------------------------- dispatcher method name
    () => // <-------------------------------- dispatcher method args (none)
      async () =>   // <---------------------- reducer props (omitted)
        await fetchFromServer(), // <--------- async fetch
});

return (
  <>
    <div>{ count }</div>
    <input type="number" onChange={ev => setCountBy(Number(ev.target.value))} />
    <button onClick={dispatcher.increase}>Increase</button>
    <button onClick={() => dispatcher.set(10)}>Set to 10</button>
    <button onClick={() => dispatcher.setAsync(10)}>Set to 10 async</button>
    <button onClick={dispatcher.increaseAsync}>Increase Async</button>
  </>
);
```
