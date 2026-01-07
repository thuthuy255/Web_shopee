import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { IQueryParams } from "../../untils/types/TypeQuery";
import { getDetailProduct } from "./product.api";

export const useGetDetailProductQuery = ({
    params,
}: IQueryParams<any> = {}): UseQueryResult<any> => {
    const queryKey = params
        ? ['getDetailProductQuery', params]
        : ['getDetailProductQuery'];
    const _options: UseQueryOptions<any, any, any> = {
        queryKey: queryKey,
        queryFn: () => getDetailProduct(params),
        staleTime: 0,
        gcTime: 0,
        enabled: true,
    };
    return useQuery(_options);
};
