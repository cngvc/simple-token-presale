import { Disclosure } from '@headlessui/react'
import $ from 'jquery'
import { ReactNode, useEffect } from 'react'
import { Link } from 'react-router-dom'

import FooterWrapper from '@/components/FooterWrapper'
import RootLayout from '@/components/Layouts/RootLayout'
import { internal } from '@/urls'

type LayoutProps = {
  children: ReactNode
}

const SimpleLayout: React.FC<LayoutProps> = ({ children }) => {
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
        {() => (
          <>
            <div className='fixed z-20 left-0 right-0 js-header duration-200 border-b border-transparent'>
              <div className='px-4 md:px-8 xl:px-16 flex h-16 md:h-32 justify-between max-w-figma mx-auto'>
                <div className='flex flex-1 items-center justify-between'>
                  <Link to={internal.home} className='flex items-center'>
                    <img
                      className='object-contain h-8 md:h-10  w-auto aspect-auto flex-shrink-0'
                      src='images/logo.png'
                      alt='Logo'
                    />
                  </Link>
                </div>

                <div className='-mr-2 flex items-center md:hidden'></div>
              </div>
            </div>
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

export default SimpleLayout
