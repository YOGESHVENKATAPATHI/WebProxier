import { useState } from 'react'
import './App.css'
import AboutPage from './pages/AboutPage'
import HowItWorksPage from './pages/HowItWorksPage'
import SupportedSitesPage from './pages/SupportedSitesPage'
import PrivacySafetyPage from './pages/PrivacySafetyPage'
import GettingStartedPage from './pages/GettingStartedPage'
import TroubleshootingPage from './pages/TroubleshootingPage'

const pageItems = [
  { id: 'about', title: 'About Proxy', component: <AboutPage /> },
  { id: 'how-it-works', title: 'How It Works', component: <HowItWorksPage /> },
  { id: 'supported-sites', title: 'Supported Sites', component: <SupportedSitesPage /> },
  { id: 'privacy-safety', title: 'Privacy & Safety', component: <PrivacySafetyPage /> },
  { id: 'getting-started', title: 'Getting Started', component: <GettingStartedPage /> },
  { id: 'troubleshooting', title: 'Troubleshooting', component: <TroubleshootingPage /> },
]

function App() {
  const [url, setUrl] = useState('')
  const [activePage, setActivePage] = useState<string | null>(null)

  const handleBrowse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    const target = url.startsWith('http') ? url : `https://${url}`
    window.location.href = `/api/proxy?url=${encodeURIComponent(target)}`
  }

  const selectedPage = pageItems.find((page) => page.id === activePage)

  return (
    <div className="app-container">
      <div className="glass-card">
        <h1 className="title">
          <span>🔓</span> Educational Unblocker
        </h1>
        <p className="subtitle">
          Access blocked documentation and research sites safely and securely.
        </p>

        <form onSubmit={handleBrowse} className="search-form">
          <div className="search-input-wrapper">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Enter website URL (e.g., wikipedia.org)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="submit-btn">
            Browse
          </button>
        </form>

        <div className="disclaimer">
          <svg className="disclaimer-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Note: Do not login to sensitive accounts. This is for reading only.
        </div>

        {!selectedPage ? (
          <section className="page-section">
            <h2>Explore the app</h2>
            <p>Choose a topic below to learn more about how WebProxier works.</p>

            <div className="page-grid">
              {pageItems.map((page) => (
                <button
                  key={page.id}
                  className="page-card"
                  onClick={() => setActivePage(page.id)}
                  type="button"
                >
                  {page.title}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <div className="page-content">
            <div className="page-header">
              <button className="back-btn" onClick={() => setActivePage(null)} type="button">
                ← Back to home
              </button>
            </div>
            {selectedPage.component}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
