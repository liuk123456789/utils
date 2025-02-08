interface DownloadOptions<T = string> {
  fileName?: string
  source: T
  target?: string
}

interface OpenWindowOptions {
  noopener?: boolean
  noreferrer?: boolean
  target?: '_blank' | '_parent' | '_self' | '_top' | string
}

const DEFAULT_FILENAME = 'downloaded_file'

/**
 * 新窗口打开URL。
 *
 * @param url - 需要打开的网址。
 * @param options - 打开窗口的选项。
 */
function openWindow(url: string, options: OpenWindowOptions = {}): void {
  // 解构并设置默认值
  const { noopener = true, noreferrer = true, target = '_blank' } = options

  // 基于选项创建特性字符串
  const features = [noopener && 'noopener=yes', noreferrer && 'noreferrer=yes']
    .filter(Boolean)
    .join(',')

  // 打开窗口
  window.open(url, target, features)
}

/**
 * 通过 URL 下载文件，支持跨域
 * @throws {Error} - 当下载失败时抛出错误
 */
export async function downloadFileFromUrl({
  fileName,
  source,
  target = '_blank',
}: DownloadOptions): Promise<void> {
  if (!source || typeof source !== 'string') {
    throw new Error('Invalid URL.')
  }

  const isChrome = window.navigator.userAgent.toLowerCase().includes('chrome')
  const isSafari = window.navigator.userAgent.toLowerCase().includes('safari')

  if (/iP/.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!')
    return
  }

  if (isChrome || isSafari) {
    triggerDownload(source, resolveFileName(source, fileName))
    return
  }
  if (!source.includes('?')) {
    source += '?download'
  }

  openWindow(source, { target })
}

/**
 * 通过 Base64 下载文件
 */
export function downloadFileFromBase64({ fileName, source }: DownloadOptions) {
  if (!source || typeof source !== 'string') {
    throw new Error('Invalid Base64 data.')
  }

  const resolvedFileName = fileName || DEFAULT_FILENAME
  triggerDownload(source, resolvedFileName)
}

/**
 * 下载文件，支持 Blob、字符串和其他 BlobPart 类型
 */
export function downloadFileFromBlobPart({
  fileName = DEFAULT_FILENAME,
  source,
}: DownloadOptions<BlobPart>): void {
  // 如果 data 不是 Blob，则转换为 Blob
  const blob
    = source instanceof Blob
      ? source
      : new Blob([source], { type: 'application/octet-stream' })

  // 创建对象 URL 并触发下载
  const url = URL.createObjectURL(blob)
  triggerDownload(url, fileName)
}

/**
 * img url to base64
 * @param url
 */
export function urlToBase64(url: string, mineType?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement('CANVAS') as HTMLCanvasElement | null
    const ctx = canvas?.getContext('2d')
    const img = new Image()
    img.crossOrigin = ''
    img.addEventListener('load', () => {
      if (!canvas || !ctx) {
        return reject(new Error('Failed to create canvas.'))
      }
      canvas.height = img.height
      canvas.width = img.width
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL(mineType || 'image/png')
      canvas = null
      resolve(dataURL)
    })
    img.src = url
  })
}

/**
 * 通用下载触发函数
 * @param href - 文件下载的 URL
 * @param fileName - 下载文件的名称，如果未提供则自动识别
 * @param revokeDelay - 清理 URL 的延迟时间 (毫秒)
 */
export function triggerDownload(
  href: string,
  fileName: string | undefined,
  revokeDelay: number = 100,
): void {
  const finalFileName = fileName || DEFAULT_FILENAME

  const link = document.createElement('a')
  link.href = href
  link.download = finalFileName
  link.style.display = 'none'

  if (link.download === undefined) {
    link.setAttribute('target', '_blank')
  }

  document.body.append(link)
  link.click()
  link.remove()

  // 清理临时 URL 以释放内存
  setTimeout(() => URL.revokeObjectURL(href), revokeDelay)
}

function resolveFileName(url: string, fileName?: string): string {
  return fileName || url.slice(url.lastIndexOf('/') + 1) || DEFAULT_FILENAME
}
