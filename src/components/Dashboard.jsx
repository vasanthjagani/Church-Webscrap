import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Globe, Tag, BarChart3, FileText, TrendingUp, 
  Search, Filter, ArrowRight, CheckCircle2, AlertCircle,
  Layers, BookOpen, MapPin, Users, Briefcase
} from 'lucide-react'
import OwlCategoriesBrowser from './OwlCategoriesBrowser'
import CategoryPagesView from './CategoryPagesView'

export default function Dashboard({ data }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedOwlCategory, setSelectedOwlCategory] = useState(null)

  // Calculate statistics including ontology data
  const stats = useMemo(() => {
    const totalPages = data.length
    const categories = {}
    const sources = {}
    let totalConfidence = 0
    let highConfidence = 0
    let mediumConfidence = 0
    let lowConfidence = 0

    // Ontology statistics
    const documentTypes = {}
    const workTypes = {}
    const themes = {}
    const areasOfReference = {}
    const geoAreas = {}
    const salesianFamilyGroups = {}
    let ontologyClassified = 0

    data.forEach(page => {
      // Category distribution
      const cat = page.category || 'Uncategorized'
      categories[cat] = (categories[cat] || 0) + 1

      // Source distribution
      const src = page.category_source || 'unknown'
      sources[src] = (sources[src] || 0) + 1

      // Confidence distribution
      const conf = page.confidence || 0
      totalConfidence += conf
      if (conf >= 0.7) highConfidence++
      else if (conf >= 0.5) mediumConfidence++
      else lowConfidence++

      // Ontology classification
      if (page.ontology && Object.keys(page.ontology).length > 0) {
        ontologyClassified++
        
        if (page.ontology.document_type) {
          const dt = page.ontology.document_type.label
          documentTypes[dt] = (documentTypes[dt] || 0) + 1
        }
        
        if (page.ontology.work_type) {
          const wt = page.ontology.work_type.label
          workTypes[wt] = (workTypes[wt] || 0) + 1
        }
        
        if (page.ontology.themes && page.ontology.themes.length > 0) {
          page.ontology.themes.forEach(theme => {
            const t = theme.label
            themes[t] = (themes[t] || 0) + 1
          })
        }
        
        if (page.ontology.areas_of_reference && page.ontology.areas_of_reference.length > 0) {
          page.ontology.areas_of_reference.forEach(area => {
            const a = area.label
            areasOfReference[a] = (areasOfReference[a] || 0) + 1
          })
        }
        
        if (page.ontology.geo_area) {
          const ga = page.ontology.geo_area.label
          geoAreas[ga] = (geoAreas[ga] || 0) + 1
        }
        
        if (page.ontology.salesian_family_group) {
          const sfg = page.ontology.salesian_family_group.label
          salesianFamilyGroups[sfg] = (salesianFamilyGroups[sfg] || 0) + 1
        }
      }
    })

    const avgConfidence = totalPages > 0 ? totalConfidence / totalPages : 0

    return {
      totalPages,
      categories,
      sources,
      avgConfidence,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      ontology: {
        documentTypes,
        workTypes,
        themes,
        areasOfReference,
        geoAreas,
        salesianFamilyGroups,
        classified: ontologyClassified
      }
    }
  }, [data])

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(page => {
      const matchesSearch = 
        page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.category?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = 
        selectedCategory === 'all' || page.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [data, searchTerm, selectedCategory])

  const categoryList = Object.keys(stats.categories).sort()

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.5) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-orange-600 bg-orange-50 border-orange-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Comprehensive analysis of scraped website data</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Pages</span>
            <FileText className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalPages}</p>
          <p className="text-xs text-gray-500 mt-1">Pages analyzed</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Categories</span>
            <Tag className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{categoryList.length}</p>
          <p className="text-xs text-gray-500 mt-1">Unique categories</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Avg Confidence</span>
            <BarChart3 className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {(stats.avgConfidence * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Average score</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">High Confidence</span>
            <TrendingUp className="text-emerald-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.highConfidence}</p>
          <p className="text-xs text-gray-500 mt-1">≥ 70% confidence</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Ontology Classified</span>
            <Layers className="text-indigo-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.ontology.classified}</p>
          <p className="text-xs text-gray-500 mt-1">Pages with ontology data</p>
        </div>
      </div>

      {/* Confidence Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={24} />
            Confidence Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">High (≥70%)</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(stats.highConfidence / stats.totalPages) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-800 w-12 text-right">
                  {stats.highConfidence}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Medium (50-69%)</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(stats.mediumConfidence / stats.totalPages) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-800 w-12 text-right">
                  {stats.mediumConfidence}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Low (&lt;50%)</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${(stats.lowConfidence / stats.totalPages) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-800 w-12 text-right">
                  {stats.lowConfidence}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Tag className="text-purple-600" size={24} />
            Top Categories
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(stats.categories)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(count / stats.totalPages) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Ontology Statistics */}
      {stats.ontology.classified > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Types */}
          {Object.keys(stats.ontology.documentTypes).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="text-blue-600" size={24} />
                Document Types
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(stats.ontology.documentTypes)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([type, count]) => {
                    // Find category ID from any page that has this document type
                    let categoryId = null
                    for (const page of data) {
                      if (page.ontology?.document_type && page.ontology.document_type.label === type) {
                        categoryId = page.ontology.document_type.id
                        break
                      }
                    }

                    return (
                      <button
                        key={type}
                        onClick={() => {
                          if (categoryId || type) {
                            setSelectedOwlCategory({
                              type: 'document_type',
                              label: type,
                              id: categoryId || type // Fallback to label if ID not found
                            })
                          }
                        }}
                        disabled={!categoryId && count === 0}
                        className={`w-full flex items-center justify-between py-2 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                          (categoryId || count > 0) ? 'cursor-pointer' : 'cursor-default opacity-60'
                        }`}
                      >
                        <span className="text-sm text-gray-700">{type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">{count}</span>
                          {(categoryId || count > 0) && <ArrowRight size={16} className="text-blue-600" />}
                        </div>
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Work Types */}
          {Object.keys(stats.ontology.workTypes).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase className="text-green-600" size={24} />
                Work Types
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(stats.ontology.workTypes)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([type, count]) => {
                    // Find category ID from any page that has this work type
                    let categoryId = null
                    for (const page of data) {
                      if (page.ontology?.work_type && page.ontology.work_type.label === type) {
                        categoryId = page.ontology.work_type.id
                        break
                      }
                    }

                    return (
                      <button
                        key={type}
                        onClick={() => {
                          if (categoryId || type) {
                            setSelectedOwlCategory({
                              type: 'work_type',
                              label: type,
                              id: categoryId || type // Fallback to label if ID not found
                            })
                          }
                        }}
                        disabled={!categoryId && count === 0}
                        className={`w-full flex items-center justify-between py-2 border-b border-gray-100 hover:bg-green-50 transition-colors ${
                          (categoryId || count > 0) ? 'cursor-pointer' : 'cursor-default opacity-60'
                        }`}
                      >
                        <span className="text-sm text-gray-700">{type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">{count}</span>
                          {(categoryId || count > 0) && <ArrowRight size={16} className="text-green-600" />}
                        </div>
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Areas of Reference */}
          {Object.keys(stats.ontology.areasOfReference).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Layers className="text-purple-600" size={24} />
                Areas of Reference
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(stats.ontology.areasOfReference)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([area, count]) => {
                    // Find category ID from any page that has this area
                    let categoryId = null
                    for (const page of data) {
                      if (page.ontology?.areas_of_reference) {
                        const matchedArea = page.ontology.areas_of_reference.find(a => a.label === area)
                        if (matchedArea?.id) {
                          categoryId = matchedArea.id
                          break
                        }
                      }
                    }

                    return (
                      <button
                        key={area}
                        onClick={() => {
                          if (categoryId) {
                            setSelectedOwlCategory({
                              type: 'area_of_reference',
                              label: area,
                              id: categoryId
                            })
                          }
                        }}
                        disabled={!categoryId}
                        className={`w-full flex items-center justify-between py-2 border-b border-gray-100 hover:bg-purple-50 transition-colors ${
                          categoryId ? 'cursor-pointer' : 'cursor-default opacity-60'
                        }`}
                      >
                        <span className="text-sm text-gray-700">{area}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">{count}</span>
                          {categoryId && <ArrowRight size={16} className="text-purple-600" />}
                        </div>
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Themes */}
          {Object.keys(stats.ontology.themes).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Tag className="text-orange-600" size={24} />
                Themes
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(stats.ontology.themes)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([theme, count]) => {
                    // Find category ID from any page that has this theme
                    let categoryId = null
                    for (const page of data) {
                      if (page.ontology?.themes) {
                        const matchedTheme = page.ontology.themes.find(t => t.label === theme)
                        if (matchedTheme?.id) {
                          categoryId = matchedTheme.id
                          break
                        }
                      }
                    }

                    return (
                      <button
                        key={theme}
                        onClick={() => {
                          if (categoryId) {
                            setSelectedOwlCategory({
                              type: 'theme',
                              label: theme,
                              id: categoryId
                            })
                          }
                        }}
                        disabled={!categoryId}
                        className={`w-full flex items-center justify-between py-2 border-b border-gray-100 hover:bg-orange-50 transition-colors ${
                          categoryId ? 'cursor-pointer' : 'cursor-default opacity-60'
                        }`}
                      >
                        <span className="text-sm text-gray-700">{theme}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">{count}</span>
                          {categoryId && <ArrowRight size={16} className="text-orange-600" />}
                        </div>
                      </button>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, URL, or category..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {categoryList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Showing {filteredData.length} of {data.length} pages
        </p>
      </div>

      {/* OWL Categories Browser */}
      <OwlCategoriesBrowser 
        scrapedData={data} 
        onCategoryClick={setSelectedOwlCategory}
      />

      {/* Category Pages View Modal */}
      {selectedOwlCategory && (
        <CategoryPagesView
          isOpen={!!selectedOwlCategory}
          onClose={() => setSelectedOwlCategory(null)}
          categoryType={selectedOwlCategory.type}
          categoryLabel={selectedOwlCategory.label}
          categoryId={selectedOwlCategory.id}
          allData={data}
        />
      )}

      {/* Recent Pages */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            Recent Pages
          </h3>
          <Link
            to="/pages"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="space-y-3">
          {filteredData.slice(0, 10).map((page, index) => (
            <Link
              key={index}
              to={`/page/${data.indexOf(page)}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{page.title || 'Untitled'}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">{page.url}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <Tag size={14} className="text-purple-600" />
                      {page.category || 'Uncategorized'}
                    </span>
                    <span className={`px-2 py-1 rounded ${getConfidenceColor(page.confidence || 0)}`}>
                      {(page.confidence * 100 || 0).toFixed(1)}%
                    </span>
                    <span className="text-gray-500">
                      {page.category_source || 'unknown'}
                    </span>
                  </div>
                </div>
                <ArrowRight className="text-gray-400" size={20} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

