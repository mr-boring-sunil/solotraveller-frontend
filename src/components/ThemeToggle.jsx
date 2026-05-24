import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('st_theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('st_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-2)',
        color: 'var(--text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: 'var(--shadow)',
        fontSize: '16px'
      }}
      className="theme-toggle-btn"
      title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
    </button>
  )
}
