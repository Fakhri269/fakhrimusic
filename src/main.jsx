import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MusicProvider } from './context/MusicContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MusicProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MusicProvider>
  </StrictMode>,
)
