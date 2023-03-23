# strong-reducer

A useReducer hook for React that's easy to use with Typescript.

## Important Concurrency Note:

`strong-reducer` supports synchronous, async (`Promise`), and async iterable (`async function*`) reducers. However, only one dispatch can be active at a time, this prevents race conditions between dispatches. If you send a dispatch while another dispatch is being awaited, then that previous dispatch will be aborted. 

What does this mean for...

- synchronous reducers: a synchronous reducer cannot be canceled because there's no chance of concurrency. However, it will abort a running asynchronous reducer.
- async (`Promise`) based reducers: the **return value will be discarded** if aborted. 
- async iterable (`async function*`) based reducers: the **next yielded value will be discarded _and the generator's execution will halt_**.

```typescript
type States = "idle" | "submitting" | "success" | "error";

const [state, { submit }] = useStrongReducer<States>("idle")({
  submit: (value: string) =>
    async function* () {
      yield "submitting";
      try {
        await apiClient.submitValue(value);
        yield "success";
      } catch (err) {
        yield "error";
      }
      await sleep(700);
      yield "idle";
    },
});

// click this a few times,
// it will not revert to idle 700ms after the FIRST click if there were subsequent clicks
// it will only revert back to idle 700ms after the most recent click
return (
  <button onClick={() => submit(someValue)}>
    {
      {
        idle: "Submit",
        submitting: "Processing...",
        success: "Succeeded!",
        error: "Error!",
      }[state]
    }
  </button>
);
```



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
