import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { IQueryParams } from "../../untils/types/TypeQuery";
import { getBannerDetail } from "./banner.api";

export const useGetBannerDetailtQuery = ({
    params,
}: IQueryParams<any> = {}): UseQueryResult<any> => {
    const queryKey = params
        ? ['getBannerDetailtQuery', params]
        : ['getBannerDetailtQuery'];
    const _options: UseQueryOptions<any, any, any> = {
        queryKey: queryKey,
        queryFn: () => getBannerDetail(params),
        staleTime: 0,
        enabled: true,
    };
    return useQuery(_options);
};
