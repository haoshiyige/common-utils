import { ArrayUtils } from './ArrayUtils/common/index';
import { RequestQueue } from "./RequestQueue"
import { ObjectUtils } from "./object/index";
import { StringsUtils } from "./stringsUtils/index";
import { FileTools } from "./file-utils";
import { AlgorithmUtils } from "./map/index";
import { EqualityCompare } from "./equals";
// export * from './errors'; 
import { RegExpUtils } from "./regexp/index"
import { FunctionUtils } from './function';
// 名称
export const name = "nin-common";
// 版本号
export const version = "1.0.2";
export {
    // 正则表达式集合
    RegExpUtils,
    FunctionUtils,
    RequestQueue,
    FileTools,
    StringsUtils,
    ArrayUtils,
    ObjectUtils,
    AlgorithmUtils,
    EqualityCompare
}