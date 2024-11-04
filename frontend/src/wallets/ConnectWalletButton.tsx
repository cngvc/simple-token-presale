import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTranslation } from 'react-i18next'

import { tokens } from '@/constants/tokens'

export const ConnectWalletButton = () => {
  const { t } = useTranslation()

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none'
              }
            })}
            className='flex flex-row items-center'
          >
            {(() => {
              if (!connected) {
                return (
                  <button className='b_sm' onClick={openConnectModal} id='connect-button-id'>
                    <span className='line-clamp-1'>{t('buy', { value: tokens.symbol })}</span>
                  </button>
                )
              }

              return (
                <button className='b_sm' onClick={openAccountModal}>
                  <span className='line-clamp-1'>{account.displayName}</span>
                </button>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
