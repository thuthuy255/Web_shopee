import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { IQueryParams } from "../../untils/types/TypeQuery";
import { getDetailCategory } from "./category.api";

export const useGetDetailCategoryQuery = ({
    params,
}: IQueryParams<any> = {}): UseQueryResult<any> => {
    const queryKey = params
        ? ['getDetailCategoryQuery', params]
        : ['getDetailCategoryQuery'];
    const _options: UseQueryOptions<any, any, any> = {
        queryKey: queryKey,
        queryFn: () => getDetailCategory(params),
        staleTime: 0,
        enabled: true,
        gcTime: 0,
    };
    return useQuery(_options);
};
