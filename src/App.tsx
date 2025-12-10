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
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>🔓 Educational Unblocker</h1>
      <p>Access blocked documentation and research sites safely.</p>
      
      <form onSubmit={handleBrowse} style={{ marginTop: '2rem' }}>
        <input 
          type="text" 
          placeholder="Enter website (e.g., wikipedia.org)" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ 
            padding: '10px', 
            width: '300px', 
            borderRadius: '5px', 
            border: '1px solid #ccc' 
          }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '10px 20px', 
            marginLeft: '10px', 
            background: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          Go
        </button>
      </form>
      
      <p style={{marginTop: '20px', fontSize: '0.8rem', color: '#666'}}>
        Note: Do not login to sensitive accounts. This is for reading only.
      </p>
    </div>
  )
}

export default App
