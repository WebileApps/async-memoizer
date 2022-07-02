import { minuteAsyncMemoizer } from "../index";

test("should return memoized value", async () => {
    const mockFn = jest.fn((id: string) => new Promise(resolve => setTimeout(() => resolve(id), 100)));
    const memoizer = minuteAsyncMemoizer(mockFn);
    const output1 = await memoizer("hello");
    expect(output1).toBe("hello");
    const output2 = await memoizer("hello");
    expect(output2).toBe("hello");
    expect(mockFn).toHaveBeenCalledTimes(1);
});

test("should return memoized value for parallel calls", async () => {
    const mockFn = jest.fn((id: string) => new Promise(resolve => setTimeout(() => resolve(id), 100)));
    const memoizer = minuteAsyncMemoizer(mockFn);
    const [output1, output2] = await Promise.all([memoizer("hello"), memoizer("hello")]);
    expect(output1).toBe("hello");
    expect(output2).toBe("hello");
    expect(mockFn).toHaveBeenCalledTimes(1);
});