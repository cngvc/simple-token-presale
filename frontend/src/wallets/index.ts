import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'

import { VITE_ALCHEMY_KEY, VITE_WALLET_CONNECT_PROJECT_ID } from '@/configs'
import { tokens } from '@/constants/tokens'

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [injectedWallet, metaMaskWallet, trustWallet, coinbaseWallet, rainbowWallet, walletConnectWallet]
    }
  ],
  {
    appName: tokens.name,
    projectId: VITE_WALLET_CONNECT_PROJECT_ID
  }
)

const config = createConfig({
  chains: [sepolia],
  ssr: false,
  transports: {
    [sepolia.id]: http(VITE_ALCHEMY_KEY)
  },
  connectors
})

export { config }
