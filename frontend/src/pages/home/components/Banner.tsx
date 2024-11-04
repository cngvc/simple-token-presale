import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { twJoin } from 'tailwind-merge'

import Section from '@/components/Section'
import { tokens } from '@/constants/tokens'
import { homePageId, whitepaper } from '@/urls'

import { Dapp } from './Dapp'

const Banner = () => {
  const { t } = useTranslation()
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })

  return (
    <div ref={ref}>
      <Section className='pt-[10%] md:pt-[4.5rem]'>
        <div id={homePageId.buy_presale.id} className='flex flex-col lg:flex-row gap-12 py-10 md:py-20'>
          <div className='flex flex-col items-center justify-start lg:mt-20 w-full lg:items-start lg:w-6/12 relative'>
            <h1
              className={twJoin('text-center lg:text-left mb-8', inView && 'animate-fade-right')}
              dangerouslySetInnerHTML={{
                __html:
                  "Lorem Ipsum has been the industry's standard <span class='text-primary font-orbitron'>MEME Network</span>"
              }}
            />
            <div
              className={twJoin(
                't_lg font-light text-center lg:text-left animate-delay-100 mb-6',
                inView && 'animate-fade-right'
              )}
            >
              Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
            </div>

            <div className='flex items-center gap-4'>
              <Link
                to={homePageId.buy_presale.link}
                className={twJoin('b_base animate-delay-200', inView && 'animate-fade-right')}
              >
                {t('buy', { value: tokens.symbol })}
              </Link>

              <Link
                to={whitepaper}
                target='_blank'
                className={twJoin('b_base_outline animate-delay-200', inView && 'animate-fade-right')}
              >
                {t('whitepaper')}
              </Link>
            </div>
          </div>

          <div className='flex flex-col items-center justify-center w-full lg:w-6/12 relative'>
            <Dapp />
          </div>
        </div>
      </Section>
    </div>
  )
}

export default Banner
