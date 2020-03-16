export function convertToArray<T>(data: T | T[]): Array<T> {
    return (Array.isArray(data)) ? data : [data];
}
