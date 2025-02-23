type NumberType = number | string

let _boundaryCheckingState = true
/**
 *
 * @param num NumberType
 * @param precision number
 * @returns number
 */
function strip(num: NumberType, precision = 15): number {
  return +Number.parseFloat(Number(num).toPrecision(precision))
}

/**
 *
 * @param num NumberType
 * @returns number
 */
function digitLength(num: NumberType): number {
  // Get digit length of e
  const eSplit = num.toString().split(/e/i)
  const len = (eSplit[0].split('.')[1] || '').length - +(eSplit[1] || 0)
  return len > 0 ? len : 0
}

/**
 *
 * @param num NumberType
 * @returns number
 */
function float2Fixed(num: NumberType): number {
  if (!num.toString().includes('e')) {
    return Number(num.toString().replace('.', ''))
  }
  const dLen = digitLength(num)
  return dLen > 0 ? strip(Number(num) * 10 ** dLen) : Number(num)
}

/**
 *
 * @param num number
 */
function checkBoundary(num: number) {
  if (_boundaryCheckingState) {
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      console.warn(`${num} is beyond boundary when transfer to integer, the results may not be accurate`)
    }
  }
}

/**
 *
 * @param operation function
 * @returns function
 */
function createOperation(operation: (n1: NumberType, n2: NumberType) => number): (...nums: NumberType[]) => number {
  return (...nums: NumberType[]) => {
    const [first, ...others] = nums
    return others.reduce((prev, next) => operation(prev || 0, next || 0), first) as number
  }
}

const times = createOperation((num1, num2) => {
  const num1Changed = float2Fixed(num1)
  const num2Changed = float2Fixed(num2)
  const baseNum = digitLength(num1) + digitLength(num2)
  const leftValue = num1Changed * num2Changed

  checkBoundary(leftValue)

  return leftValue / 10 ** baseNum
})

const plus = createOperation((num1, num2) => {
  // 取最大的小数位
  const baseNum = 10 ** Math.max(digitLength(num1), digitLength(num2))
  // 把小数都转为整数然后再计算
  return (times(num1, baseNum) + times(num2, baseNum)) / baseNum
})

const minus = createOperation((num1, num2) => {
  const baseNum = 10 ** Math.max(digitLength(num1), digitLength(num2))
  return (times(num1, baseNum) - times(num2, baseNum)) / baseNum
})

const divide = createOperation((num1, num2) => {
  const num1Changed = float2Fixed(num1)
  const num2Changed = float2Fixed(num2)

  checkBoundary(num1Changed)
  checkBoundary(num2Changed)

  // fix: 类似 10 ** -4 为 0.00009999999999999999，strip 修正
  return times(num1Changed / num2Changed, strip(10 ** (digitLength(num2) - digitLength(num1))))
})

function round(num: NumberType, decimal: number): number {
  const base = 10 ** decimal
  let result = divide(Math.round(Math.abs(times(num, base))), base)

  if (+num < 0 && result !== 0) {
    result = times(result, -1)
  }

  return result
}

function truncateDecimal(num: NumberType, places: number): number {
  return Math.trunc(times(num, 10 ** places)) / 10 ** places
}

function enableBoundaryChecking(flag = true) {
  _boundaryCheckingState = flag
}

export { digitLength, divide, enableBoundaryChecking, float2Fixed, minus, plus, round, strip, times, truncateDecimal }

export default {
  strip,
  plus,
  minus,
  times,
  divide,
  round,
  digitLength,
  float2Fixed,
  truncateDecimal,
  enableBoundaryChecking,
}
