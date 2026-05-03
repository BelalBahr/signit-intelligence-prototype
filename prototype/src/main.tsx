import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PersonaProvider } from './context/Persona'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersonaProvider>
      <App />
    </PersonaProvider>
  </StrictMode>,
)
