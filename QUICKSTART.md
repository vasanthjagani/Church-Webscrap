# Quick Start Guide - OWL-Based Web Scraping POC

## What's New

This POC now includes:

1. **Complete OWL Categories Browser** - View all categories from `salesian_simple.owl` with usage statistics
2. **Enhanced API** - New endpoint `/api/owl/categories` to fetch all OWL taxonomy
3. **Improved Data Structure** - Utilities to export well-organized structured data
4. **Enhanced Dashboard** - Shows all OWL categories, not just used ones

## Quick Setup

### 1. Install Dependencies

```bash
# Python dependencies
pip install -r requirements.txt

# Node.js dependencies
npm install
```

### 2. Start the Backend

```bash
python api_server.py
```

The API will run at `http://localhost:5000`

### 3. Start the Frontend

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or similar Vite port)

## Key Features

### OWL Categories Browser

The dashboard now includes a comprehensive OWL Categories Browser that shows:

- **All categories** from the OWL file (even if not used yet)
- **Usage statistics** - which categories are used in scraped data
- **6 category types**:
  - Document Types (20+)
  - Work Types (12+)
  - Themes (12+)
  - Areas of Reference (11+)
  - Geographical Areas (7)
  - Salesian Family Groups (6)

### Data Structure

Use the data structure utilities to export well-organized data:

```bash
python data_structure_utils.py donbosco_site_with_taxonomy.json structured_output.json
```

This creates a structured JSON with:

- Metadata
- Statistics
- Organized pages by category
- Indexes for quick lookup

## Testing the OWL Integration

1. Start both servers (backend and frontend)
2. Navigate to the Dashboard
3. Scroll down to see the "OWL Taxonomy Browser" section
4. Click through different category tabs to see all categories
5. Green checkmarks indicate categories used in scraped data
6. Gray X marks indicate categories not yet used

## API Testing

Test the OWL categories endpoint:

```bash
curl http://localhost:5000/api/owl/categories
```

This returns all categories from the OWL file with statistics.

## Example Workflow

1. **Crawl a website**:

   - Enter URL in the dashboard
   - Click "Crawl Website"
   - Wait for scraping to complete

2. **View results**:

   - Dashboard shows statistics
   - OWL Categories Browser shows all available categories
   - See which categories were used in the scraped data

3. **Export structured data**:
   ```bash
   python data_structure_utils.py donbosco_site_with_taxonomy.json output.json
   ```

## Troubleshooting

**OWL categories not loading?**

- Ensure `salesian_simple.owl` is in the project root
- Check API server logs for errors
- Verify the file is valid OWL/RDF format

**Frontend not connecting to API?**

- Check API server is running on port 5000
- Verify CORS is enabled in `api_server.py`
- Check browser console for errors

## Next Steps

- Customize the OWL parser for your specific needs
- Add more classification rules
- Extend the dashboard with additional visualizations
- Export data in different formats (CSV, Excel, etc.)
