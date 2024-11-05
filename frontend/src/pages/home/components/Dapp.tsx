import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit'
import ProgressBar from '@ramonak/react-progress-bar'
import { useEffect, useMemo, useState } from 'react'
import CountUp from 'react-countup'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'

import TextLoading from '@/components/TextLoading'
import { VITE_ETH_EXPLORER } from '@/configs'
import { methods } from '@/constants/method'
import { tokens } from '@/constants/tokens'
import { thousandsFormat } from '@/helpers/format'
import { Currency } from '@/helpers/types'
import { useDebounce } from '@/hooks/debounce.hook'
import { chain as ProjectChain } from '@/wallets/helpers/chains'
import { useBuys } from '@/wallets/hooks/buys.hook'
import useContract from '@/wallets/hooks/contract.hook'
import { usePromo } from '@/wallets/hooks/promo.hook'
import useTokenPrice from '@/wallets/hooks/tokenPrice.hook'
import useUserWallet from '@/wallets/hooks/wallet.hook'

import { CustomSwal } from './CustomSwal'

export const Dapp = () => {
  const { t } = useTranslation()
  const [currency, $currency] = useState<Currency>(methods[0].name)
  const [value, $value] = useState<number | string>('')
  const [amount, $amount] = useState<number | string>('')
  const [isConvertingLoading, $isConvertingLoading] = useState(false)
  const [isShowingPromoCode, $isShowingPromoCode] = useState(false)
  const [clonedValue, $clonedValue] = useState<number | string>('')
  const [clonedPromoCode, $clonedPromoCode] = useState<string>('')
  const [isValidatingPromoCode, $isValidatingPromoCode] = useState(false)

  const { openConnectModal } = useConnectModal()
  const { openChainModal } = useChainModal()
  const { balance, label } = useUserWallet({ currency })
  const { isConnected, address, chain } = useAccount()
  const { currentSale, tokenPriceInUsd, nextTokenPriceInUsd, usdtRaised, soldTokens, soldTokensPercent, userHolding } =
    useContract()

  const { ethToTokens, usdtToTokens } = useTokenPrice({ currentSale, value: Number(clonedValue) })

  const { isValid, discountPercentage } = usePromo({
    promoCode: clonedPromoCode
  })

  const {
    buyWithETH,
    buyWithUsdt,
    isConfirming,
    isApproveConfirming,
    isFetchingTransaction,
    isTransactionSucceed,
    isFetchingApproveTransaction,

    currentTransaction,
    onResetDappTransaction,

    promoCode,
    onChangePromoCode
  } = useBuys()

  const handleSetMax = () => {
    let value = 0
    if (currency === 'ETH') {
      value = Math.max(balance - 0.015, 0)
    }
    if (currency === 'USDT') {
      value = balance
    }
    $value(value)
    $clonedValue(Number(Number(value).toFixed(6)))
  }

  const handleBuy = () => {
    if (!isConnected) {
      return openConnectModal?.()
    }

    if (chain?.id !== ProjectChain.id) {
      return CustomSwal.fire({
        title: t('change_network'),
        text: t('please_connect_to_eth_mainnet_wrong_chain_id'),
        icon: 'error',
        confirmButtonText: t('okay')
      }).then(() => {
        openChainModal?.()
      })
    }

    if (currency === 'ETH') {
      return buyWithETH(Number(value), promoCode.length ? promoCode : '')
    }

    if (currency === 'USDT') {
      return buyWithUsdt(Number(value), promoCode.length ? promoCode : '')
    }
  }

  const debouncedAmountRequest = useDebounce(() => {
    $clonedValue(Number(Number(value).toFixed(6)))
    $isConvertingLoading(false)
  })

  const debouncedPromoCodeRequest = useDebounce(() => {
    $clonedPromoCode(promoCode)
    $isValidatingPromoCode(false)
  })

  const bonusTokens = useMemo(() => {
    if (!isValid) return 0
    return (discountPercentage / 100) * Number(amount || 0)
  }, [isValid, discountPercentage, amount])

  useEffect(() => {
    if (currency === 'ETH') {
      $amount(ethToTokens)
    }
    if (currency === 'USDT') {
      $amount(usdtToTokens)
    }
  }, [currency, ethToTokens, usdtToTokens])

  const renderProcess = () => {
    if (isApproveConfirming) {
      return renderApproveProcess
    }
    if (isConfirming) {
      return renderTransactionConfirming
    }
    if (isFetchingApproveTransaction) {
      return renderApproveTransactionProcess
    }
    if (isFetchingTransaction) {
      return renderTransactionProcess
    }
    if (isTransactionSucceed) {
      return renderTransactionSuccess
    }
    return renderInputs()
  }

  const renderTransactionSuccess = useMemo(() => {
    let transactionUrl = '#'
    if (currentTransaction) {
      transactionUrl = `${VITE_ETH_EXPLORER}/tx/${currentTransaction}`
    }
    return (
      <div className='flex flex-col items-center gap-4 mb-9'>
        <img src='images/icons/success.svg' alt='success' className='w-12 h-12 object-contain' />
        <p className='t_lg text-green-500 text-center font-semibold'>{t('your_purchase_was_successful')}</p>
        <p className='t_sm text-center'>
          {t('in_progress_description', {
            value: `${thousandsFormat(amount)} ${bonusTokens > 0 ? `(+${thousandsFormat(bonusTokens)})` : ''}`
          })}
        </p>
        <div className='w-full gap-4 justify-center grid grid-cols-2'>
          <Link target='_blank' to={transactionUrl} className='b_base_outline px-4' rel='noreferrer'>
            {t('view_transaction')}
          </Link>
          <button
            className='b_base px-4'
            onClick={() => {
              onResetDappTransaction()
              $amount('')
              $value('')

              $clonedValue('')
              $clonedPromoCode('')
            }}
          >
            {t('start_again')}
          </button>
        </div>
      </div>
    )
  }, [t, currentTransaction, amount, onResetDappTransaction, bonusTokens])

  const renderApproveTransactionProcess = useMemo(() => {
    return (
      <div className='flex flex-col items-center gap-4 mb-9'>
        <TextLoading title={t('approve_in_progress_label')} />
        <p className='t_sm text-center'>{t('approve_usdt_description')}</p>
      </div>
    )
  }, [t])

  const renderTransactionProcess = useMemo(() => {
    return (
      <div className='flex flex-col items-center gap-4 mb-9'>
        <TextLoading title={t('in_progress_label')} />
        <p className='t_sm text-center'>
          {t('in_progress_description', {
            value: `${thousandsFormat(amount)} ${bonusTokens > 0 ? `(+${thousandsFormat(bonusTokens)})` : ''}`
          })}
        </p>
      </div>
    )
  }, [bonusTokens, amount, t])

  const renderTransactionConfirming = useMemo(() => {
    return (
      <div className='flex flex-col items-center gap-4 mb-9'>
        <TextLoading title={t('confirm')} />
        <p className='t_sm text-center'>
          {t('transaction_confirm_description', { value: tokens.token_symbol, currency: currency })}
        </p>
      </div>
    )
  }, [currency, t])

  const renderApproveProcess = useMemo(() => {
    return (
      <div className='flex flex-col items-center gap-4 mb-9'>
        <TextLoading title={t('authorize')} />
        <p className='t_sm text-center'>{t('authorize_confirm_description', { value: tokens.token_symbol })}</p>
      </div>
    )
  }, [t])

  const renderBuyButton = () => {
    const isInProcess = isConvertingLoading || isConfirming
    const isAmountEmpty = !amount || amount === '0'
    const isValueEmpty = !value || value === '0'
    const isDisabled = isInProcess || isAmountEmpty || isValueEmpty

    return (
      <div className='flex flex-col items-center justify-end w-full'>
        <button disabled={isDisabled} onClick={handleBuy} className='disabled:opacity-80 b_lg font-medium w-full'>
          {address && address !== zeroAddress ? `${t('buy', { value: tokens.symbol })}` : t('connect_wallet')}
        </button>
      </div>
    )
  }

  const renderPromoCode = useMemo(() => {
    if (!promoCode.length) return null
    if (isValidatingPromoCode) {
      return (
        <div className='flex flex-col mt-4'>
          <TextLoading title={t('validating_promo_code')} />
        </div>
      )
    }
    return (
      <div className='flex flex-col mt-4'>
        <div
          dangerouslySetInnerHTML={{
            __html: isValid ? t('valid_code', { value: promoCode }) : t('invalid_code', { value: promoCode })
          }}
        />
        {isValid ? (
          <div>
            {t('bonus_token')} :{' '}
            <span className='text-green-500 font-bold'>
              +{thousandsFormat(bonusTokens)} ({discountPercentage}%)
            </span>
          </div>
        ) : null}
      </div>
    )
  }, [t, promoCode, isValidatingPromoCode, isValid, discountPercentage, bonusTokens])

  const renderInputs = () => {
    return (
      <div className='mb-9'>
        <div className='flex flex-col w-full gap-2 mb-2'>
          <div className='flex flex-row justify-between items-center'>
            <p
              className='t_base text-white'
              dangerouslySetInnerHTML={{ __html: t('amount_pay', { value: currency }) }}
            />
          </div>
          <div className='h-12 border border-border-gray w-full flex rounded-md bg-white'>
            <input
              value={value}
              type='number'
              min={0}
              placeholder={t('enter_value')}
              onWheel={(event) => (event.target as any)?.blur()}
              onChange={({ target: { value } }) => {
                $isConvertingLoading(true)
                $value(value.length ? Number.parseFloat(value) : '')
                debouncedAmountRequest()
              }}
              className='w-full bg-transparent px-4 text-base appearance-none text-black placeholder:text-placeholder focus:ring-0 focus:outline-none'
            />
            <div className='w-40 bg-transparent flex justify-center items-center gap-2'>
              <button
                onClick={handleSetMax}
                className='h-8 px-3 uppercase flex items-center justify-center rounded bg-gradient-to-br from-primary via-light-primary to-dark-primary t_xs font-bold'
              >
                {t('max')}
              </button>
              <img src={methods.find((e) => e.name === currency)?.icon} className='h-5 w-5 object-contain' alt='Coin' />
            </div>
          </div>
        </div>

        <div className='flex flex-col w-full gap-2 mb-3'>
          <div className='flex flex-row justify-between items-center'>
            <p
              className='t_base text-white'
              dangerouslySetInnerHTML={{ __html: t('amount_receive', { value: tokens.token_symbol }) }}
            />
          </div>
          <div
            className={twMerge(
              'h-12 border border-border-gray w-full flex rounded-md bg-white cursor-not-allowed',
              isConvertingLoading && 'animate-pulse'
            )}
          >
            <input
              value={amount ? amount : ''}
              type='number'
              min={0}
              placeholder={t('amount')}
              onWheel={(event) => (event.target as any)?.blur()}
              disabled
              className='w-full bg-transparent px-4 text-base appearance-none text-black placeholder:text-placeholder focus:ring-0 focus:outline-none cursor-not-allowed'
            />
            <div className='w-16 bg-transparent flex justify-center items-center gap-2'>
              <img src='images/logo.png' className='h-7 w-7 object-contain' alt='Coin' />
            </div>
          </div>
        </div>

        <div className='flex flex-col w-full gap-2 mb-3'>
          <div className='flex flex-row justify-between items-center'>
            <button onClick={() => $isShowingPromoCode((cur) => !cur)}>
              <p className='t_base text-white'>{t('promo_code_label')}</p>
            </button>
          </div>
          {isShowingPromoCode && (
            <div className='flex flex-col'>
              <div
                className={twMerge(
                  'h-12 border border-border-gray w-full flex rounded-md bg-white cursor-not-allowed',
                  isConvertingLoading && 'animate-pulse'
                )}
              >
                <input
                  value={promoCode}
                  type='text'
                  placeholder={t('enter_promo_code')}
                  className='w-full bg-transparent px-4 text-base appearance-none text-black placeholder:text-placeholder focus:ring-0 focus:outline-none'
                  onChange={({ target: { value } }) => {
                    $isValidatingPromoCode(true)
                    onChangePromoCode(value)
                    debouncedPromoCodeRequest()
                  }}
                />
              </div>

              {renderPromoCode}
            </div>
          )}
        </div>

        {renderBuyButton()}
      </div>
    )
  }

  return (
    <div className='card py-5 px-5 md:px-10 max-w-[566px] w-full lg:w-10/12 mx-auto h-auto'>
      <div className='flex items-center justify-between gap-2'>
        <img src='images/logo.png' className='h-8 w-auto' alt='Logo' />
        <div className='flex items-center gap-4'>
          <span className='t_base font-light'>{t('presale_stage')}</span>
          <span className='t_2xl font-bold text-darkest-primary'>
            <span className='text-light-primary'>{currentSale}</span>/{tokens.total_stage}
          </span>
        </div>
      </div>
      <div className='hr my-3' />
      <div className='flex items-center justify-between gap-2'>
        <span className='t_lg'>
          1 {tokens.token_symbol} <span className='font-bold text-primary'>= ${tokenPriceInUsd}</span>
        </span>
        <span className='t_lg'>
          {t('next_stage_price')} <span className='font-bold text-primary'>= ${nextTokenPriceInUsd}</span>
        </span>
      </div>
      <div className='hr my-3' />

      <div className='mb-4'>
        <ProgressBar
          completed={soldTokensPercent}
          bgColor={'#d7b26d'}
          borderRadius='4px'
          baseBgColor={'#836224'}
          animateOnRender
          maxCompleted={100}
          labelAlignment='left'
          labelClassName={twMerge('process-bar-label', soldTokensPercent < 15 && 'text-white')}
        />
      </div>
      <div className='flex flex-col gap-1 mb-3'>
        <div className='flex items-center justify-between py-2 px-5 rounded bg-darker-primary gap-4'>
          <span className='t_xs text-primary'>{t('raised', { value: 'USDT' })}:</span>
          <span className='t_lg text-primary'>
            <CountUp start={0} end={usdtRaised} prefix='$' duration={2} />
          </span>
        </div>

        <div className='flex items-center justify-between py-2 px-5 rounded bg-darker-primary gap-4'>
          <span className='t_xs text-primary'>{t('token_sold')}:</span>
          <span className='t_lg text-primary'>
            <CountUp start={0} end={soldTokens} duration={2} />
          </span>
        </div>
      </div>

      <div className='flex items-center justify-between gap-2 w-full mb-3'>
        {methods.map((e, index) => {
          const isSelected = e.name === currency
          return (
            <button
              onClick={(event) => {
                event.preventDefault()
                $currency(e.name)
              }}
              key={index}
              className={twMerge(
                'gap-2 flex px-3 py-2 rounded-md w-full border border-light-primary bg-white items-center justify-center',
                isSelected && 'bg-primary'
              )}
            >
              <img src={e.icon} className='w-5 h-5 object-contain' alt={e.icon} />
              <p className={twMerge('t_sm text-placeholder', isSelected && 'text-black')}>{e.name}</p>
            </button>
          )
        })}
      </div>

      <div className='text-center'>
        {label} <span className='font-bold'>{balance}</span>
      </div>
      <div className='text-center '>
        {t('your_holdings')}:{' '}
        <span className='font-bold'>
          <CountUp start={0} end={userHolding} duration={2} />
        </span>
      </div>
      <div className='hr my-3' />

      {renderProcess()}

      <div className='flex items-center justify-between'>
        <div className='t_xs py-2 px-2.5 bg-dark-primary/70 w-max rounded flex items-center gap-2 cursor-pointer'>
          <img className='w-4 h-4' src='images/icons/questions.svg' />
          <span>{t('how_to_buy_btn')}</span>
        </div>
      </div>
    </div>
  )
}
