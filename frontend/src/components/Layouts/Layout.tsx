import { Disclosure } from '@headlessui/react'
import $ from 'jquery'
import { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'

import FooterWrapper from '@/components/FooterWrapper'
import { LanguageMenu } from '@/components/LanguageMenu'
import RootLayout from '@/components/Layouts/RootLayout'
import { homePageId, internal, whitepaper } from '@/urls'
import { ConnectWalletButton } from '@/wallets/ConnectWalletButton'

type LayoutProps = {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation()

  const navigators = [
    {
      href: homePageId.feature.link,
      name: t('ecosystem')
    },
    {
      href: homePageId.tokenomics.link,
      name: t('tokenomics')
    },
    {
      href: whitepaper,
      name: t('whitepaper')
    },
    {
      href: homePageId.how_to_buy.link,
      name: t('how_to_buy')
    }
  ]

  useEffect(() => {
    const header = $('.js-header')
    const handleScroll = () => {
      if (($(window).scrollTop() || 0) > 10) {
        header.addClass('bg_header')
      } else {
        header.removeClass('bg_header')
      }
    }
    $(window).on('scroll', handleScroll)

    if (($(document).scrollTop() || 0) > 10) {
      header.addClass('bg_header')
    }
    return () => {
      $(window).off('scroll', handleScroll)
    }
  }, [])

  return (
    <RootLayout>
      <Disclosure as='nav' className={'relative'}>
        {({ open }) => (
          <>
            <div className='fixed z-20 left-0 right-0 js-header duration-200 border-b border-transparent'>
              <div className='px-4 md:px-8 xl:px-16 flex h-16 md:h-20 justify-between max-w-figma mx-auto'>
                <div className='flex flex-1 items-center justify-between'>
                  <Link to={internal.home} className='flex items-center'>
                    <img
                      className='object-contain h-8 md:h-10 w-auto aspect-auto flex-shrink-0'
                      src='images/logo.png'
                      alt='Logo'
                    />
                  </Link>

                  <div className='hidden md:-my-px md:ml-6 md:flex md:space-x-4 lg:space-x-8 xl:space-x-14 2xl:space-x-20 h-full relative'>
                    {navigators.map((item) => {
                      const isCurrent = false
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          className={twMerge(
                            isCurrent ? 'text-primary' : 'text-light-primary',
                            'inline-flex items-center justify-center t_sm font-normal h-full relative group'
                          )}
                          aria-current={isCurrent ? 'page' : undefined}
                        >
                          <span className='group-hover:nav-hover duration-200'>{item.name}</span>
                        </a>
                      )
                    })}
                    <div className='px-1 flex items-center flex-shrink-0 gap-4'>
                      <ConnectWalletButton />

                      <LanguageMenu />
                    </div>
                  </div>
                </div>

                <div className='-mr-2 flex items-center md:hidden'>
                  <Disclosure.Button className='relative inline-flex items-center justify-center rounded-md focus:outline-none'>
                    <span className='absolute -inset-0.5' />
                    <span className='sr-only'>Open main menu</span>
                    {open ? (
                      <img className='w-8 h-8' src='images/icons/close.svg' />
                    ) : (
                      <img className='w-8 h-8' src='images/icons/menu.svg' />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className='md:hidden fixed z-20 left-0 right-0 top-16 bg-black/80 backdrop-blur !border-b-primary/30'>
              <div className='space-y-1 pb-3 pt-2'>
                {navigators.map((item) => {
                  const isCurrent = false
                  return (
                    <Disclosure.Button
                      key={item.name}
                      as='a'
                      href={item.href}
                      className={twMerge(
                        isCurrent
                          ? 'bg-indigo-50 text-primary'
                          : 'border-transparent text-gray-600 hover:border-primary hover:text-primary',
                        'block py-2 px-4 t_base font-normal text-light-primary border-b-2'
                      )}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  )
                })}
                <div className='py-2 px-4'>
                  <ConnectWalletButton />
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <main className='relative overflow-x-hidden bg-black'>
        <div className='z-10'>{children}</div>
        <FooterWrapper />
      </main>
    </RootLayout>
  )
}

export default Layout
