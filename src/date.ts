import dayjs from 'dayjs'

export function isDateValid(time: number | string | Date) {
  const date = dayjs(time)
  return date.isValid()
}

// 格式化时间
export function formatDate(time: number | string, format = 'YYYY-MM-DD') {
  try {
    const isValid = isDateValid(time)
    if (!isValid) {
      throw new Error('Invalid Date')
    }
    return dayjs(time).format(format)
  }
  catch (error) {
    console.error(`Error formatting date: ${error}`)
    return time
  }
}

// unix时间转年月日
export function formatUnixDate(time: number, format = 'YYYY-MM-DD') {
  try {
    const isValid = isDateValid(time)
    if (!isValid) {
      throw new Error('Invalid Date')
    }
    return dayjs.unix(time).format(format)
  }
  catch (error) {
    console.error(`Error formatting date: ${error}`)
    return time
  }
}

// 获取日期对应的年月日
export function getYMD(val: number | string | Date) {
  try {
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
  catch (error) {
    console.error(`Error formatting date: ${error}`)
    return val
  }
}

// 获取时间戳 秒
export function getDateStamp(time: number | string | Date) {
  try {
    const isValid = isDateValid(time)
    if (!isValid) {
      throw new Error('Invalid Date')
    }
    return dayjs(time).valueOf()
  }
  catch (error) {
    console.error(`Error formatting date: ${error}`)
    return time
  }
}

// 获取时间戳 毫秒
export function getDateUnixStamp(time: number | string | Date) {
  try {
    const isValid = isDateValid(time)
    if (!isValid) {
      throw new Error('Invalid Date')
    }
    return dayjs(time).unix()
  }
  catch (error) {
    console.error(`Error formatting date: ${error}`)
    return time
  }
}
