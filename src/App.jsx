import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Globe, Home, List, BarChart3, Search, Loader2, AlertCircle } from 'lucide-react'
import Dashboard from './components/Dashboard'
import PageList from './components/PageList'
import PageDetail from './components/PageDetail'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apply-divorce-sie-inflation.trycloudflare.com'

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [crawling, setCrawling] = useState(false)
  const [error, setError] = useState(null)
  const [url, setUrl] = useState('')
  const [maxPages, setMaxPages] = useState(100)
  const [delay, setDelay] = useState(0.8)
  const [singlePage, setSinglePage] = useState(false)
  const location = useLocation()

  const handleCrawl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setCrawling(true)
    setError(null)
    setData([])

    try {
      const response = await fetch(`${API_BASE_URL}/api/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          max_pages: maxPages,
          delay: delay,
          single_page: singlePage,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to crawl website')
      }

      if (result.success && result.data) {
        setData(result.data)
        setError(null)
      } else {
        throw new Error('No data returned from server')
      }
    } catch (err) {
      console.error('Crawl error:', err)
      setError(err.message || 'Failed to crawl website. Make sure the API server is running.')
      setData([])
    } finally {
      setCrawling(false)
    }
  }

  // Load existing data on mount (optional - for demo)
  useEffect(() => {
    // Try to load static JSON if available (for demo purposes)
    fetch('/donbosco_site_with_taxonomy.json')
      .then(res => res.json())
      .then(json => {
        if (json && json.length > 0) {
          setData(json)
        }
      })
      .catch(() => {
        // Ignore if file doesn't exist
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="text-blue-600" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Classification for Web Document Ingestion
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  location.pathname === '/'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home size={18} />
                Dashboard
              </Link>
              <Link
                to="/pages"
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  location.pathname === '/pages'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List size={18} />
                All Pages ({data.length})
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* URL Input Section */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Crawl New Website</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && !crawling && handleCrawl()}
                  disabled={crawling}
                />
              </div>
              <button
                onClick={handleCrawl}
                disabled={crawling || !url.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {crawling ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Crawling...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Crawl Website
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Pages
                </label>
                <input
                  type="number"
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value) || 100)}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  disabled={crawling}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay (seconds)
                </label>
                <input
                  type="number"
                  value={delay}
                  onChange={(e) => setDelay(parseFloat(e.target.value) || 0.8)}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  disabled={crawling}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={singlePage}
                    onChange={(e) => setSinglePage(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={crawling}
                  />
                  <span className="text-sm font-medium text-gray-700">Single Page Only</span>
                </label>
              </div>
            </div>
          </div>

          {crawling && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-600" size={20} />
                <div>
                  <p className="text-blue-800 font-medium">Crawling website...</p>
                  <p className="text-blue-600 text-sm">This may take a few minutes depending on the number of pages.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard data={data} />} />
          <Route path="/pages" element={<PageList data={data} />} />
          <Route path="/page/:index" element={<PageDetail data={data} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

