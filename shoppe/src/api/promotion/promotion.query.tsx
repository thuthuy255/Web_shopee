import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { IQueryParams } from "../../untils/types/TypeQuery";
import { getDetailPromotion } from "./promotion.api";

export const useGetDetailPromotionQuery = ({
    params,
}: IQueryParams<any> = {}): UseQueryResult<any> => {
    const queryKey = params
        ? ['getDetailPromotionQuery', params]
        : ['getDetailPromotionQuery'];
    const _options: UseQueryOptions<any, any, any> = {
        queryKey: queryKey,
        queryFn: () => getDetailPromotion(params),
        staleTime: 0,
        gcTime: 0,
        enabled: true,
    };
    return useQuery(_options);
};
