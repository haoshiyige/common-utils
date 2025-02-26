import { isFunction, checkNewCall } from "@nin/shared";

interface RequestConfig extends Record<string, any> {
    url: string;
}

type PostProcessFn = (response: any, prevData: any, bucket: Bucket) => Promise<void>;
type ParamsFn = (config: RequestConfig, bucket: Bucket) => Promise<RequestConfig>;

/**
 * 存储桶类，用于存储键值对。
 */
class Bucket {
    private items: Map<string, any>;

    constructor() {
        this.items = new Map();
    }

    /**
     * 添加一个项到存储桶中。如果键已存在，则不会添加并警告用户。
     * @param key - 存储桶中的键。
     * @param value - 要存储的值。
     */
    addItem(key: string, value: any): void {
        if (!this.items.has(key)) {
            this.items.set(key, value);
        } else {
            console.warn(`Key ${key} already exists.`);
        }
    }

    /**
     * 根据键获取存储桶中的值。
     * @param key - 存储桶中的键。
     * @returns 对应键的值，如果没有找到则返回undefined。
     */
    getItem(key: string): any {
        return this.items.get(key);
    }
}

class RequestError extends Error {
    constructor(message: string, public readonly url: string) {
        super(`Request to ${url} failed: ${message}`);
        this.name = 'RequestError';
    }
}

/**
 * 请求队列类，用于按顺序执行HTTP请求。
 */
@checkNewCall()
export class RequestQueue {
    private _processingPromise: Promise<any>;
    private bucket: Bucket;
    private httpInstance: { request: (config: RequestConfig) => Promise<any> };

    /**
     * 构造函数
     * @param httpInstance - HTTP请求实例，默认为默认的httpInstance。
     */
    constructor(httpInstance: { request: (config: RequestConfig) => Promise<any> }) {
        this._processingPromise = Promise.resolve();
        this.bucket = new Bucket();
        this.httpInstance = httpInstance;
    }

    /**
     * 处理参数函数
     * @param paramsFn - 修改请求配置的函数（可选）。
     * @param requestConfig - 当前请求配置。
     */
    private async handleParamsFn(paramsFn: ParamsFn | undefined, requestConfig: RequestConfig): Promise<RequestConfig> {
        if (isFunction(paramsFn)) {
            try {
                return await paramsFn(requestConfig, this.bucket);
            } catch (error) {
                throw new RequestError('Failed to modify request configuration', requestConfig.url);
            }
        }
        return requestConfig;
    }

    /**
     * 处理响应后处理函数
     * @param postProcess - 请求成功后处理响应数据的函数（可选）。
     * @param response - 响应对象。
     * @param prevData - 上一次请求的数据。
     */
    private async handlePostProcess(postProcess: PostProcessFn | undefined, response: any, prevData: any): Promise<void> {
        if (isFunction(postProcess)) {
            try {
                await postProcess(response, prevData, this.bucket);
            } catch (error) {
                throw new RequestError('Post-processing failed', response.config.url);
            }
        }
    }

    /**
     * 添加一个请求到队列中，并在前一个请求完成后执行。
     * @param url - 请求的URL。
     * @param config - 请求的配置对象。
     * @param paramsFn - 修改请求配置的函数（可选）。
     * @param postProcess - 请求成功后处理响应数据的函数（可选）。
     * @returns 返回一个Promise，当请求完成时解决。
     */
    async add(url: string, config: RequestConfig, paramsFn?: ParamsFn, postProcess?: PostProcessFn): Promise<any> {
        return this._processingPromise = this._processingPromise.then(async (prevData) => {
            let requestConfig: RequestConfig = { ...config, url };

            try {
                // 处理参数函数
                requestConfig = await this.handleParamsFn(paramsFn, requestConfig);
                // 发起HTTP请求
                const response = await this.httpInstance.request(requestConfig);
                // 处理响应后处理函数
                await this.handlePostProcess(postProcess, response, prevData);
                return response;
            } catch (error) {
                console.error(`Request to ${requestConfig.url} failed:`, error);
                // @ts-ignore
                throw new RequestError(error, requestConfig.url);
            }
        }).catch((error) => {
            console.error('Error in request queue:', error);
            throw error;
        });
    }
}