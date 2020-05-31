import { parse as nodeParseUrl, UrlWithStringQuery } from "url";

export function convertToArray<T>(data: T | T[]): Array<T> {
    return (Array.isArray(data)) ? data : [data];
}

export function parseUrl(url: string): UrlWithStringQuery {
    return nodeParseUrl(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toString(data: any): string {
    if (typeof data === "string") {
        return data;
    }
    try {
        return JSON.stringify(data);
    } catch (e) {
        return "";
    }
}
