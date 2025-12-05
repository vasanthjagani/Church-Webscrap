import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { X, FileText, Globe, Tag, ArrowRight, BarChart3, Search } from 'lucide-react'

export default function CategoryPagesView({ 
  isOpen, 
  onClose, 
  categoryType, 
  categoryLabel, 
  categoryId, 
  allData = [] 
}) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter pages that match this category
  const filteredPages = useMemo(() => {
    if (!isOpen || (!categoryId && !categoryLabel)) {
      return []
    }

    // Normalize label for comparison (case-insensitive, trim whitespace)
    const normalizedLabel = categoryLabel ? categoryLabel.toLowerCase().trim() : null

    const filtered = allData.filter(page => {
      if (!page.ontology) return false

      const ontology = page.ontology

      // Check based on category type - match both ID and label for accuracy
      switch (categoryType) {
        case 'document_type':
          if (!ontology.document_type) return false
          const docMatch = (categoryId && ontology.document_type.id === categoryId) || 
                          (normalizedLabel && ontology.document_type.label?.toLowerCase().trim() === normalizedLabel)
          return docMatch
          
        case 'work_type':
          if (!ontology.work_type) return false
          // Try ID match first, then label match (case-insensitive)
          const workIdMatch = categoryId && (
            ontology.work_type.id === categoryId || 
            ontology.work_type.id?.toLowerCase() === categoryId.toLowerCase()
          )
          const workLabelMatch = normalizedLabel && (
            ontology.work_type.label?.toLowerCase().trim() === normalizedLabel ||
            ontology.work_type.label?.toLowerCase().replace(/\s+/g, ' ') === normalizedLabel.replace(/\s+/g, ' ')
          )
          return workIdMatch || workLabelMatch
          
        case 'theme':
          if (!ontology.themes || !Array.isArray(ontology.themes)) return false
          return ontology.themes.some(t => 
            (categoryId && t.id === categoryId) || 
            (normalizedLabel && t.label?.toLowerCase().trim() === normalizedLabel)
          )
          
        case 'area_of_reference':
          if (!ontology.areas_of_reference || !Array.isArray(ontology.areas_of_reference)) return false
          return ontology.areas_of_reference.some(a => 
            (categoryId && a.id === categoryId) || 
            (normalizedLabel && a.label?.toLowerCase().trim() === normalizedLabel)
          )
          
        case 'geo_area':
          if (!ontology.geo_area) return false
          const geoMatch = (categoryId && ontology.geo_area.id === categoryId) || 
                          (normalizedLabel && ontology.geo_area.label?.toLowerCase().trim() === normalizedLabel)
          return geoMatch
          
        case 'salesian_family_group':
          if (!ontology.salesian_family_group) return false
          const famMatch = (categoryId && ontology.salesian_family_group.id === categoryId) || 
                          (normalizedLabel && ontology.salesian_family_group.label?.toLowerCase().trim() === normalizedLabel)
          return famMatch
          
        default:
          return false
      }
    })

    // If no results with ID/label matching, try a more flexible search
    let finalResults = filtered
    if (filtered.length === 0 && normalizedLabel && allData.length > 0) {
      // Try partial label matching as last resort
      const partialMatch = allData.filter(page => {
        if (!page.ontology) return false
        const ontology = page.ontology
        
        switch (categoryType) {
          case 'work_type':
            return ontology.work_type?.label?.toLowerCase().includes(normalizedLabel) ||
                   normalizedLabel.includes(ontology.work_type?.label?.toLowerCase() || '')
          case 'document_type':
            return ontology.document_type?.label?.toLowerCase().includes(normalizedLabel) ||
                   normalizedLabel.includes(ontology.document_type?.label?.toLowerCase() || '')
          case 'area_of_reference':
            return ontology.areas_of_reference?.some(a => 
              a.label?.toLowerCase().includes(normalizedLabel) ||
              normalizedLabel.includes(a.label?.toLowerCase() || '')
            )
          case 'theme':
            return ontology.themes?.some(t => 
              t.label?.toLowerCase().includes(normalizedLabel) ||
              normalizedLabel.includes(t.label?.toLowerCase() || '')
            )
          default:
            return false
        }
      })
      
      if (partialMatch.length > 0) {
        console.log('CategoryPagesView: Using partial match', {
          categoryType,
          categoryLabel,
          found: partialMatch.length
        })
        finalResults = partialMatch
      }
    }

    // Debug logging
    if (finalResults.length === 0 && allData.length > 0) {
      console.log('CategoryPagesView: No pages found', {
        categoryType,
        categoryId,
        categoryLabel,
        normalizedLabel,
        totalPages: allData.length,
        pagesWithOntology: allData.filter(p => p.ontology).length,
        samplePage: allData.find(p => {
          if (categoryType === 'work_type') return p.ontology?.work_type
          if (categoryType === 'document_type') return p.ontology?.document_type
          return p.ontology
        })
      })
    }

    return finalResults
  }, [isOpen, categoryType, categoryId, categoryLabel, allData])

  // Apply search filter
  const searchFiltered = useMemo(() => {
    if (!searchTerm) return filteredPages

    const term = searchTerm.toLowerCase()
    return filteredPages.filter(page => 
      page.title?.toLowerCase().includes(term) ||
      page.url?.toLowerCase().includes(term) ||
      page.meta_description?.toLowerCase().includes(term)
    )
  }, [filteredPages, searchTerm])

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.5) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-orange-600 bg-orange-50 border-orange-200'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {categoryLabel}
              </h2>
              <p className="text-sm text-gray-600">
                {categoryType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {filteredPages.length} document{filteredPages.length !== 1 ? 's' : ''} found
              </p>
              {categoryId && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  ID: {categoryId}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search within this category..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {searchFiltered.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 text-lg font-medium mb-2">
                  {searchTerm ? 'No documents found matching your search' : 'No documents found'}
                </p>
                <p className="text-gray-500 text-sm">
                  {searchTerm 
                    ? 'Try a different search term'
                    : 'This category has no matching documents in the scraped data'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchFiltered.map((page, index) => {
                  const actualIndex = allData.indexOf(page)
                  const confidence = categoryType === 'document_type' 
                    ? page.ontology?.document_type?.confidence
                    : categoryType === 'work_type'
                    ? page.ontology?.work_type?.confidence
                    : categoryType === 'theme'
                    ? page.ontology?.themes?.find(t => t.id === categoryId)?.confidence
                    : categoryType === 'area_of_reference'
                    ? page.ontology?.areas_of_reference?.find(a => a.id === categoryId)?.confidence
                    : categoryType === 'geo_area'
                    ? page.ontology?.geo_area?.confidence
                    : page.ontology?.salesian_family_group?.confidence

                  return (
                    <Link
                      key={actualIndex}
                      to={`/page/${actualIndex}`}
                      onClick={onClose}
                      className="block bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all"
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
                            <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                              <Tag size={14} />
                              {page.category || 'Uncategorized'}
                            </span>
                            {confidence !== undefined && (
                              <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getConfidenceColor(confidence)}`}>
                                <BarChart3 size={14} className="inline mr-1" />
                                {(confidence * 100).toFixed(1)}% confidence
                              </span>
                            )}
                            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded">
                              Source: {page.category_source || 'unknown'}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="text-gray-400 flex-shrink-0" size={24} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {searchFiltered.length} of {filteredPages.length} document{filteredPages.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

