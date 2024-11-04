import { VITE_ETH_EXPLORER, VITE_TOKEN_ADDRESS } from '@/configs'

const tokens = {
  symbol: '$MEME',
  name: 'MEME Network',
  token_symbol: 'MEME',
  total_stage: 7,
  launch_price: 0.5,
  token_decimal: 18,
  network: 'ETH',
  explorer: `${VITE_ETH_EXPLORER}/address/${VITE_TOKEN_ADDRESS}`
}

export { tokens }
