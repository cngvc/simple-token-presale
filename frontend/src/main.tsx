// import library css
import './index.css'
import 'flag-icons/css/flag-icons.min.css'
import '@rainbow-me/rainbowkit/styles.css'
import 'react-tooltip/dist/react-tooltip.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App from '@/App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
