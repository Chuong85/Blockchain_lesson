import { QueryClient, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { TokenBalance, useWalletState } from "../contexts/state";
import { Erc20Activity, getErc20Contract, getErc20Events } from "../util/erc20";
import { uniqBy } from "lodash";

const BLOCK_INITIAL = 8_136_863;

export const useLatestBlock = () => {
  const { provider } = useWalletState();

  const { data } = useQuery({
    queryKey: ['latest-block', provider?._network.chainId.toString()],
    queryFn: async () => {
      const result = await provider?.getBlockNumber();
      return +(result?.toString() ?? 0);
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  })

  return data;
}

const getErc20WithCache = async (queryClient: QueryClient, provider: ethers.Provider, address: string, token: TokenBalance) => {
  if (!provider) throw new Error("Provider not available");

  const cached = queryClient.getQueryData<{
    events: Erc20Activity[],
    lastBlock: number
  }>(['erc20-activity', address, token.address, '1']);

  console.log("🚀 ~ getErc20WithCache ~ cached:", cached)
  const fromBlock = cached?.lastBlock ?? BLOCK_INITIAL;
  const latestBlock = await provider.getBlockNumber();
  const toBLock = Math.min(fromBlock + 1000, latestBlock || (fromBlock + 1000))

  const result = await getErc20Events(getErc20Contract(token.address, provider), address, fromBlock, toBLock);

  queryClient.setQueryData<{
    events: Erc20Activity[],
    lastBlock: number
  }>(['erc20-activity', address, token.address, '1'], {
    events: [...(cached?.events || []), ...result],
    lastBlock: toBLock
  })

  return {
    events: [...(cached?.events || []), ...result],
    lastBlock: toBLock,
    isFinished: toBLock >= latestBlock
  };
}


export const useActivity = () => {
  const { address, importedToken } = useWalletState();
  const queryClient = useQueryClient();
  const { provider } = useWalletState();

  const combinedQueries = useQueries({
    queries: importedToken.map((token) => ({
      queryKey: ['erc20-activity', address, token.address, '1'],
      queryFn: async () => {
        const result = await getErc20WithCache(queryClient, provider!, address, token);
        console.log("🚀 ~ queryFn: ~ result:", result)
        return {
          ...result,
          events: result.events.map(item => ({
            ...item,
            symbol: token.symbol ?? '',
            decimals: token.decimals ?? 0,
          }))
        }
      },
      gcTime: Infinity,
      refetchInterval: (query: any) => {
        if (query.state.data?.isFinished) {
          return false;
        }

        return 1000;
      }
    })),
    combine: (results) => {
      const result = uniqBy(results.map((result) => result.data?.events).flat().filter(Boolean) as (Erc20Activity & { symbol: string, decimals: number })[], 'txHash');
      return {
        data: {
          events: result,
        },
        pending: results.some((result) => result.isPending),
      }
    },
  })
  return combinedQueries;
}
