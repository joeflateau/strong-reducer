# strong-reducer

A useReducer hook for React that's easy to use with Typescript.

## Important Concurrency Note:

`strong-reducer` supports synchronous, async (Promise), and async iterable (async function*) reducers. However, only one dispatch can be active at a time, this prevents race conditions between dispatches. If you send a dispatch while another dispatch is being awaited, then that previous dispatch will be aborted. 

What this means for async (Promise) based reducers is the **return value will be discarded**. 

What this means for async iterable based reducers is that the **next yielded value will be discarded _and the generator's execution will halt_**.

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
  
  setAsyncIter: // <-------------------------- dispatcher method name
    () => // <-------------------------------- dispatcher method args
      async function* (
        props,
        dispatch // <------------------------- dispatch: { props, state, abort }
      ) {
        yield 1; // <------------------------- new state (async)
        await sleep(500);
        yield 2; // <------------------------- new state (async)
        await sleep(500);
        yield 3; // <------------------------- new state (async)
      },
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
