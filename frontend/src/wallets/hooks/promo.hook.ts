import { ethers } from 'ethers'
import get from 'lodash.get'
import { useMemo } from 'react'
import { useReadContract } from 'wagmi'

import { presaleConfig } from '@/wallets/helpers/chains'

const usePromo = ({ promoCode }: { promoCode: string }) => {
  const { data: validatedPromoCode } = useReadContract({
    ...presaleConfig,
    functionName: 'validatePromoCode',
    args: [promoCode]
  })

  const { isValid, discountPercentage } = useMemo(() => {
    const isValid = get(validatedPromoCode, '[0]', false)
    const discountPercentage = get(validatedPromoCode, '[1]', 0)
    return {
      isValid,
      discountPercentage: Number(ethers.formatEther((discountPercentage || 0) as bigint))
    }
  }, [validatedPromoCode])

  return {
    isValid,
    discountPercentage
  }
}

export { usePromo }
