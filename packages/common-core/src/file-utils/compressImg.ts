
import { FileTools } from "./index"
import { FunctionUtils } from "../function/index";
import { isBlob, isFile, isFunction, isString } from "@nin/shared"
import { ArrayUtils } from "../ArrayUtils/common";

function createUrl(data: any, options = {}) {
    options = {
        ...options,
        defOpts
    }
    if (!isBlob(data) && !isFile(data)) {
        data = new Blob(ArrayUtils.toArray(data), options);
    }
    return URL.createObjectURL(data);
};

const defOpts = {
    type: 'text/plain'
};



interface CompressOptions {
    maxWidth?: number;
    maxHeight?: number;
    width?: number;
    height?: number;
    mimeType?: string;
    quality?: number;
    isUrl?: boolean;
}
// @ts-ignore
const defOptions: Required<CompressOptions> = {
    maxWidth: Infinity,
    maxHeight: Infinity,
    quality: 0.8
};

function compress(img: HTMLImageElement, options: Required<CompressOptions>, cb: (err: Error | null, file?: Blob) => void): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return cb(new Error('Canvas context not available'));
    let width = img.width;
    let height = img.height;
    const ratio = width / height;
    const { maxWidth, maxHeight } = options;
    if (options.width || options.height) {
        if (options.width) {
            width = options.width;
            height = width / ratio;
        } else if (options.height) {
            height = options.height;
            width = height * ratio;
        }
    } else {
        if (width > maxWidth) {
            width = maxWidth;
            height = width / ratio;
        }
        if (height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
        }
    }
    width = Math.floor(width);
    height = Math.floor(height);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    if (window.URL && options.isUrl) {
        window.URL.revokeObjectURL(img.src);
    }
    if (canvas.toBlob) {
        try {
            canvas.toBlob(
                function (blob) {
                    // @ts-ignore
                    cb(null, blob);
                },
                options.mimeType,
                options.quality
            );
        } catch (e) {
            cb(e as Error);
        }
    } else {
        cb(new Error('Canvas toBlob is not supported'));
    }
}

export default function (file: string | Blob, options?: Partial<CompressOptions> | Function, cb?: (err: Error | null, result?: Blob | undefined) => void): void {
    if (isFunction(options)) {
        // @ts-ignore
        cb = options;
        options = {};
    }
    cb = cb || FunctionUtils.noop;
    options = options ? { ...defOptions, ...options } : defOptions;

    options.mimeType = options.mimeType || typeof file === 'string' ? '' : (file as Blob).type;
    if (isString(file)) {
        options.isUrl = true;
    } else {
        file = createUrl(file);
    }
    FileTools.loadImg(file, function (err, img) {
        if (err) return cb(err);
        if (img instanceof HTMLImageElement) {
            compress(img, options as Required<CompressOptions>, cb);
        } else {
            cb(new Error('Invalid image element'));
        }
    });
}