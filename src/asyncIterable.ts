import { AsyncIterableInput } from "./index";

export function asyncIterable<T>(
  input: AsyncIterableInput<T>,
): AsyncIterable<T> {
  if (input && typeof input === "object" && Symbol.asyncIterator in input) {
    return input;
  }
  return asyncIterablePromise(input);
}

async function* asyncIterablePromise<T>(
  input: T | Promise<T>,
): AsyncIterable<T> {
  yield await input;
}
