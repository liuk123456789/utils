import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {  isNumber, isUndefined } from './is'

import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

type TimeLike = Date | string | number

// 是否是合法时间
export function isDateValid(time: number | string | Date): boolean {
  return dayjs(time).isValid()
}

// 格式化时间
export function formatDate(time: number | string, format = 'YYYY-MM-DD'): string {
  const isValid = isDateValid(time)
  if (!isValid) {
    throw new Error('Invalid Date')
  }
  if (isNumber(time) && time.toString().length === 10) {
    return dayjs.unix(time).format(format)
  }
  return dayjs(time).format(format)
}

// 获取日期对应的年月日
export function getYMD(val: number | string | Date) {
  const isValid = isDateValid(val)
  if (!isValid) {
    throw new Error('Invalid Date')
  }
  return {
    year: dayjs(val).year(),
    month: dayjs(val).month() + 1,
    day: dayjs(val).date(),
  }
}

// 获取时间戳 秒
export function getDateStamp(time: number | string | Date): number {
  const isValid = isDateValid(time)
  if (!isValid) {
    throw new Error('Invalid Date')
  }
  return dayjs(time).valueOf()
}

// 获取时间戳 毫秒
export function getDateUnixStamp(time: number | string | Date): number {
  const isValid = isDateValid(time)
  if (!isValid) {
    throw new Error('Invalid Date')
  }
  return dayjs(time).unix()
}

// 获取相对时间
export function toRelativeTime(time: TimeLike): string {
  const isValid = isDateValid(time)
  if (isValid)
    throw new Error('Invalid Date')
  if (isNumber(time) && time.toString().length === 10) {
    return dayjs.unix(time).fromNow()
  }
  return dayjs(time).fromNow()
}

// 开始时间
export function getStartOfTime(time: TimeLike, unit: dayjs.OpUnitType): Dayjs {
  const isValid = isDateValid(time)
  if (!isValid) {
    throw new Error('Invalid Date')
  }
  return dayjs(time).startOf(unit)
}

// 结束时间
export function getEndOfTime(time: TimeLike, unit: dayjs.OpUnitType): Dayjs {
  const isValid = isDateValid(time)
  if (!isValid) {
    throw new Error('Invalid Date')
  }
  return dayjs(time).endOf(unit)
}

// 时间差
export function getDiffTime(time1: TimeLike, time2: TimeLike, options?: {
  unit: dayjs.OpUnitType
  float: boolean
}): number {
  const isValid = isDateValid(time1) && isDateValid(time2)
  if (!isValid) {
    throw new Error('Invalid Date')
  }
  // 不传 options → 走原生 diff()
  if (!options) {
    return dayjs(time2).diff(time1)
  }
  const { unit, float } = options
  // 只传了 float，没传 unit
  if (isUndefined(unit) && !isUndefined(float)) {
    return dayjs(time2).diff(time1, 'day', float)
  }
  // 正常传 unit + float
  return dayjs(time2).diff(time1, unit, float)
}
