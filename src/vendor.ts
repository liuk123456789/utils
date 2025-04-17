export { debounce, throttle } from 'throttle-debounce'

export type ResolverFunction<TArgs extends unknown[], TKey> = (...args: TArgs) => TKey

/**
 * @description 缓存函数
 * @param func { Function }
 * @param resolver { Function }
 * @returns memoized
 */
export function memoize<TArgs extends unknown[], TResult, TKey = string>(
  func: (...args: TArgs) => TResult,
  resolver?: ResolverFunction<TArgs, TKey>,
): {
    (...args: TArgs): TResult
    cache: Map<TKey, TResult>
  } {
  const memoized = function (this: any, ...args: TArgs): TResult {
    const key = resolver ? resolver.apply(this, args) : JSON.stringify(args) as TKey

    if (memoized.cache.has(key)) {
      return memoized.cache.get(key)!
    }

    const result = func.apply(this, args)
    memoized.cache.set(key, result)
    return result
  }

  memoized.cache = new Map<TKey, TResult>()

  return memoized
}
