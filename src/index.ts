import * as util from 'util';
const debuglog = util.debuglog('async-memoizer');

// const debuglog = console.log.bind(console);

export type AsyncMemoizerOptions = {
  maxAge?: number; // milliseconds to keep the result in cache. defaults to 0
  maxSize?: number; // max number of results to keep in cache. defaults to Infinity
  resolver?: (...args: any[]) => string;
};

type Memo = {
  [key: string]: {
    expiresAt: Date;
    value: any;
    lastAccessedAt: Date;
  };
};
// Returns a new function which caches the values returned by the original function for a given time period.
const slice = Array.prototype.slice;
const defaultOptions: AsyncMemoizerOptions = {
  maxAge: 0,
  maxSize: Infinity,
  resolver: (...args: any[]) => JSON.stringify(slice.call(args)),
};
export default function asyncMemoizer(fn: Function, opts?: AsyncMemoizerOptions): Function {
  const memo: Memo = {};
  const options = Object.assign({}, defaultOptions, opts || {});
  if (options.maxSize === 0) {
    return fn.apply.bind(fn);
  }
  return function () {
    const args = slice.call(arguments);
    const key = options.resolver!(args);
    if (key in memo) {
      debuglog('Cache hit for key: ', key);
      const { value, expiresAt } = memo[key];
      if (expiresAt && expiresAt.getTime() > Date.now()) {
        // If the value is still valid, return it and update the last accessed time
        memo[key].lastAccessedAt = new Date();
        return value;
      }
      // Need to evict from cache as it has expired
      debuglog('Cache expired for key: ', key);
      delete memo[key];
    } else {
      debuglog('Cache miss for key: ', key);
    }
    debuglog('Cache set with promise for key: ', key);
    const value = new Promise((resolve, reject) => {
      fn.apply(this, args)
        .then((val: unknown) => {
          debuglog('Cache set with value for key: ', key);
          resolve(val);
          if (options.maxSize === 0) {
            return;
          }
          // Need to evict from cache if maxSize is reached
          if (options.maxSize !== Infinity && Object.keys(memo).length >= options.maxSize!) {
            const keys = Object.keys(memo);
            const keysWithResolvedPromises = keys.filter((key) => memo[key].value.isResolved());
            if (keysWithResolvedPromises.length > 0) {
              const oldestKey = keysWithResolvedPromises.reduce((acc, key) => {
                const { lastAccessedAt } = memo[key];
                return lastAccessedAt.getTime() < memo[acc].lastAccessedAt.getTime() ? key : acc;
              }, keysWithResolvedPromises[0]);
              delete memo[oldestKey];
            }
          }
        })
        .catch((err: any) => {
          reject(err);
        });
    });
    memo[key] = {
      value,
      expiresAt: new Date(Date.now() + options.maxAge!),
      lastAccessedAt: new Date(),
    };
    return value;
  };
}

export function minuteAsyncMemoizer(fn: Function) {
  return asyncMemoizer(fn, { maxAge: 60000 });
}

export function hourAsyncMemoizer(fn: Function) {
  return asyncMemoizer(fn, { maxAge: 60 * 60 * 1000 });
}
