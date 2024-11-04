import { ethers } from 'ethers'
import get from 'lodash.get'
import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

import { presaleConfig } from '@/wallets/helpers/chains'

const useContract = () => {
  const { address = zeroAddress } = useAccount()
  const { data: _currentSale } = useReadContract({
    ...presaleConfig,
    functionName: 'currentSale'
  })
  const currentSale = useMemo(() => Number(_currentSale || 1), [_currentSale])

  const { data: _presaleDetail } = useReadContract({
    ...presaleConfig,
    functionName: 'presale',
    args: [BigInt(currentSale)]
  })

  const { data: _ethPrice } = useReadContract({
    ...presaleConfig,
    functionName: 'getLatestPrice'
  })

  const { data: _userClaimData } = useReadContract({
    ...presaleConfig,
    functionName: 'userClaimData',
    args: [address, currentSale]
  })

  const userHolding = useMemo(() => {
    const claimableTokens = get(_userClaimData, '[2]', 0) as bigint
    return Number(ethers.formatEther(claimableTokens || 0))
  }, [_userClaimData])

  const { tokenPriceInUsd, nextTokenPriceInUsd, currentSaleTokens, usdtRaised, soldTokens, soldTokensPercent } =
    useMemo(() => {
      const ethPrice = Number(ethers.formatEther((_ethPrice || 0) as bigint))
      const _price = get(_presaleDetail, '[2]', 0) as bigint
      const _nextPrice = get(_presaleDetail, '[3]', 0) as bigint
      const _sold = get(_presaleDetail, '[4]', 0) as bigint
      const _tokensToSell = get(_presaleDetail, '[5]', 0) as bigint
      const _usdtRaised = get(_presaleDetail, '[7]', 0) as bigint

      const tokenPriceInUsd = Number((1 / Number(ethers.formatEther(_price))).toFixed(4))
      const nextTokenPriceInUsd = Number((1 / Number(ethers.formatEther(_nextPrice))).toFixed(4))
      const tokenPriceInETH = tokenPriceInUsd / ethPrice
      const currentSaleTokens = Number(ethers.formatEther(_tokensToSell))
      const usdtRaised = Number(ethers.formatUnits(_usdtRaised, 6))
      const soldTokens = Number(ethers.formatEther(_sold))

      const soldTokensPercent = Number.isFinite(soldTokens / currentSaleTokens)
        ? Math.min(Number(((soldTokens * 100) / currentSaleTokens).toFixed(3)), 100)
        : 0

      return {
        tokenPriceInUsd: Number.isFinite(tokenPriceInUsd) ? tokenPriceInUsd : 0,
        nextTokenPriceInUsd: Number.isFinite(nextTokenPriceInUsd) ? nextTokenPriceInUsd : 0,
        tokenPriceInETH: Number.isFinite(tokenPriceInETH) ? tokenPriceInETH : 0,
        currentSaleTokens: Number.isFinite(currentSaleTokens) ? currentSaleTokens : 0,
        usdtRaised: Number.isFinite(usdtRaised) ? usdtRaised : 0,
        soldTokens,
        soldTokensPercent
      }
    }, [_presaleDetail, _ethPrice])

  return {
    tokenPriceInUsd,
    nextTokenPriceInUsd,
    currentSaleTokens,
    usdtRaised,
    soldTokens,
    soldTokensPercent,
    currentSale,
    userHolding
  }
}

export default useContract
