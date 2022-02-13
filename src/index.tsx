import { useEffect, useRef, useState } from "react";
import { entries } from "./entries";

type ValueOrPromise<T> = T | Promise<T>;

type ReducerMap<
  TState,
  TProps,
  TReducers extends ReducerMap<TState, TProps, TReducers>
> = {
  [K in keyof TReducers]: Reducer<TState, TProps>;
};

type Reducer<TState, TProps> = (
  ...args: any[]
) => (props: TProps) => ValueOrPromise<StateStateSetterOrVoid<TState> | void>;

type StateStateSetterOrVoid<TState> = TState | ((state: TState) => TState);

type DispatcherMap<
  TState,
  TProps,
  TReducers extends ReducerMap<TState, TProps, TReducers>
> = {
  [K in keyof TReducers]: Dispatcher<TState, TProps, TReducers, K>;
};

type Dispatcher<
  TState,
  TProps,
  TReducers extends ReducerMap<TState, TProps, TReducers>,
  TReducerKey extends keyof TReducers
> = (...args: Parameters<TReducers[TReducerKey]>) => Promise<void>;

export function useStrongReducer<TState>(initialState: TState) {
  return useStrongReducerWithProps(initialState, {});
}

export function useStrongReducerWithProps<TState, TProps>(
  initialState: TState,
  props: TProps,
) {
  const [state, setState] = useState(initialState);
  const refProps = useRef<TProps>(null!);

  useEffect(() => {
    refProps.current = props;
  }, [props]);

  return function useDispatcher<
    TReducers extends ReducerMap<TState, TProps, TReducers>,
    TDispatchers extends DispatcherMap<TState, TProps, TReducers>
  >(reducers: TReducers): [TState, TDispatchers] {
    const [dispatcher] = useState(
      entries(reducers).reduce(
        (acc, [name, reducerDispatcherArgs]) => ({
          ...acc,
          [name]: async (...params: any[]) => {
            const reducerDispatcherAndPropsArgs = reducerDispatcherArgs(
              ...params,
            );
            const stateOrStateSetter = await reducerDispatcherAndPropsArgs(
              refProps.current,
            );
            if (typeof stateOrStateSetter !== "undefined") {
              setState(stateOrStateSetter);
            }
          },
        }),
        {} as TDispatchers,
      ),
    );

    return [state, dispatcher];
  };
}
