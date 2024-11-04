import { sepolia } from 'wagmi/chains'

import { VITE_PRESALE_ADDRESS, VITE_USDT_ETH_ADDRESS } from '@/configs'
import presaleAbi from '@/wallets/contracts/presale.sepolia.abi.json'
import usdtEthAbi from '@/wallets/contracts/usdt.eth.abi.json'

export const chain = sepolia

export const presaleConfig = {
  address: VITE_PRESALE_ADDRESS as `0x${string}`,
  abi: presaleAbi
}

export const usdtConfig = {
  address: VITE_USDT_ETH_ADDRESS as `0x${string}`,
  abi: usdtEthAbi
}
