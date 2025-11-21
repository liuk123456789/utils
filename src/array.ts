import type { Arrayable, Nullable } from './types'

export function toArray<T>(array?: Nullable<Arrayable<T>>): Array<T> {
  array = array ?? []
  return Array.isArray(array) ? array : [array]
}

export function at(array: readonly [], index: number): undefined
export function at<T>(array: readonly T[], index: number): T
export function at<T>(array: readonly T[] | [], index: number): T | undefined {
  const len = array.length
  if (!len)
    return undefined

  if (index < 0)
    index += len

  return array[index]
}

export function first(array: readonly []): undefined
export function first<T>(array: readonly T[]): T
export function first<T>(array: readonly T[]): T | undefined {
  return at(array, 0)
}


export function last(array: readonly []): undefined
export function last<T>(array: readonly T[]): T
export function last<T>(array: readonly T[]): T | undefined {
  return at(array, -1)
}


/**
 * 扁平化数组
 * @param arr { Array}
 * @param deep { Number }
 * @returns Array
 */
export function flatArray<T>(arr: T[], deep: number): T[] {
  if (deep <= 0)
    return arr
  const res = []
  for (const item of arr) {
    res.push(...(Array.isArray(item) ? flatArray(item, deep - 1) : [item]))
  }
  return res
}

// 定义数组项的接口
interface ArrayItem {
  id: string | number
  parentId: string | number | null
  [key: string]: any
}

// 定义树节点的接口
interface TreeNode extends ArrayItem {
  children?: TreeNode[]
}

/**
 * 将扁平数组转换为树形结构
 * @param items 扁平数组
 * @param options 配置选项
 * @param options.idKey 默认'id'
 * @param options.parentIdKey 默认'parentId'
 * @param options.childrenKey 默认'children'
 * @param options.rootId 默认0
 * @returns 树形结构数组
 */
export function arrayToTree<T extends ArrayItem>(
  items: T[],
  options: {
    idKey?: string
    parentIdKey?: string
    childrenKey?: string
    rootId?: string | number | null | (string | number | null)[]
  } = {},
): TreeNode[] {
  const {
    idKey = 'id',
    parentIdKey = 'parentId',
    childrenKey = 'children',
    rootId = null,
  } = options

  // 将rootId转换为数组，以支持多个根节点标识符
  const rootIds = Array.isArray(rootId) ? rootId : [rootId]

  // 使用Map作为节点映射
  const itemMap = new Map<string | number, TreeNode>()
  const result: TreeNode[] = []

  // 单次遍历
  for (const item of items) {
    const id = item[idKey]
    const parentId = item[parentIdKey]

    // 创建当前节点（如果已存在则获取）
    if (!itemMap.has(id)) {
      itemMap.set(id, { ...item })
    }
    else {
      // 合并已存在的节点（可能是之前作为父节点创建的空节点）
      Object.assign(itemMap.get(id)!, item)
    }

    const currentNode = itemMap.get(id)!

    // 检查是否为根节点
    if (rootIds.includes(parentId)) {
      result.push(currentNode)
    }
    // 如果有父节点
    else if (parentId !== undefined) {
      // 确保父节点存在于映射中
      if (!itemMap.has(parentId)) {
        // 创建一个临时的父节点，后续会被实际数据替换
        itemMap.set(parentId, { [idKey]: parentId, [parentIdKey]: null } as any)
      }

      const parentNode = itemMap.get(parentId)!

      // 确保父节点有children数组
      if (!parentNode[childrenKey]) {
        parentNode[childrenKey] = []
      }

      // 将当前节点添加到父节点的children中
      parentNode[childrenKey].push(currentNode)
    }
    // 如果parentId不是根标识符且未定义，则作为根节点
    else {
      result.push(currentNode)
    }
  }

  // 过滤掉result中的临时节点（那些只有id和parentId的节点）
  return result.filter((node) => {
    // 检查节点是否是完整的原始数据，而不是我们创建的临时节点
    // 这里假设原始数据至少有3个属性（id, parentId, 和至少一个其他属性）
    return Object.keys(node).length > 2
  })
}

/**
 * 树形结构数组平铺
 *
 */

export function treeToArray<T extends TreeNode>(
  tree: T[],
  options: {
    childrenKey?: string
    parentIdKey?: string
  } = {},
): ArrayItem[] {
  const { childrenKey = 'children', parentIdKey = 'parentId' } = options
  const result: ArrayItem[] = []
  const stack: [T, string | number | null][] = tree.map(node => [node, null])

  while (stack.length > 0) {
    const [node, parentId] = stack.pop()!

    // 创建扁平项
    const flatItem: ArrayItem = { ...node, [parentIdKey]: parentId }

    // 获取并删除children属性
    const children = flatItem[childrenKey]
    delete flatItem[childrenKey]

    // 添加到结果数组
    result.push(flatItem)

    // 将子节点添加到栈中
    if (children && Array.isArray(children) && children.length > 0) {
      // 倒序添加，保证处理顺序与递归版本一致
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push([children[i], node.id])
      }
    }
  }

  return result
}


