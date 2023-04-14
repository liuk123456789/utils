import { toString } from './base'

export function isDef<T = any>(val?: T): val is T {
  return typeof val !== 'undefined'
}
export function isBoolean(val: any): val is boolean {
  return typeof val === 'boolean'
}
export function isFunction<T extends Function>(val: any): val is T {
  return typeof val === 'function'
}
export function isNumber(val: any): val is number {
  return typeof val === 'number'
}
export function isString(val: unknown): val is string {
  return typeof val === 'string'
}
export function isObject(val: any): val is object {
  return toString(val) === '[object Object]'
}
export function isUndefined(val: any): val is undefined {
  return toString(val) === '[object Undefined]'
}
export function isNull(val: any): val is null {
  return toString(val) === '[object Null]'
}
export function isRegExp(val: any): val is RegExp {
  return toString(val) === '[object RegExp]'
}
export function isDate(val: any): val is Date {
  return toString(val) === '[object Date]'
}

// @ts-ignore
export function isWindow(val: any): boolean {
  return typeof window !== 'undefined' && toString(val) === '[object Window]'
}
// @ts-ignore
export const isBrowser = typeof window !== 'undefined'
