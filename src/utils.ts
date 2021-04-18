import { URL } from "url";

export function convertToArray<T>(data: T | T[]): Array<T> {
    return Array.isArray(data) ? data : [data];
}

export function parseUrl(url: string): URL {
    return new URL(url);
}

export function getUrlPathname(url: string): string {
    const pathname = parseUrl(url).pathname;
    return pathname.endsWith("/") ? pathname : pathname + "/";
}

export function stringify(data: unknown): string {
    if (typeof data === "string") {
        return data;
    }
    try {
        return JSON.stringify(data);
    } catch (e) {
        return "";
    }
}

export function randomId(): string {
    return Math.random().toString(20).substr(2, 14);
}
