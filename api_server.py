"""
Flask API server for website taxonomy crawler
Provides REST API endpoints to crawl websites dynamically
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Import crawler functions
from crawler_taxonomy import crawl_site, scrape_single_page, allowed_by_robots
from urllib.parse import urljoin, urlparse

# Temporarily override BASE_URL for dynamic crawling
import crawler_taxonomy

app = Flask(__name__)
# Enable CORS for React frontend and Cloudflare tunnels
# In development, allow all origins for Cloudflare tunnel compatibility
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Allow all origins for Cloudflare tunnel compatibility
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "API is running"})

@app.route('/api/crawl', methods=['POST'])
def crawl_website():
    """
    Crawl a website and return taxonomy data
    
    Request body:
    {
        "url": "https://example.com",
        "max_pages": 100,  # optional, default 100
        "delay": 0.8,      # optional, default 0.8 seconds
        "single_page": false  # optional, if true, only scrape the given URL
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                "error": "Missing required field: url"
            }), 400
        
        url = data['url'].strip()
        if not url:
            return jsonify({
                "error": "URL cannot be empty"
            }), 400
        
        # Validate URL format
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return jsonify({
                    "error": "Invalid URL format. Please include http:// or https://"
                }), 400
        except Exception as e:
            return jsonify({
                "error": f"Invalid URL: {str(e)}"
            }), 400
        
        max_pages = data.get('max_pages', 100)
        delay = data.get('delay', 0.8)
        single_page = data.get('single_page', False)
        
        # Validate parameters
        if max_pages < 1 or max_pages > 1000:
            return jsonify({
                "error": "max_pages must be between 1 and 1000"
            }), 400
        
        if delay < 0 or delay > 5:
            return jsonify({
                "error": "delay must be between 0 and 5 seconds"
            }), 400
        
        # Check robots.txt (non-blocking, just warn)
        try:
            if not allowed_by_robots(url):
                print(f"[WARN] robots.txt may disallow crawling for {url}")
                # Don't block, just continue with a warning
        except Exception as e:
            print(f"[WARN] Could not check robots.txt: {e}")
        
        # Scrape single page or crawl site
        if single_page:
            result = scrape_single_page(url)
            if result:
                return jsonify({
                    "success": True,
                    "data": [result],
                    "total_pages": 1
                })
            else:
                return jsonify({
                    "error": "Failed to scrape the page",
                    "url": url
                }), 500
        else:
            # Crawl multiple pages
            results = crawl_site(start_url=url, max_pages=max_pages, delay=delay)
            
            return jsonify({
                "success": True,
                "data": results,
                "total_pages": len(results),
                "url": url
            })
    
    except Exception as e:
        return jsonify({
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/api/scrape-single', methods=['POST'])
def scrape_single():
    """
    Scrape a single page (convenience endpoint)
    
    Request body:
    {
        "url": "https://example.com/page"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                "error": "Missing required field: url"
            }), 400
        
        url = data['url'].strip()
        result = scrape_single_page(url)
        
        if result:
            return jsonify({
                "success": True,
                "data": result
            })
        else:
            return jsonify({
                "error": "Failed to scrape the page",
                "url": url
            }), 500
    
    except Exception as e:
        return jsonify({
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/api/owl/categories', methods=['GET'])
def get_owl_categories():
    """
    Get all categories from the OWL ontology file
    
    Returns:
    {
        "success": true,
        "categories": {
            "document_types": {...},
            "work_types": {...},
            "themes": {...},
            "areas_of_reference": {...},
            "geo_areas": {...},
            "salesian_family_groups": {...}
        }
    }
    """
    try:
        from owl_parser import OntologyParser
        
        owl_file = "salesian_simple.owl"
        if not os.path.exists(owl_file):
            return jsonify({
                "error": f"OWL file {owl_file} not found"
            }), 404
        
        parser = OntologyParser(owl_file)
        categories = parser.get_all_categories()
        
        return jsonify({
            "success": True,
            "categories": categories,
            "statistics": {
                "document_types_count": len(categories.get('document_types', {})),
                "work_types_count": len(categories.get('work_types', {})),
                "themes_count": len(categories.get('themes', {})),
                "areas_of_reference_count": len(categories.get('areas_of_reference', {})),
                "geo_areas_count": len(categories.get('geo_areas', {})),
                "salesian_family_groups_count": len(categories.get('salesian_family_groups', {}))
            }
        })
    
    except Exception as e:
        return jsonify({
            "error": f"Failed to load OWL categories: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

