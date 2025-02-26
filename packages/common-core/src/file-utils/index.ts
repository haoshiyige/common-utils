import { ObjectUtils } from '../object'
import { isNull, isString } from '@nin/shared'
import { FunctionUtils } from '../function'
/**
 * 定义扩展名到文本 MIME 类型的映射。
 */
interface MapExtToMediaMimes {
    [index: string]: string
}

/**
 * @deprecated FileTools 类提供了一系列用于处理文件、Base64 编码/解码、Blob 和 File 对象之间转换的静态方法。
 */
export class FileTools {
    /**
     * 映射常见文本文件扩展名到相应的 MIME 类型。
     */
    static mapExtToMediaMimes: MapExtToMediaMimes = ObjectUtils.freeze({
        '.aac': 'audio/x-aac',
        '.avi': 'video/x-msvideo',
        '.bmp': 'image/bmp',
        '.flv': 'video/x-flv',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.jpe': 'image/jpg',
        '.jpeg': 'image/jpg',
        '.jpg': 'image/jpg',
        '.m1v': 'video/mpeg',
        '.m2a': 'audio/mpeg',
        '.m2v': 'video/mpeg',
        '.m3a': 'audio/mpeg',
        '.mid': 'audio/midi',
        '.midi': 'audio/midi',
        '.mk3d': 'video/x-matroska',
        '.mks': 'video/x-matroska',
        '.mkv': 'video/x-matroska',
        '.mov': 'video/quicktime',
        '.movie': 'video/x-sgi-movie',
        '.mp2': 'audio/mpeg',
        '.mp2a': 'audio/mpeg',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.mp4a': 'audio/mp4',
        '.mp4v': 'video/mp4',
        '.mpe': 'video/mpeg',
        '.mpeg': 'video/mpeg',
        '.mpg': 'video/mpeg',
        '.mpg4': 'video/mp4',
        '.mpga': 'audio/mpeg',
        '.oga': 'audio/ogg',
        '.ogg': 'audio/ogg',
        '.opus': 'audio/opus',
        '.ogv': 'video/ogg',
        '.png': 'image/png',
        '.psd': 'image/vnd.adobe.photoshop',
        '.qt': 'video/quicktime',
        '.spx': 'audio/ogg',
        '.svg': 'image/svg+xml',
        '.tga': 'image/x-tga',
        '.tif': 'image/tiff',
        '.tiff': 'image/tiff',
        '.wav': 'audio/x-wav',
        '.webm': 'video/webm',
        '.webp': 'image/webp',
        '.wma': 'audio/x-ms-wma',
        '.wmv': 'video/x-ms-wmv',
        '.woff': 'application/font-woff'
    })

    /**
     * 定义常见的 MIME 类型常量。
     */
    static Mimes = ObjectUtils.freeze({
        text: 'text/plain',
        binary: 'application/octet-stream',
        unknown: 'application/unknown',
        markdown: 'text/markdown',
        latex: 'text/latex',
        uriList: 'text/uri-list'
    })

    /**
     * 映射常见文本文件扩展名到相应的 MIME 类型。
     */
    static mapExtToTextMimes: MapExtToMediaMimes = ObjectUtils.freeze({
        '.css': 'text/css',
        '.csv': 'text/csv',
        '.htm': 'text/html',
        '.html': 'text/html',
        '.ics': 'text/calendar',
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.txt': 'text/plain',
        '.xml': 'text/xml'
    })

    /**
     * 根据文件路径获取其对应的文本或媒体 MIME 类型。
     *
     * @param {string} path - 文件路径。
     * @returns {string | undefined} - 对应的 MIME 类型，如果找不到则返回 `undefined`。
     */
    static getMediaOrTextMime(path: string): string | undefined {
        const ext = FileTools.extname(path)
        const textMime = FileTools.mapExtToTextMimes[ext.toLowerCase()]
        if (textMime !== undefined) {
            return textMime
        } else {
            return FileTools.getMediaMime(path)
        }
    }

    /**
     * 格式化文件大小为易读的形式。
     *
     * 此函数接受一个数字类型的文件大小，并将其转换为带有单位（如KB, MB, GB等）的字符串形式。
     * 如果文件大小小于1024字节，则直接返回以字节(B)为单位的值。否则，依次尝试使用KB、MB、GB等更大的单位，
     * 直到找到合适的单位为止。
     *
     * @param size - 文件大小，以字节为单位。
     * @param fixed - 小数点后保留的位数，默认为2。
     * @returns 返回格式化的文件大小字符串。
     *
     * @example
     * // 测试案例
     * console.log(formatFileSize(1023)); // "1023.00B"
     * console.log(formatFileSize(1024)); // "1.00KB"
     * console.log(formatFileSize(1048576)); // "1.00MB"
     * console.log(formatFileSize(1073741824)); // "1.00GB"
     *
     * // 错误案例
     * // 输入负数或非数值类型将导致错误
     * console.log(formatFileSize(-1)); // 可能导致不准确的结果
     * console.log(formatFileSize("1024" as any)); // 运行时错误
     */
    static formatFileSize = (size: number, fixed: number = 2): string => {
        if (isString(size) || isNull(size)) {
            throw new Error('Invalid file size provided.')
        }
        if (size < 0) {
            throw new Error('File size cannot be negative.')
        }
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
        let i = 0
        while (size >= 1024 && i < units.length - 1) {
            size /= 1024
            i++
        }
        return `${size.toFixed(fixed)}${units[i]}`
    }

    /**
     * 文件下载
     * @param fileName 文件名称
     * @param content 文件流内容 || url
     * @param isStream 是否为流下载
     */
    static download = ({ fileName, content }: { fileName: string; content: string }) => {
        const blob = new Blob([content])
        if ('download' in document.createElement('a')) {
            //非IE下载
            const elink = document.createElement('a')
            elink.download = fileName
            elink.style.display = 'none'
            elink.href = URL.createObjectURL(blob)
            elink.addEventListener('click', e => {
                e.stopImmediatePropagation()
            })
            document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(elink.href) //释放URL 对象
            document.body.removeChild(elink)
        } else {
            //IE10+下载
            // @ts-ignore
            window.navigator?.msSaveBlob(blob, fileName)
        }
    }

    /**
     * 根据文件路径获取其对应的媒体 MIME 类型。
     *
     * @param {string} path - 文件路径。
     * @returns {string | undefined} - 对应的 MIME 类型，如果找不到则返回 `undefined`。
     */
    static getMediaMime(path: string): string | undefined {
        const ext = FileTools.extname(path)
        return FileTools.mapExtToMediaMimes[ext.toLowerCase()]
    }
    /**
     * 根据 MIME 类型获取其对应的标准文件扩展名。
     *
     * @param {string} mimeType - MIME 类型。
     * @returns {string | undefined} - 对应的文件扩展名（包含点），如果找不到则返回 `undefined`。
     */
    static getExtensionForMimeType(mimeType: string): string | undefined {
        for (const extension in FileTools.mapExtToMediaMimes) {
            if (FileTools.mapExtToMediaMimes[extension] === mimeType) {
                return extension
            }
        }
        return undefined
    }

    /**
     * 规范化 MIME 类型字符串。
     *
     * 该函数会将 MIME 类型中的 media 和 subtype 转换为小写，并保留参数部分不变。
     * 如果传入的 MIME 类型不符合标准格式（例如缺少 `/`），则根据 `strict` 参数决定是否返回 `undefined`。
     *
     * @param {string} mimeType - 要规范化的 MIME 类型字符串。
     * @param {boolean} [strict] - 是否严格检查 MIME 类型格式。如果为 `true`，不符合格式的 MIME 类型将返回 `undefined`。
     * @returns {string | undefined} - 规范化后的 MIME 类型字符串，或在严格模式下返回 `undefined`。
     */
    static normalizeMimeType(mimeType: string, strict?: true): string | undefined
    static normalizeMimeType(mimeType: string, strict: true): string | undefined
    static normalizeMimeType(mimeType: string, strict = false): string | undefined {
        const match = /^(.+)\/(.+?)(;.+)?$/i.exec(mimeType)
        if (!match) return strict ? undefined : mimeType
        // 根据 RFC 2045，media 和 subtype 必须始终为小写，参数部分保持不变
        return `${match[1].toLowerCase()}/${match[2].toLowerCase()}${match[3] ?? ''}`
    }

    /**
     * 获取文件路径的扩展名。
     *
     * @param {string} filePath - 文件路径。
     * @returns {string} - 文件的扩展名（包含 `.`），如果没有扩展名则返回空字符串。
     * // 测试用例
     * console.log(extname('index.html'));          // 输出: .html
     * console.log(extname('archive.tar.gz'));      // 输出: .gz
     * console.log(extname('filename'));            // 输出: ''
     * console.log(extname('path/to/file.txt'));    // 输出: .txt
     * console.log(extname('path/to/.hiddenfile')); // 输出: ''
     * console.log(extname('path/to/filename.'));   // 输出: .
     * console.log(extname('path/to/filename..'));  // 输出: ..
     * console.log(extname('path/to/filename/'));   // 输出: ''
     * console.log(extname('path\\to\\file.txt'));  // 输出: .txt
     * console.log(extname(''));                    // 输出: ''
     */

    static extname(filePath: string): string {
        // 处理特殊情况：空字符串或以斜杠结尾的路径
        if (!filePath || filePath.endsWith('/') || filePath.endsWith('\\')) {
            return ''
        }
        // 查找最后一个斜杠的位置（支持 Windows 和 Unix 风格的路径）
        const lastSlashIndex = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
        // 查找最后一个点的位置
        const lastDotIndex = filePath.lastIndexOf('.')
        // 如果没有点，或者点在最后一个斜杠之前，返回空字符串
        if (lastDotIndex === -1 || (lastSlashIndex !== -1 && lastDotIndex < lastSlashIndex)) {
            return ''
        }
        // 返回从最后一个点开始到末尾的部分
        return filePath.substring(lastDotIndex)
    }

    /**
     * 将字符串编码为 Base64 格式。
     *
     * @param {string} str - 要编码的字符串。
     * @returns {string} - 编码后的 Base64 字符串。
     */
    static btoaBase64(str: string): string {
        return btoa(
            encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, match => String.fromCharCode(parseInt(match.slice(1), 16)))
        )
    }

    /**
     * 将 Base64 编码的字符串解码为原始字符串。
     *
     * @param {string} str - 要解码的 Base64 字符串。
     * @returns {string} - 解码后的原始字符串。
     */

    static atobBase64(str: string): string {
        const base64 = str.includes(';base64,') ? str.replace(/^data:.*?;base64,/, '') : str
        return decodeURIComponent(
            Array.from(atob(base64))
                .map(char => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        )
    }

    /**
     * 将 Base64 编码的图片数据转换为 Blob 对象。
     *
     * @param {string} dataURL - 包含 Base64 编码的图片数据的 Data URL。
     * @returns {Blob} - 转换后的 Blob 对象。
     */
    static base64ToBlob(dataURL: string): Blob {
        if (!dataURL.includes(';base64,')) {
            console.warn('base64格式错误,不包含base64,')
            return new Blob([], { type: 'application/octet-stream' })
        }
        const [header, base64Data] = dataURL.split(';base64,')
        const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream'
        const byteString = atob(base64Data)
        const arrayBuffer = new Uint8Array(byteString.length)
        for (let i = 0; i < byteString.length; i++) {
            arrayBuffer[i] = byteString.charCodeAt(i)
        }
        return new Blob([arrayBuffer], { type: mimeType })
    }

    /**
     * 将 Blob 对象转换为 File 对象。
     *
     * @param {Blob} blob - 要转换的 Blob 对象。
     * @param {string} fileName - 文件名。
     * @returns {File} - 转换后的 File 对象。
     */
    static blobToFile(blob: Blob, fileName: string): File {
        return new File([blob], fileName, { type: blob.type })
    }

    /**
     * 将 Base64 编码的图片数据转换为 File 对象。
     *
     * @param {string} base64Data - 包含 Base64 编码的图片数据的 Data URL。
     * @param {string} fileName - 文件名。
     * @returns {File} - 转换后的 File 对象。
     */
    static base64ToFile(base64Data: string, fileName: string): File {
        const blob = FileTools.base64ToBlob(base64Data)
        return FileTools.blobToFile(blob, fileName)
    }

    /**
     * 将 Base64 编码的图片数据转换为 URL。
     *
     * @param {string} base64 - 包含 Base64 编码的图片数据的 Data URL。
     * @param {string} fileName - 文件名。
     * @returns {string} - 转换后的 URL。
     */
    static base64ToUrl(base64: string, fileName: string): string {
        const blob = FileTools.base64ToFile(base64, fileName)
        return URL.createObjectURL(blob)
    }

    /**
     * 将 File 或 Blob 对象转换为 Base64 编码的字符串。
     *
     * @param {File | Blob} fileOrBlob - 要转换的 File 或 Blob 对象。
     * @returns {Promise<string>} - 返回一个 Promise，解析为 Base64 编码的字符串。
     */
    static toBase64(fileOrBlob: File | Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(fileOrBlob)
            reader.onload = () => {
                const base64Data = reader.result?.toString().split(',')[1] // 提取 Base64 数据部分
                resolve(base64Data || '')
            }
            reader.onerror = error => {
                reject(new Error(`Failed to convert to Base64: ${error}`))
            }
        })
    }

    /**
     * 将 File 对象转换为 Blob 对象。
     *
     * @param {File} file - 要转换的 File 对象。
     * @returns {Promise<Blob>} - 返回一个 Promise，解析为 Blob 对象。
     */
    static fileToBlob(file: File): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer
                const blob = new Blob([new Uint8Array(arrayBuffer)], { type: file.type })
                resolve(blob)
            }
            reader.onerror = () => {
                reject(new Error('Failed to convert File to Blob'))
            }
            reader.readAsArrayBuffer(file)
        })
    }

    /**
     * 将 JavaScript 对象转换为 FormData 对象。
     *
     * @param {Record<string, any>} obj - 需要转换的 JavaScript 对象，其键值对将被转换为 FormData 对象中的键值对。
     * @returns {FormData} - 转换后的 FormData 对象，可用于网络请求等。
     */
    static handleObjectToFormData(obj: Record<string, any>): FormData {
        const formData = new FormData()
        Object.keys(obj).forEach(key => {
            const value = obj[key]
            if (value instanceof File || value instanceof Blob) {
                formData.append(key, value, (value as File).name || key)
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    if (item instanceof File || item instanceof Blob) {
                        formData.append(`${key}[${index}]`, item, (item as File).name || `${key}[${index}]`)
                    } else {
                        formData.append(`${key}[${index}]`, item)
                    }
                })
            } else {
                formData.append(key, value)
            }
        })
        return formData
    }

    /**
     * @description file 转化为base64
     * @param file {File} 文件
     * @returns promise {Promise<>}} 返回 base64
     * */
    static fileToBase64(file: File): Promise<any> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = function () {
                resolve(reader.result)
            }
            reader.onerror = function (error) {
                reject(error)
            }
            reader.onloadend = function () {
                resolve(reader.result)
            }
        })
    }


    /**
     * 加载图像并在加载完成后调用回调函数。
     * 
     * @param src 图像的URL地址。
     * @param cb 回调函数，接收错误（如果有）和加载的图像对象。默认为noop。
     */
    static loadImg(src: string, cb: (err: Error | null, img?: HTMLImageElement) => void = FunctionUtils.noop): void {
        const img = new Image();
        img.onload = function () {
            cb(null, img);
        };
        img.onerror = function (errEvent) {
            const err = new Error(`Failed to load image: ${src}`);
            err.name = 'ImageLoadError';
            cb(err);
        };
        img.src = src;
    }

}
