export interface PaymentMethod {
  name: Currency
  icon: string
}

export type Currency = 'ETH' | 'USDT'
