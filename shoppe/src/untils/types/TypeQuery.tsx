import type { UseQueryOptions } from "@tanstack/react-query";

export interface IQueryParams<
    TParams = any,
    TOptions = UseQueryOptions<any, any, any>,
    TEnabled = boolean,
> {
    options?: TOptions;
    params?: TParams;
    enabled?: TEnabled;
}