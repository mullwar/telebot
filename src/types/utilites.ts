export type ArgumentsType<T extends (...args: any[]) => any> = T extends (...args: infer A) => any ? A : never;

export type RequireFields<T, K extends keyof T = keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

