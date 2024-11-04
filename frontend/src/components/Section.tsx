import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type RootProps = {
  children: ReactNode
  className?: string
}

const Section: React.FC<RootProps> = ({ children, className }) => {
  return (
    <section className={twMerge('flex flex-col w-full')}>
      <div
        className={twMerge(
          'mx-auto max-w-figma px-4 md:px-8 xl:px-16 flex flex-col w-full h-auto py-10 md:py-14',
          className
        )}
      >
        {children}
      </div>
    </section>
  )
}

export default Section
