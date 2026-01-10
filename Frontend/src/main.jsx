import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import HeaderPage from './pages/HeaderPage.jsx'
import FooterPage from './pages/FooterPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <HeaderPage />
      <App />
      <FooterPage />
    </BrowserRouter>
  </StrictMode>,
)
