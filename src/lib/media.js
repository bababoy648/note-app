const MAX_BYTES = 2 * 1024 * 1024

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_BYTES) {
      reject(new Error(`文件过大（最大 ${Math.round(MAX_BYTES / 1024 / 1024)}MB）`))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

export function createMediaItem({ type, name, url, mimeType, size }) {
  return { type, name, url, mimeType: mimeType || '', size: size || 0 }
}
