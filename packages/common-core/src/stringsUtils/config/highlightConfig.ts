

/**
 * 定义默认样式的接口。
 */
export interface StyleDef {
    [key: string]: string; // 样式名称到CSS样式的映射
}

export interface languageDef {
    [key: string]: Object; // 样式名称到CSS样式的映射
}
export const language: languageDef = {
    js: {
        comment: { re: /(\/\/.*|\/\*([\s\S]*?)\*\/)/g, style: "comment" },
        string: { re: /(('.*?')|(".*?"))/g, style: "string" },
        numbers: { re: /(-?(\d+|\d+\.\d+|\.\d+))/g, style: "number" },
        keywords: {
            re: /(?:\b)(function|for|foreach|while|if|else|elseif|switch|break|as|return|this|class|self|default|var|const|let|false|true|null|undefined)(?:\b)/gi,
            style: "keyword",
        },
        operator: {
            re: /(\+|-|\/|\*|%|=|&lt;|&gt;|\||\?|\.)/g,
            style: "operator",
        },
    },
    html: {
        comment: { re: /(&lt;!--([\s\S]*?)--&gt;)/g, style: "comment" },
        tag: {
            re: /(&lt;\/?\w(.|\n)*?\/?&gt;)/g,
            style: "keyword",
            embed: ["string"],
        },
        string: {
            re: /(('.*?')|(".*?"))/g, style: "string"
        },
        css: {
            re: /(?:&lt;style.*?&gt;)([\s\S]*)?(?:&lt;\/style&gt;)/gi,
            language: "css",
        },
        script: {
            re: /(?:&lt;script.*?&gt;)([\s\S]*?)(?:&lt;\/script&gt;)/gi,
            language: "js",
        },
    },
    css: {
        comment: {
            re: /(\/\/.*|\/\*([\s\S]*?)\*\/)/g, style: "comment"
        },
        string: {
            re: /(('.*?')|(".*?"))/g, style: "string"
        },
        numbers: {
            re: /((-?(\d+|\d+\.\d+|\.\d+)(%|px|em|pt|in)?)|#[0-9a-fA-F]{3}[0-9a-fA-F]{3})/g,
            style: "number",
        },
        keywords: { re: /(@\w+|:?:\w+|[a-z-]+:)/g, style: "keyword" },
    },
};