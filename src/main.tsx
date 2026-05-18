import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { TenantWhitelabelBootstrap } from './whitelabel/TenantWhitelabelBootstrap'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TenantWhitelabelBootstrap />
    <App />
  </StrictMode>,
)
