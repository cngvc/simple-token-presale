import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'

import i18n from '@/i18n'
import Home from '@/pages/home'
import PrivacyPolicy from '@/pages/privacy-policy'
import TermsOfUse from '@/pages/terms-of-use'
import { internal } from '@/urls'
import { config } from '@/wallets'

const router = createBrowserRouter([
  {
    path: internal.home,
    element: <Home />
  },
  {
    path: internal.privacy_policy,
    element: <PrivacyPolicy />
  },
  {
    path: internal.terms_of_use,
    element: <TermsOfUse />
  }
])

const queryClient = new QueryClient()

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            coolMode
            theme={darkTheme({
              accentColor: '#d7b26d',
              accentColorForeground: '#FFFFFF',
              borderRadius: 'large'
            })}
          >
            <RouterProvider router={router} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </I18nextProvider>
  )
}

export default App
