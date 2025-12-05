import { useParams, Link } from 'react-router-dom'
import { 
  Globe, Tag, BarChart3, FileText, List, Code, 
  ArrowLeft, CheckCircle2, ExternalLink, Copy 
} from 'lucide-react'
import { useState } from 'react'

export default function PageDetail({ data }) {
  const { index } = useParams()
  const pageIndex = parseInt(index)
  const page = data[pageIndex]
  const [copied, setCopied] = useState(false)

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Page not found</p>
        <Link to="/pages" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to all pages
        </Link>
      </div>
    )
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.5) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-orange-600 bg-orange-50 border-orange-200'
  }

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.7) return 'High Confidence'
    if (confidence >= 0.5) return 'Medium Confidence'
    return 'Low Confidence'
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/pages"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft size={20} />
        Back to All Pages
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {page.title || 'Untitled Page'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-2">
                <Globe size={16} />
                <a 
                  href={page.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {page.url}
                </a>
                <ExternalLink size={14} className="text-gray-400" />
              </span>
              <button
                onClick={() => copyToClipboard(page.url)}
                className="text-gray-400 hover:text-gray-600"
                title="Copy URL"
              >
                <Copy size={14} />
              </button>
            </div>
            {page.meta_description && (
              <p className="text-gray-600 text-lg leading-relaxed">
                {page.meta_description}
              </p>
            )}
          </div>
        </div>

        {/* Category Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="text-blue-600" size={24} />
              <span className="text-sm font-medium text-gray-600">Category</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{page.category || 'Uncategorized'}</p>
            <p className="text-xs text-gray-500 mt-1">
              Source: {page.category_source || 'unknown'}
            </p>
            {page.category_reason && (
              <p className="text-xs text-gray-600 mt-2 italic">
                {page.category_reason}
              </p>
            )}
          </div>

          <div className={`rounded-xl p-6 border ${getConfidenceColor(page.confidence || 0)}`}>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={24} />
              <span className="text-sm font-medium">Confidence Score</span>
            </div>
            <p className="text-2xl font-bold">{(page.confidence * 100 || 0).toFixed(1)}%</p>
            <p className="text-xs mt-1">{getConfidenceLabel(page.confidence || 0)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="text-purple-600" size={24} />
              <span className="text-sm font-medium text-gray-600">Status</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">Analyzed</p>
            <p className="text-xs text-gray-500 mt-1">Ready for integration</p>
          </div>
        </div>

        {/* Ontology Classification */}
        {page.ontology && Object.keys(page.ontology).length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Code className="text-indigo-600" size={24} />
              Ontology Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {page.ontology.document_type && (
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <div className="text-sm font-medium text-indigo-700 mb-1">Document Type</div>
                  <div className="text-lg font-bold text-indigo-900">{page.ontology.document_type.label}</div>
                  <div className="text-xs text-indigo-600 mt-1">
                    Confidence: {(page.ontology.document_type.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}
              
              {page.ontology.work_type && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm font-medium text-green-700 mb-1">Work Type</div>
                  <div className="text-lg font-bold text-green-900">{page.ontology.work_type.label}</div>
                  <div className="text-xs text-green-600 mt-1">
                    Confidence: {(page.ontology.work_type.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}
              
              {page.ontology.themes && page.ontology.themes.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-sm font-medium text-orange-700 mb-2">Themes</div>
                  <div className="space-y-1">
                    {page.ontology.themes.map((theme, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-orange-900">{theme.label}</span>
                        <span className="text-xs text-orange-600">
                          {(theme.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {page.ontology.areas_of_reference && page.ontology.areas_of_reference.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm font-medium text-purple-700 mb-2">Areas of Reference</div>
                  <div className="space-y-1">
                    {page.ontology.areas_of_reference.map((area, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-purple-900">{area.label}</span>
                        <span className="text-xs text-purple-600">
                          {(area.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {page.ontology.geo_area && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm font-medium text-blue-700 mb-1">Geographical Area</div>
                  <div className="text-lg font-bold text-blue-900">{page.ontology.geo_area.label}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    Confidence: {(page.ontology.geo_area.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}
              
              {page.ontology.salesian_family_group && (
                <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                  <div className="text-sm font-medium text-pink-700 mb-1">Salesian Family Group</div>
                  <div className="text-lg font-bold text-pink-900">{page.ontology.salesian_family_group.label}</div>
                  <div className="text-xs text-pink-600 mt-1">
                    Confidence: {(page.ontology.salesian_family_group.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      {page.li_items && page.li_items.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <List className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Navigation Structure</h3>
            <span className="ml-auto text-sm text-gray-500">{page.li_items.length} items</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {page.li_items.slice(0, 24).map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-700 truncate">{item}</span>
              </div>
            ))}
          </div>
          {page.li_items.length > 24 && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              + {page.li_items.length - 24} more items
            </p>
          )}
        </div>
      )}

      {/* Content Preview */}
      {page.clean_text && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Content Preview</h3>
            <span className="ml-auto text-sm text-gray-500">
              {page.clean_text.length.toLocaleString()} characters
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {page.clean_text.substring(0, 5000)}
              {page.clean_text.length > 5000 && '...'}
            </p>
          </div>
        </div>
      )}

      {/* HTML Blocks */}
      {page.ul_blocks && page.ul_blocks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Code className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Detected UL Blocks</h3>
            <span className="ml-auto text-sm text-gray-500">{page.ul_blocks.length} blocks</span>
          </div>
          <div className="space-y-3">
            {page.ul_blocks.slice(0, 5).map((block, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">Block {i + 1}</span>
                  <span className="text-xs text-gray-400">{block.length} characters</span>
                </div>
                <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {block.substring(0, 500)}
                  {block.length > 500 && '...'}
                </pre>
              </div>
            ))}
          </div>
          {page.ul_blocks.length > 5 && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              + {page.ul_blocks.length - 5} more blocks
            </p>
          )}
        </div>
      )}

      {/* Full HTML Snippet (Collapsible) */}
      {page.full_html_snippet && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Code className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Full HTML Snippet</h3>
            <span className="ml-auto text-sm text-gray-500">
              {page.full_html_snippet.length.toLocaleString()} characters
            </span>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-200 max-h-96 overflow-auto">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {page.full_html_snippet.substring(0, 10000)}
              {page.full_html_snippet.length > 10000 && '\n\n... (truncated)'}
            </pre>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6">
        {pageIndex > 0 && (
          <Link
            to={`/page/${pageIndex - 1}`}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Previous Page
          </Link>
        )}
        <div className="flex-1"></div>
        {pageIndex < data.length - 1 && (
          <Link
            to={`/page/${pageIndex + 1}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            Next Page
            <ArrowLeft size={18} className="rotate-180" />
          </Link>
        )}
      </div>
    </div>
  )
}

