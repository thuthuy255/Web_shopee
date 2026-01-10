import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { IQueryParams } from "../../untils/types/TypeQuery";
import { getDetailSeller } from "./seller.api";

export const useGetDetailSellerQuery = ({
    params,
}: IQueryParams<any> = {}): UseQueryResult<any> => {
    const queryKey = params
        ? ['getDetailSellerQuery', params]
        : ['getDetailSellerQuery'];
    const _options: UseQueryOptions<any, any, any> = {
        queryKey: queryKey,
        queryFn: () => getDetailSeller(params),
        staleTime: 0,
        gcTime: 0,
        enabled: true,
    };
    return useQuery(_options);
};
