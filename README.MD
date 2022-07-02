## Introduction

This is a memoizer for asynchronous functions that return a promise.

## Usage

```typescript

import asyncMemoizer from "@webileapps/async-memoizer";

async function getUserFromSomewhere(id: string) {
    return Promise.resolve({ id, name: "John" });
}

const function memoizedGetUserFromSomewhere = asyncMemoizer(getUserFromSomewhere);

const [ result1, result2 ] = await Promise.all([memoizedGetUserFromSomewhere("1"), memoizedGetUserFromSomewhere("2")]);

const [ result3, result4 ] = await Promise.all([memoizedGetUserFromSomewhere("1"), memoizedGetUserFromSomewhere("2")]);

// In the above case, the second calls to getUserFromSomewhere will be skipped as the results are memoized

```

```