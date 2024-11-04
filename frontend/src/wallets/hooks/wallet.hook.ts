import { ethers } from 'ethers'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { zeroAddress } from 'viem'
import { useAccount, useBalance } from 'wagmi'

import { VITE_USDT_ETH_ADDRESS } from '@/configs'
import { Currency } from '@/helpers/types'
import { chain } from '@/wallets/helpers/chains'

type Type = {
  currency: Currency
}

const useUserWallet = ({ currency }: Type) => {
  const { address = zeroAddress } = useAccount()
  const { t } = useTranslation()

  const { data: addressETHBalance } = useBalance({
    address: address,
    chainId: chain.id
  })

  const { data: addressUsdtEthBalance } = useBalance({
    address: address,
    chainId: chain.id,
    token: VITE_USDT_ETH_ADDRESS as `0x${string}`
  })

  const label: string = useMemo(() => {
    if (currency === 'ETH') {
      return `ETH ${t('balance')}: `
    }
    if (currency === 'USDT') {
      return `USDT ${t('balance')}: `
    }
    return `${t('balance')}: `
  }, [currency, t])

  const balance: number = useMemo(() => {
    if (address === zeroAddress) {
      return 0
    }
    if (currency === 'ETH') {
      return +Number(ethers.formatEther(addressETHBalance?.value || 0))
    }
    if (currency === 'USDT') {
      return +Number(ethers.formatUnits(addressUsdtEthBalance?.value || 0, 6))
    }

    return 0
  }, [address, currency, addressETHBalance, addressUsdtEthBalance])

  return {
    balance,
    label
  }
}

export default useUserWallet
