import { useRef, useState } from "react";
import { asyncIterable } from "./asyncIterable";
import { entries } from "./entries";

export type AsyncIterableInput<T> = T | Promise<T> | AsyncIterable<T>;

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
  dispatch: Dispatch<TState, TProps>,
) => AsyncIterableInput<StateStateSetterOrVoid<TState> | void>;

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

type Dispatch<TState, TProps> = {
  state: TState;
  props: TProps;
  abort: AbortController;
};

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
    const dispatchRef = useRef<Dispatch<TState, TProps> | null>(null);

    const [dispatcher] = useState(() =>
      entries(reducers).reduce(
        (acc, [name, reducerDispatcherArgs]) => ({
          ...acc,
          [name]: async (...params: any[]) => {
            dispatchRef.current?.abort.abort();

            const dispatch = (dispatchRef.current = {
              props: refProps.current,
              state: stateRef.current,
              abort: new AbortController(),
            });

            const reducerDispatcherAndPropsArgs = reducerDispatcherArgs(
              ...params,
            );

            const stateIterable = reducerDispatcherAndPropsArgs(
              dispatch.props,
              dispatch,
            );

            for await (const state of asyncIterable(stateIterable)) {
              if (dispatch.abort.signal.aborted) {
                return;
              }
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
