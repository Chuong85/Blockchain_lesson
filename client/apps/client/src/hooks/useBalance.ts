import { useQuery } from "@tanstack/react-query";
import { TokenBalance, useWalletState } from "../contexts/state";
import { ethers, ZeroAddress } from "ethers";
import { ERC20__factory } from "@client/typechain";

export const useNativeBalance = () => {
  const { address, provider, isUnlocked } = useWalletState()

  const nativeBalance = useQuery({
    queryKey: ['balance', address, isUnlocked, provider],
    queryFn: async () => {
      if (!provider) {
        throw new Error('Provider not found');
      }

      const balance = await provider.getBalance(address)
      return {
        address: ZeroAddress, // 0x0000000000000000000000000000000000000000 || 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
        symbol: 'ETH',
        name: 'Ether',
        decimals: 18,
        balance: ethers.formatEther(balance)
      } as TokenBalance
    },
    enabled: !!address && !!provider,
    gcTime: 0,
  })

  return nativeBalance
}

export const useTokenBalances = () => {
  const { address, provider, importedToken } = useWalletState()

  const tokenBalances = useQuery({
    queryKey: ['tokenBalances', address, provider],
    queryFn: async () => {
      if (!provider) {
        throw new Error('Provider not found');
      }

      const balances = await Promise.all(importedToken.map(async (token) => {
        const erc20Contract = ERC20__factory.connect(token.address, provider)
        const balance = await erc20Contract.balanceOf(address)
        return {
          ...token,
          balance: ethers.formatUnits(balance, token.decimals)
        }
      }))

      return balances
    },
    enabled: !!address && !!provider && !!importedToken,
    gcTime: 30_000
  })

  return tokenBalances
}

export const useBalances = () => {
  const nativeBalance = useNativeBalance()
  const tokenBalances = useTokenBalances()

  return {
    nativeBalance: nativeBalance.data,
    data: [nativeBalance.data, ...(tokenBalances.data || [])] as TokenBalance[],
    isLoading: nativeBalance.isLoading || tokenBalances.isLoading,
    isError: nativeBalance.isError || tokenBalances.isError,
    error: nativeBalance.error || tokenBalances.error
  }
}

