import React, { ReactNode } from 'react'

import ScrollToTop from '@/components/ScrollToTop'

type RootProps = {
  children: ReactNode
}

const RootLayout: React.FC<RootProps> = ({ children }) => {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  )
}

export default RootLayout
