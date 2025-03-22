import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('Iniciando aplicação...')

// Garantir que o elemento root existe
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Elemento root não encontrado!')
  throw new Error('Elemento root não encontrado')
}

console.log('Elemento root encontrado, renderizando aplicação...')

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log('Aplicação renderizada com sucesso!')
} catch (error) {
  console.error('Erro ao renderizar aplicação:', error)
}