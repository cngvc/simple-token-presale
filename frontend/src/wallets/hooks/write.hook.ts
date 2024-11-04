import { useWriteContract } from 'wagmi'

import { presaleConfig, usdtConfig } from '@/wallets/helpers/chains'

const useWrite = () => {
  const { writeContractAsync } = useWriteContract()

  const onBuyWithEth = (args: { [key: string]: string | bigint | number | (string | bigint | number)[] }) => {
    return writeContractAsync({
      functionName: 'buyWithEth',
      ...presaleConfig,
      ...args
    })
  }

  const onBuyWithUSDT = (args: { [key: string]: string | bigint | number | (string | bigint | number)[] }) => {
    return writeContractAsync({
      functionName: 'buyWithUSDT',
      ...presaleConfig,
      ...args
    })
  }

  const onApproveUsdt = (args: { [key: string]: string | bigint | number | (string | bigint | number)[] }) => {
    return writeContractAsync({
      functionName: 'approve',
      ...usdtConfig,
      ...args
    })
  }

  return {
    onBuyWithEth,
    onBuyWithUSDT,
    onApproveUsdt
  }
}

export default useWrite
