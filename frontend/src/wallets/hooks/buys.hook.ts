import { ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { zeroAddress } from 'viem'
import { useAccount, useReadContract, useWaitForTransactionReceipt } from 'wagmi'

import { VITE_PRESALE_ADDRESS } from '@/configs'
import { CustomSwal } from '@/pages/home/components/CustomSwal'
import { usdtConfig } from '@/wallets/helpers/chains'
import { errorMessage } from '@/wallets/helpers/errors'
import useWrite from '@/wallets/hooks/write.hook'

const useBuys = () => {
  const { address = zeroAddress, chain } = useAccount()
  const [currentTransaction, $currentTransaction] = useState<string | null>(null)
  const [buyWithUSDTValue, $buyWithUSDTValue] = useState<number>(0)
  const [promoCode, $promoCode] = useState('')

  const [currentApproveTransaction, $currentApproveTransaction] = useState<string | null>(null)

  const { data: usdtEthAllowance } = useReadContract({
    ...usdtConfig,
    functionName: 'allowance',
    args: [address, VITE_PRESALE_ADDRESS]
  })

  const { onApproveUsdt, onBuyWithEth, onBuyWithUSDT } = useWrite()

  const [isConfirming, $isConfirming] = useState(false)
  const [isApproveConfirming, $isApproveConfirming] = useState(false)

  const currencyTransaction = useWaitForTransactionReceipt({
    chainId: chain?.id,
    hash: currentTransaction ? (currentTransaction as `0x${string}`) : undefined
  })

  const approveUsdTransaction = useWaitForTransactionReceipt({
    chainId: chain?.id,
    hash: currentApproveTransaction ? (currentApproveTransaction as `0x${string}`) : undefined
  })

  const buyWithETH = async (value: number, promoCode = '') => {
    try {
      $isConfirming(true)
      const hash = await onBuyWithEth({
        value: ethers.parseEther(`${value}`),
        args: [promoCode]
      })
      $currentTransaction(hash)
    } catch (error: any) {
      CustomSwal.fire({
        title: 'Oops!',
        text: errorMessage(error.message),
        icon: 'error',
        confirmButtonText: 'Exit'
      })
    } finally {
      $isConfirming(false)
    }
  }

  useEffect(() => {
    if (approveUsdTransaction && approveUsdTransaction.data && approveUsdTransaction.isSuccess) {
      const buyWithUsdtEthAfterApprove = async () => {
        $currentApproveTransaction(null)
        $isConfirming(true)
        try {
          const hash = await onBuyWithUSDT({
            args: [Number(ethers.parseUnits(`${buyWithUSDTValue}`, 6)), promoCode]
          })
          $currentTransaction(hash)
        } catch (error: any) {
          CustomSwal.fire({
            title: 'Oops!',
            text: errorMessage(error.message),
            icon: 'error',
            confirmButtonText: 'Exit'
          })
        } finally {
          $buyWithUSDTValue(0)
          $isConfirming(false)
        }
      }
      buyWithUsdtEthAfterApprove()
    }
  }, [approveUsdTransaction, buyWithUSDTValue, promoCode, onBuyWithUSDT])

  const buyWithUsdt = async (value: number, promoCode = '') => {
    try {
      const isApproveNeeded = value > Number(ethers.formatUnits((usdtEthAllowance || 0) as bigint, 6))
      if (isApproveNeeded) {
        $buyWithUSDTValue(value)
        $isApproveConfirming(true)
        const hash = await onApproveUsdt?.({
          args: [VITE_PRESALE_ADDRESS, Number(ethers.parseUnits(`${value}`, 6))]
        })
        $currentApproveTransaction(hash)
      } else {
        $isConfirming(true)
        const hash = await onBuyWithUSDT?.({
          args: [Number(ethers.parseUnits(`${value}`, 6)), promoCode]
        })
        $currentTransaction(hash)
      }
    } catch (error: any) {
      $buyWithUSDTValue(0)
      CustomSwal.fire({
        title: 'Oops!',
        text: errorMessage(error.message),
        icon: 'error',
        confirmButtonText: 'Exit'
      })
    } finally {
      $isConfirming(false)
      $isApproveConfirming(false)
    }
  }

  const onResetDappTransaction = useCallback(() => {
    $isConfirming(false)
    $isApproveConfirming(false)
    $currentTransaction(null)
    $currentApproveTransaction(null)
    $promoCode('')
  }, [])

  const isFetchingApproveTransaction = useMemo(() => {
    return approveUsdTransaction && approveUsdTransaction.fetchStatus === 'fetching' && !approveUsdTransaction.isSuccess
  }, [approveUsdTransaction])

  const isFetchingTransaction = useMemo(() => {
    return currencyTransaction && currencyTransaction.fetchStatus === 'fetching' && !currencyTransaction.isSuccess
  }, [currencyTransaction])

  const isTransactionSucceed = useMemo(() => {
    return currencyTransaction?.data && !!currencyTransaction?.isSuccess
  }, [currencyTransaction])

  return {
    buyWithETH,
    buyWithUsdt,

    onResetDappTransaction,
    isConfirming,
    isApproveConfirming,
    isFetchingTransaction,
    isTransactionSucceed,
    isFetchingApproveTransaction,

    currentTransaction,

    promoCode,
    onChangePromoCode: $promoCode
  }
}

export { useBuys }
