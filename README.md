# Website Taxonomy Analyzer - OWL-Based Web Scraping POC

A comprehensive web scraping proof-of-concept that uses OWL ontology (Salesian Simple Taxonomy) to classify and organize scraped website data. Features a modern React dashboard with complete OWL category browser and structured data management.

## Features

- 🌐 **Dynamic Website Crawling**: Enter any URL to crawl and analyze websites in real-time
- 🦉 **OWL Ontology Integration**: Uses `salesian_simple.owl` for intelligent classification
- 📊 **Comprehensive Dashboard**: Statistics, category distribution, and confidence metrics
- 🗂️ **OWL Categories Browser**: Complete taxonomy browser showing all categories from the OWL file with usage statistics
- 📄 **Page List**: Browse all scraped pages with search, filter, and sorting
- 🔍 **Detailed Page View**: Complete information for each page including:
  - OWL-based classification (Document Types, Work Types, Themes, Areas of Reference, Geo Areas, Salesian Family Groups)
  - Category classification with confidence scores
  - Navigation structure (UL blocks and LI items)
  - Content preview
  - Full HTML snippets
- 📦 **Structured Data Export**: Well-organized data structure with metadata and indexes
- 🎨 **Modern UI**: Beautiful gradient design with Tailwind CSS
- ⚡ **Fast Navigation**: Quick access between pages with pagination
- 🔧 **Configurable Crawling**: Adjust max pages, delay, and single-page mode

## Setup Instructions

### 1. Install Python Dependencies

First, install the Python backend dependencies:

```bash
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Start the Backend API Server

In one terminal, start the Flask API server:

```bash
python api_server.py
```

The API will run at `http://localhost:5000`

### 4. Start the React Frontend

In another terminal, start the React development server:

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### 5. Use the Application

1. Enter a website URL in the input field (e.g., `https://example.com`)
2. Configure crawling options:
   - **Max Pages**: Maximum number of pages to crawl (1-1000)
   - **Delay**: Delay between requests in seconds (0-5)
   - **Single Page Only**: Check to scrape only the entered URL
3. Click "Crawl Website" to start the analysis
4. View results in the Dashboard, Page List, or individual page details

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
├── salesian_simple.owl          # OWL ontology file (Salesian Simple Taxonomy)
├── owl_parser.py                 # OWL file parser and classifier
├── crawler_taxonomy.py           # Web crawler with OWL classification
├── api_server.py                 # Flask API server with OWL endpoints
├── data_structure_utils.py       # Data structuring and export utilities
├── requirements.txt              # Python dependencies
├── public/
│   └── donbosco_site_with_taxonomy.json  # Your scraped data
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx              # Overview dashboard
│   │   ├── OwlCategoriesBrowser.jsx   # OWL taxonomy browser
│   │   ├── PageList.jsx               # List of all pages
│   │   └── PageDetail.jsx             # Individual page details
│   ├── App.jsx                        # Main app component with routing
│   ├── main.jsx                       # Entry point
│   └── index.css                      # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Usage

1. **Dashboard**: View overall statistics, OWL category browser, and recent pages
2. **OWL Categories Browser**:
   - Browse all categories from the OWL ontology file
   - See which categories are used in scraped data
   - View usage statistics for each category type:
     - Document Types (e.g., Video, Audio, Manual, Statistics)
     - Work Types (e.g., School, Parish, Oratory, Social Work)
     - Themes (e.g., Youth Ministry, Don Bosco, Preventive System)
     - Areas of Reference (e.g., Education, History, Spirituality)
     - Geographical Areas (e.g., Asia, Europe, America, Africa)
     - Salesian Family Groups (e.g., SDB, FMA, Salesian Cooperators)
3. **All Pages**: Browse, search, and filter all scraped pages
4. **Page Detail**: Click any page to see detailed information including:
   - OWL-based classification with confidence scores
   - Category classification
   - Navigation items
   - Content preview
   - HTML structure

## OWL Ontology Integration

The system uses the `salesian_simple.owl` file to classify scraped content. The OWL parser extracts:

- **Document Types**: 20+ types (Video, Audio, Manual, Statistics, etc.)
- **Work Types**: 12+ types (School, Parish, Oratory, Social Work, etc.)
- **Themes**: 12+ themes (Youth Ministry, Don Bosco, Preventive System, etc.)
- **Areas of Reference**: 11+ areas (Education, History, Spirituality, etc.)
- **Geographical Areas**: 7 areas (Asia, Europe, America, Africa, etc.)
- **Salesian Family Groups**: 6 groups (SDB, FMA, Salesian Cooperators, etc.)

Each scraped page is automatically classified using these categories with confidence scores.

## API Endpoints

### POST `/api/crawl`

Crawl a website and return taxonomy data.

**Request Body:**

```json
{
  "url": "https://example.com",
  "max_pages": 100,
  "delay": 0.8,
  "single_page": false
}
```

**Response:**

```json
{
  "success": true,
  "data": [...],
  "total_pages": 50,
  "url": "https://example.com"
}
```

### POST `/api/scrape-single`

Scrape a single page only.

**Request Body:**

```json
{
  "url": "https://example.com/page"
}
```

### GET `/api/health`

Health check endpoint.

### GET `/api/owl/categories`

Get all categories from the OWL ontology file.

**Response:**

```json
{
  "success": true,
  "categories": {
    "document_types": {"Doc_Video": "Video", "Doc_Audio": "Audio", ...},
    "work_types": {"Work_School": "School", "Work_Parish": "Parish", ...},
    "themes": {"Theme_youth_ministry": "youth ministry", ...},
    "areas_of_reference": {"Area_Education": "Education", ...},
    "geo_areas": {"Geo_Asia": "Asia", ...},
    "salesian_family_groups": {"Fam_SDB": "Salesians of Don Bosco", ...}
  },
  "statistics": {
    "document_types_count": 20,
    "work_types_count": 12,
    "themes_count": 12,
    "areas_of_reference_count": 11,
    "geo_areas_count": 7,
    "salesian_family_groups_count": 6
  }
}
```

## Data Format

### Basic Page Format

The API returns data in the following format:

```json
[
  {
    "url": "https://example.com",
    "title": "Page Title",
    "meta_description": "Page description",
    "category": "Category Name",
    "confidence": 0.85,
    "category_source": "ontology",
    "category_reason": "Reason for classification",
    "ontology": {
      "document_type": {
        "id": "Doc_Video",
        "label": "Video",
        "confidence": 0.85
      },
      "work_type": {
        "id": "Work_School",
        "label": "School",
        "confidence": 0.72
      },
      "themes": [
        {
          "id": "Theme_youth_ministry",
          "label": "youth ministry",
          "confidence": 0.68
        }
      ],
      "areas_of_reference": [
        { "id": "Area_Education", "label": "Education", "confidence": 0.75 }
      ],
      "geo_area": {
        "id": "Geo_Asia",
        "label": "Asia",
        "confidence": 0.6
      },
      "salesian_family_group": {
        "id": "Fam_SDB",
        "label": "Salesians of Don Bosco",
        "confidence": 0.55
      }
    },
    "ul_blocks": ["<ul>...</ul>"],
    "li_items": ["Item 1", "Item 2"],
    "clean_text": "Extracted text content",
    "full_html_snippet": "<html>...</html>"
  }
]
```

### Structured Data Format

Use `data_structure_utils.py` to export data in a structured format:

```bash
python data_structure_utils.py donbosco_site_with_taxonomy.json structured_output.json
```

This creates a well-organized JSON file with:

- **Metadata**: Export date, version, total pages
- **Statistics**: Comprehensive statistics for all categories
- **Organization**: Pages organized by all category types
- **Indexes**: Quick lookup indexes for efficient querying
- **Pages**: Complete page data

## Technologies Used

### Frontend

- **React 18**: UI framework
- **React Router**: Navigation and routing
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

### Backend

- **Python 3**: Backend language
- **Flask**: Web framework for API
- **BeautifulSoup4**: HTML parsing
- **Requests**: HTTP client
- **RDFLib**: OWL/RDF parsing (optional)
- **OpenAI API**: AI-powered classification fallback (optional)

## Customization

- Modify colors in `tailwind.config.js`
- Update components in `src/components/`
- Adjust routing in `src/App.jsx`

## Data Structure Utilities

The `data_structure_utils.py` script provides utilities for structuring and exporting scraped data:

```python
from data_structure_utils import structure_scraped_data, export_structured_data

# Structure scraped pages
structured = structure_scraped_data(scraped_pages)

# Export to file
export_structured_data(scraped_pages, 'structured_output.json')
```

The structured format includes:

- Metadata (export date, version, statistics)
- Organized pages by category types
- Indexes for efficient lookup
- Complete statistics

## Troubleshooting

**Data not loading?**

- Ensure `donbosco_site_with_taxonomy.json` is in the `public` folder
- Check browser console for errors
- Verify JSON file is valid

**OWL categories not showing?**

- Ensure `salesian_simple.owl` is in the project root
- Check that the API server is running and can access the OWL file
- Verify the OWL file format is correct

**Styling issues?**

- Run `npm install` to ensure all dependencies are installed
- Clear browser cache

**API connection errors?**

- Ensure the Flask API server is running on port 5000
- Check CORS settings if accessing from a different origin
- Verify the API endpoint `/api/owl/categories` is accessible

## License

MIT
