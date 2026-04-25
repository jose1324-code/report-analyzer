'use client'

import { useState } from 'react'
import { Loader2, ExternalLink, SearchX } from 'lucide-react'

interface TavilyResult {
  title: string
  url: string
  content: string
}

const TAVILY_API_KEY = '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'

export default function PriceSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TavilyResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query,
          search_depth: 'advanced',
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = await res.json()
      setResults((data.results ?? []).slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder='e.g. "MRI scan price Chennai"'
          className="flex-1 h-11 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length === 0 && !error && (
        <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
          <SearchX className="w-10 h-10" />
          <p className="text-sm">No results found</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((item, i) => (
            <div key={i} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-2 group"
              >
                <h3 className="text-sm font-semibold text-blue-700 group-hover:underline leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <ExternalLink className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
              </a>
              <p className="mt-2 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                {item.content}
              </p>
              <p className="mt-1 text-[11px] text-gray-400 truncate">{item.url}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
