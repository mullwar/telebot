import { parse as nodeParseUrl, UrlWithStringQuery } from "url";

export function convertToArray<T>(data: T | T[]): Array<T> {
    return (Array.isArray(data)) ? data : [data];
}

export function parseUrl(url: string): UrlWithStringQuery {
    return nodeParseUrl(url);
}
