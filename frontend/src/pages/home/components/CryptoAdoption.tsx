import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { twJoin, twMerge } from 'tailwind-merge'

import Section from '@/components/Section'
import { homePageId } from '@/urls'

const CryptoAdoption = () => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })

  const { t } = useTranslation()

  const data = useMemo(
    () => [
      {
        icon: 'images/icons/lock-access.svg',
        title: t('how_to_buy_step_1')
      },
      {
        icon: 'images/icons/discount.svg',
        title: t('how_to_buy_step_2')
      },
      {
        icon: 'images/icons/round-support.svg',
        title: t('how_to_buy_step_3')
      },
      {
        icon: 'images/icons/token-swap-line.svg',
        title: t('how_to_buy_step_4')
      }
    ],
    [t]
  )

  return (
    <div ref={ref}>
      <Section>
        <div className='flex flex-col w-full' id={homePageId.how_to_buy.id}>
          <div className='flex flex-col text-center md:text-left mb-10 md:mb-20'>
            <h1 className={twJoin('text-center mb-10', inView && 'animate-fade-down')}>{t('how_to_buy')}</h1>
            <div className={twJoin('t_lg font-light text-center animate-delay-100', inView && 'animate-fade-down')}>
              {t('how_to_buy_desc')}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10'>
            {data.map((e, index) => (
              <div
                key={index}
                className={twMerge(
                  'card flex flex-col items-start rounded-md relative p-6',
                  inView && 'animate-fade-right',
                  index === 0 && 'animate-delay-0',
                  index === 1 && 'animate-delay-100',
                  index === 2 && 'animate-delay-200',
                  index === 3 && 'animate-delay-300'
                )}
              >
                <div className='flex flex-col gap-5'>
                  <h1 className='text-primary absolute top-0 -translate-y-2/3 scale-150'>{index + 1}</h1>
                  <p className='mt-4 t_xl font-semibold font-space-grotesk'>{e.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}

export default CryptoAdoption
