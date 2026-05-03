import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import './ThemeToggle.css'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  // Aplica o tema salvo ao carregar
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      setDark(true)
    }
  }, [])

  return (
    <button
      className={`theme-toggle ${dark ? 'dark' : 'light'}`}
      onClick={() => setDark(!dark)}
      title={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}