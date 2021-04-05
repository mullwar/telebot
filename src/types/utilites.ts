export type RequireFields<T, K extends keyof T = keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type PropertyType<T, K extends keyof T> = T[K];

export type TypeValues<T extends Record<string, unknown>> = T[keyof T];
