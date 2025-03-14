/**
 * 深拷贝函数
 * @param obj 需要深拷贝的对象
 * @returns 深拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  // 处理非对象类型（基本类型、函数）
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 使用 WeakMap 处理循环引用
  const hash = new WeakMap<object, any>()

  function clone<U>(value: U, map: WeakMap<object, any>): U {
    // 处理非对象类型
    if (value === null || typeof value !== 'object') {
      return value
    }

    // 检查循环引用
    if (map.has(value as object)) {
      return map.get(value as object)
    }

    // 获取对象的构造函数
    const proto = Object.getPrototypeOf(value)
    const constructor = proto?.constructor

    // 处理特殊内置对象

    // 处理日期对象
    if (value instanceof Date) {
      return new Date(value.getTime()) as unknown as U
    }

    // 处理正则表达式
    if (value instanceof RegExp) {
      return new RegExp(value.source, value.flags) as unknown as U
    }

    // 处理 Map
    if (value instanceof Map) {
      const mapResult = new Map()
      map.set(value as object, mapResult)

      value.forEach((val, key) => {
        mapResult.set(
          typeof key === 'object' && key !== null ? clone(key, map) : key,
          clone(val, map),
        )
      })

      return mapResult as unknown as U
    }

    // 处理 Set
    if (value instanceof Set) {
      const setResult = new Set()
      map.set(value as object, setResult)

      value.forEach((val) => {
        setResult.add(clone(val, map))
      })

      return setResult as unknown as U
    }

    // 处理 ArrayBuffer
    if (value instanceof ArrayBuffer) {
      const result = value.slice(0)
      map.set(value as object, result)
      return result as unknown as U
    }

    // 处理 TypedArray
    if (
      ArrayBuffer.isView(value)
      && !(value instanceof DataView)
    ) {
      const typedArray = value as any
      const result = new (constructor as any)(
        typedArray.buffer.slice(0),
        typedArray.byteOffset,
        typedArray.length,
      )
      map.set(value as object, result)
      return result as unknown as U
    }

    // 处理 DataView
    if (value instanceof DataView) {
      const result = new DataView(
        value.buffer.slice(0),
        value.byteOffset,
        value.byteLength,
      )
      map.set(value as object, result)
      return result as unknown as U
    }

    // 处理 Error 对象
    if (value instanceof Error) {
      const result = Object.create(proto)
      map.set(value as object, result)

      // 复制 Error 对象的属性
      Object.getOwnPropertyNames(value).forEach((key) => {
        result[key] = clone((value as any)[key], map)
      })

      return result as unknown as U
    }

    // 处理 Promise 和其他不可序列化的对象
    if (
      value instanceof Promise
      || value instanceof WeakMap
      || value instanceof WeakSet
      // DOM 节点 (仅在浏览器环境)
      || (typeof window !== 'undefined' && typeof Node !== 'undefined' && value instanceof Node)
    ) {
      // 这些对象无法深拷贝，返回原始引用
      return value
    }

    try {
      // 尝试使用原构造函数创建新实例
      let result: any

      if (Array.isArray(value)) {
        result = []
      }
      else if (constructor && constructor !== Object) {
        // 使用构造函数创建实例
        try {
          result = new (constructor as any)()
        }
        catch (error) {
          // 如果构造函数需要参数，使用 Object.create
          result = Object.create(proto)
          console.error(error)
        }
      }
      else {
        // 普通对象
        result = {}
      }

      // 将当前对象加入 WeakMap，处理循环引用
      map.set(value as object, result)

      // 递归处理所有属性
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          result[i] = clone(value[i], map)
        }
      }
      else {
        // 获取所有属性，包括 Symbol 类型的键
        const allKeys = [
          ...Object.getOwnPropertyNames(value),
          ...Object.getOwnPropertySymbols(value),
        ]

        for (const key of allKeys) {
          // 获取属性描述符
          const descriptor = Object.getOwnPropertyDescriptor(value, key)

          // 如果有描述符且可配置
          if (descriptor) {
            if (descriptor.get || descriptor.set) {
              // 处理 getter/setter
              Object.defineProperty(result, key, descriptor)
            }
            else {
              // 处理普通属性
              result[key] = clone((value as any)[key], map)
            }
          }
        }
      }

      return result
    }
    catch (error) {
      // 如果构造函数无法调用，回退到普通对象
      console.warn(`${error}：Cannot clone instance of ${constructor?.name || 'Unknown'}, falling back to plain object`)
      const result: Record<string | symbol, any> = {}
      map.set(value as object, result)

      // 获取所有属性
      const allKeys = [
        ...Object.getOwnPropertyNames(value),
        ...Object.getOwnPropertySymbols(value),
      ]

      for (const key of allKeys) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key)
        if (descriptor && !descriptor.get && !descriptor.set) {
          result[key] = clone((value as any)[key], map)
        }
      }

      return result as unknown as U
    }
  }

  return clone(obj, hash)
}
