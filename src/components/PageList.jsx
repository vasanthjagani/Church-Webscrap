import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Tag, BarChart3, ArrowRight, Globe } from 'lucide-react'

export default function PageList({ data }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set()
    data.forEach(page => {
      if (page.category) cats.add(page.category)
    })
    return Array.from(cats).sort()
  }, [data])

  // Filter and sort data
  const filteredAndSorted = useMemo(() => {
    let filtered = data.filter(page => {
      const matchesSearch = 
        page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.meta_description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = 
        selectedCategory === 'all' || page.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal
      switch (sortBy) {
        case 'title':
          aVal = (a.title || '').toLowerCase()
          bVal = (b.title || '').toLowerCase()
          break
        case 'category':
          aVal = (a.category || '').toLowerCase()
          bVal = (b.category || '').toLowerCase()
          break
        case 'confidence':
          aVal = a.confidence || 0
          bVal = b.confidence || 0
          break
        case 'url':
          aVal = (a.url || '').toLowerCase()
          bVal = (b.url || '').toLowerCase()
          break
        default:
          return 0
      }

      if (sortBy === 'confidence') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    })

    return filtered
  }, [data, searchTerm, selectedCategory, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredAndSorted.slice(startIndex, startIndex + itemsPerPage)

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.5) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-orange-600 bg-orange-50 border-orange-200'
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">All Pages</h2>
        <p className="text-gray-600">Browse and search through all analyzed pages</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search pages..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-8 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
                setCurrentPage(1)
              }}
              className="w-full pl-4 pr-8 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white"
            >
              <option value="title-asc">Sort: Title (A-Z)</option>
              <option value="title-desc">Sort: Title (Z-A)</option>
              <option value="category-asc">Sort: Category (A-Z)</option>
              <option value="confidence-desc">Sort: Confidence (High-Low)</option>
              <option value="confidence-asc">Sort: Confidence (Low-High)</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSorted.length)} of {filteredAndSorted.length} pages
        </p>
      </div>

      {/* Page List */}
      <div className="space-y-3">
        {paginatedData.map((page, index) => {
          const actualIndex = data.indexOf(page)
          return (
            <Link
              key={actualIndex}
              to={`/page/${actualIndex}`}
              className="block bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <Globe className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {page.title || 'Untitled Page'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 break-all">{page.url}</p>
                      {page.meta_description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {page.meta_description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                      <Tag size={14} />
                      {page.category || 'Uncategorized'}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getConfidenceColor(page.confidence || 0)}`}>
                      <BarChart3 size={14} className="inline mr-1" />
                      {(page.confidence * 100 || 0).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded">
                      Source: {page.category_source || 'unknown'}
                    </span>
                    {page.li_items && page.li_items.length > 0 && (
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded">
                        {page.li_items.length} nav items
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="text-gray-400 flex-shrink-0" size={24} />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

