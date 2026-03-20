import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/pacifico/latin-400.css'
import '@fontsource/lobster/latin-400.css'
import '@fontsource/great-vibes/latin-400.css'
import '@fontsource/dancing-script/latin-400.css'
import '@fontsource/cinzel-decorative/latin-400.css'
import '@fontsource/abril-fatface/latin-400.css'
import '@fontsource/bebas-neue/latin-400.css'
import '@fontsource/caveat/latin-400.css'
import '@fontsource/allura/latin-400.css'
import '@fontsource/sacramento/latin-400.css'
import '@fontsource/kaushan-script/latin-400.css'
import '@fontsource/satisfy/latin-400.css'
import '@fontsource/permanent-marker/latin-400.css'
import '@fontsource/playfair-display/latin-400.css'
import '@fontsource/anton/latin-400.css'
import '@fontsource/bangers/latin-400.css'
import '@fontsource/righteous/latin-400.css'
import './index.css'
import './local-fonts.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
