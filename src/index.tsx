import { useRef, useState } from "react";
import { entries } from "./entries";

type ValuePromiseOrIterable<T> = T | Promise<T> | AsyncIterable<T>;

type ReducerMap<
  TState,
  TProps,
  TReducers extends ReducerMap<TState, TProps, TReducers>,
> = {
  [K in keyof TReducers]: Reducer<TState, TProps>;
};

type Reducer<TState, TProps> = (
  ...args: any[]
) => (
  props: TProps,
  state: TState,
) => ValuePromiseOrIterable<StateStateSetterOrVoid<TState> | void>;

type StateStateSetterOrVoid<TState> = TState | ((state: TState) => TState);

type DispatcherMap<
  TState,
  TProps,
  TReducers extends ReducerMap<TState, TProps, TReducers>,
> = {
  [K in keyof TReducers]: Dispatcher<TState, TProps, TReducers, K>;
};

type Dispatcher<
  TState,
  TProps,
  TReducers extends ReducerMap<TState, TProps, TReducers>,
  TReducerKey extends keyof TReducers,
> = (...args: Parameters<TReducers[TReducerKey]>) => Promise<void>;

export function useStrongReducer<TState>(
  initialState: TState | (() => TState),
) {
  return useStrongReducerWithProps(initialState, {});
}

export function useStrongReducerWithProps<TState, TProps>(
  initialState: TState | (() => TState),
  props: TProps,
) {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const refProps = useRef<TProps>(null!);
  refProps.current = props;

  return function useDispatcher<
    TReducers extends ReducerMap<TState, TProps, TReducers>,
    TDispatchers extends DispatcherMap<TState, TProps, TReducers>,
  >(reducers: TReducers): [TState, TDispatchers] {
    const [dispatcher] = useState(
      entries(reducers).reduce(
        (acc, [name, reducerDispatcherArgs]) => ({
          ...acc,
          [name]: async (...params: any[]) => {
            const reducerDispatcherAndPropsArgs = reducerDispatcherArgs(
              ...params,
            );
            const stateIterable = reducerDispatcherAndPropsArgs(
              refProps.current,
              stateRef.current,
            );
            for await (const state of asyncIterable(stateIterable)) {
              if (typeof state !== "undefined") {
                setState(state);
              }
            }
          },
        }),
        {} as TDispatchers,
      ),
    );

    return [state, dispatcher];
  };
}

async function* asyncIterable<T>(
  input: ValuePromiseOrIterable<T>,
): AsyncIterable<T> {
  if (input && typeof input === "object" && Symbol.asyncIterator in input) {
    return input;
  }
  yield await input;
}
