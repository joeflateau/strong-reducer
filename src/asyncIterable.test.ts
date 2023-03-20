import { asyncIterable } from "./asyncIterable";

describe("asyncIterable", () => {
  it("should work with value", async () => {
    const result: number[] = [];

    for await (const value of asyncIterable(1)) {
      result.push(value);
    }

    expect(result).toMatchObject([1]);
  });
  it("should work with promise", async () => {
    const result: number[] = [];

    for await (const value of asyncIterable(Promise.resolve(1))) {
      result.push(value);
    }

    expect(result).toMatchObject([1]);
  });
  it("should work with promise", async () => {
    const result: number[] = [];

    async function* generate() {
      yield 1;
      yield 2;
      yield 3;
    }

    for await (const value of asyncIterable(generate())) {
      result.push(value);
    }

    expect(result).toMatchObject([1, 2, 3]);
  });
});
