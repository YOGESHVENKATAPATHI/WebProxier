import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')

  const handleBrowse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Redirect the user to our backend proxy URL
    // We use window.location.href to "leave" React and view the proxied page
    const target = url.startsWith('http') ? url : `https://${url}`;
    window.location.href = `/api/proxy?url=${encodeURIComponent(target)}`;
  }

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
      </div>
    </div>
  )
}

export default App
