import { useState, useEffect, useMemo } from 'react'
import { 
  BookOpen, Briefcase, Tag, MapPin, Users, Layers,
  CheckCircle2, XCircle, TrendingUp, BarChart3
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apply-divorce-sie-inflation.trycloudflare.com'

export default function OwlCategoriesBrowser({ scrapedData = [], onCategoryClick }) {
  const [owlCategories, setOwlCategories] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('document_types')

  useEffect(() => {
    fetchOwlCategories()
  }, [])

  const fetchOwlCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/owl/categories`)
      const result = await response.json()
      
      if (result.success) {
        setOwlCategories(result.categories)
      } else {
        setError(result.error || 'Failed to load OWL categories')
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch OWL categories')
    } finally {
      setLoading(false)
    }
  }

  // Calculate usage statistics for each category
  const usageStats = useMemo(() => {
    if (!owlCategories || !scrapedData.length) {
      return {}
    }

    const stats = {
      document_types: {},
      work_types: {},
      themes: {},
      areas_of_reference: {},
      geo_areas: {},
      salesian_family_groups: {}
    }

    scrapedData.forEach(page => {
      if (page.ontology) {
        // Document types
        if (page.ontology.document_type) {
          const id = page.ontology.document_type.id
          stats.document_types[id] = (stats.document_types[id] || 0) + 1
        }

        // Work types
        if (page.ontology.work_type) {
          const id = page.ontology.work_type.id
          stats.work_types[id] = (stats.work_types[id] || 0) + 1
        }

        // Themes
        if (page.ontology.themes) {
          page.ontology.themes.forEach(theme => {
            const id = theme.id
            stats.themes[id] = (stats.themes[id] || 0) + 1
          })
        }

        // Areas of reference
        if (page.ontology.areas_of_reference) {
          page.ontology.areas_of_reference.forEach(area => {
            const id = area.id
            stats.areas_of_reference[id] = (stats.areas_of_reference[id] || 0) + 1
          })
        }

        // Geo areas
        if (page.ontology.geo_area) {
          const id = page.ontology.geo_area.id
          stats.geo_areas[id] = (stats.geo_areas[id] || 0) + 1
        }

        // Salesian family groups
        if (page.ontology.salesian_family_group) {
          const id = page.ontology.salesian_family_group.id
          stats.salesian_family_groups[id] = (stats.salesian_family_groups[id] || 0) + 1
        }
      }
    })

    return stats
  }, [owlCategories, scrapedData])

  const tabs = [
    { id: 'document_types', label: 'Document Types', icon: BookOpen, color: 'blue' },
    { id: 'work_types', label: 'Work Types', icon: Briefcase, color: 'green' },
    { id: 'themes', label: 'Themes', icon: Tag, color: 'orange' },
    { id: 'areas_of_reference', label: 'Areas of Reference', icon: Layers, color: 'purple' },
    { id: 'geo_areas', label: 'Geographical Areas', icon: MapPin, color: 'red' },
    { id: 'salesian_family_groups', label: 'Salesian Family Groups', icon: Users, color: 'indigo' }
  ]

  const renderCategoryList = (categoryTypeName) => {
    if (!owlCategories || !owlCategories[categoryTypeName]) {
      return <p className="text-gray-500">No categories available</p>
    }

    const categories = owlCategories[categoryTypeName]
    const usage = usageStats[categoryTypeName] || {}
    const totalUsed = Object.keys(usage).length
    const totalCategories = Object.keys(categories).length
    const usagePercentage = totalCategories > 0 ? (totalUsed / totalCategories * 100).toFixed(1) : 0

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">Category Coverage</h4>
              <p className="text-sm text-gray-600">
                {totalUsed} of {totalCategories} categories used ({usagePercentage}%)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {scrapedData.length > 0 
                  ? `Based on ${scrapedData.length} scraped page${scrapedData.length !== 1 ? 's' : ''} • Only categories with data are clickable`
                  : 'No scraped data yet - scrape a website to see usage'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{totalCategories}</p>
              <p className="text-xs text-gray-600">Total Categories</p>
              <p className="text-xs text-gray-500 mt-1">(from OWL file)</p>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(categories)
            .sort((a, b) => {
              // Sort by usage count (descending), then alphabetically
              const usageA = usage[a[0]] || 0
              const usageB = usage[b[0]] || 0
              if (usageB !== usageA) return usageB - usageA
              return a[1].localeCompare(b[1])
            })
            .map(([id, label]) => {
              const count = usage[id] || 0
              const isUsed = count > 0
              
              return (
                <button
                  key={id}
                  onClick={() => isUsed && onCategoryClick && onCategoryClick({
                    type: categoryTypeName,
                    label: label,
                    id: id
                  })}
                  disabled={!isUsed}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isUsed
                      ? 'bg-green-50 border-green-200 hover:border-green-300 hover:shadow-md cursor-pointer'
                      : 'bg-gray-50 border-gray-200 cursor-default opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-800 text-sm">{label}</h5>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{id}</p>
                    </div>
                    {isUsed ? (
                      <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
                    ) : (
                      <XCircle className="text-gray-400 flex-shrink-0" size={20} />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-600">Usage:</span>
                    <div className="flex items-center gap-2">
                      {isUsed ? (
                        <>
                          <TrendingUp className="text-green-600" size={14} />
                          <span className="font-semibold text-green-700">{count}</span>
                          <span className="text-xs text-gray-500">
                            page{count !== 1 ? 's' : ''}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Not used</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading OWL categories...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
        <div className="flex items-center gap-3 text-red-600">
          <XCircle size={24} />
          <div>
            <h3 className="font-semibold">Error loading OWL categories</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!owlCategories) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <p className="text-gray-600">No OWL categories available</p>
      </div>
    )
  }

  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Taxonomy</h2>
        <p className="text-blue-100 text-sm mb-2">
          Complete taxonomy from salesian_simple.owl with usage statistics
        </p>
        <div className="bg-blue-500/30 rounded-lg p-3 mt-3 border border-blue-300/50">
          <p className="text-xs text-blue-50">
            <strong>Note:</strong> All categories shown are from the OWL file (static). 
            Usage statistics (✓/✗) change based on the scraped website URL. 
            Different websites will show different categories being used.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            const categoryCount = owlCategories[tab.id] 
              ? Object.keys(owlCategories[tab.id]).length 
              : 0
            const usedCount = usageStats[tab.id] 
              ? Object.keys(usageStats[tab.id]).length 
              : 0
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white border-b-2 text-blue-700 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {categoryCount}
                </span>
                {usedCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    {usedCount} used
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderCategoryList(activeTab)}
      </div>
    </div>
  )
}

