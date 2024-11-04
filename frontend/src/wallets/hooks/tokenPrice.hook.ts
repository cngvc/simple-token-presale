import { ethers } from 'ethers'
import { useReadContract } from 'wagmi'

import { presaleConfig } from '@/wallets/helpers/chains'

const useTokenPrice = ({ value, currentSale }: { value: number; currentSale: number }) => {
  const { data: _ethToTokens } = useReadContract({
    ...presaleConfig,
    functionName: 'ethToTokens',
    args: [BigInt(currentSale), ethers.parseUnits(`${value}`, 'ether')]
  })

  const { data: _usdtToTokens } = useReadContract({
    ...presaleConfig,
    functionName: 'usdtToTokens',
    args: [BigInt(currentSale), ethers.parseUnits(`${value}`, 6)]
  })

  return {
    ethToTokens: Math.floor(Number(ethers.formatEther((_ethToTokens || 0) as bigint))),
    usdtToTokens: Math.floor(Number(ethers.formatEther((_usdtToTokens || 0) as bigint)))
  }
}

export default useTokenPrice
