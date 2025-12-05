"""
Data Structure Utilities for Web Scraping POC
Provides functions to structure and export scraped data in a well-organized format
"""

import json
from datetime import datetime
from typing import List, Dict, Any
from collections import defaultdict

def structure_scraped_data(scraped_pages: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Structure scraped data into a comprehensive, well-organized format
    
    Args:
        scraped_pages: List of scraped page dictionaries
        
    Returns:
        Structured data dictionary with metadata, statistics, and organized pages
    """
    
    # Initialize statistics
    stats = {
        'total_pages': len(scraped_pages),
        'categories': defaultdict(int),
        'document_types': defaultdict(int),
        'work_types': defaultdict(int),
        'themes': defaultdict(int),
        'areas_of_reference': defaultdict(int),
        'geo_areas': defaultdict(int),
        'salesian_family_groups': defaultdict(int),
        'confidence_distribution': {
            'high': 0,  # >= 0.7
            'medium': 0,  # 0.5-0.69
            'low': 0  # < 0.5
        },
        'sources': defaultdict(int)
    }
    
    # Organize pages by category
    pages_by_category = defaultdict(list)
    pages_by_document_type = defaultdict(list)
    pages_by_work_type = defaultdict(list)
    pages_by_theme = defaultdict(list)
    pages_by_area = defaultdict(list)
    pages_by_geo = defaultdict(list)
    pages_by_family_group = defaultdict(list)
    
    # Process each page
    for page in scraped_pages:
        # Basic category stats
        category = page.get('category', 'Uncategorized')
        stats['categories'][category] += 1
        pages_by_category[category].append(page)
        
        # Source stats
        source = page.get('category_source', 'unknown')
        stats['sources'][source] += 1
        
        # Confidence distribution
        confidence = page.get('confidence', 0)
        if confidence >= 0.7:
            stats['confidence_distribution']['high'] += 1
        elif confidence >= 0.5:
            stats['confidence_distribution']['medium'] += 1
        else:
            stats['confidence_distribution']['low'] += 1
        
        # Ontology-based organization
        ontology = page.get('ontology', {})
        
        if ontology.get('document_type'):
            dt = ontology['document_type']['label']
            stats['document_types'][dt] += 1
            pages_by_document_type[dt].append(page)
        
        if ontology.get('work_type'):
            wt = ontology['work_type']['label']
            stats['work_types'][wt] += 1
            pages_by_work_type[wt].append(page)
        
        if ontology.get('themes'):
            for theme in ontology['themes']:
                theme_label = theme['label']
                stats['themes'][theme_label] += 1
                pages_by_theme[theme_label].append(page)
        
        if ontology.get('areas_of_reference'):
            for area in ontology['areas_of_reference']:
                area_label = area['label']
                stats['areas_of_reference'][area_label] += 1
                pages_by_area[area_label].append(page)
        
        if ontology.get('geo_area'):
            geo = ontology['geo_area']['label']
            stats['geo_areas'][geo] += 1
            pages_by_geo[geo].append(page)
        
        if ontology.get('salesian_family_group'):
            fg = ontology['salesian_family_group']['label']
            stats['salesian_family_groups'][fg] += 1
            pages_by_family_group[fg].append(page)
    
    # Convert defaultdicts to regular dicts for JSON serialization
    def convert_defaultdict(d):
        if isinstance(d, defaultdict):
            return dict(d)
        return d
    
    stats = {k: convert_defaultdict(v) if isinstance(v, defaultdict) else v 
             for k, v in stats.items()}
    
    # Build structured output
    structured_data = {
        'metadata': {
            'export_date': datetime.now().isoformat(),
            'version': '1.0',
            'total_pages': len(scraped_pages),
            'data_format': 'structured_web_scraping_poc'
        },
        'statistics': stats,
        'organization': {
            'by_category': {k: len(v) for k, v in pages_by_category.items()},
            'by_document_type': {k: len(v) for k, v in pages_by_document_type.items()},
            'by_work_type': {k: len(v) for k, v in pages_by_work_type.items()},
            'by_theme': {k: len(v) for k, v in pages_by_theme.items()},
            'by_area_of_reference': {k: len(v) for k, v in pages_by_area.items()},
            'by_geo_area': {k: len(v) for k, v in pages_by_geo.items()},
            'by_salesian_family_group': {k: len(v) for k, v in pages_by_family_group.items()}
        },
        'pages': scraped_pages,
        'indexes': {
            'by_category': {k: [i for i, p in enumerate(scraped_pages) if p in v] 
                          for k, v in pages_by_category.items()},
            'by_document_type': {k: [i for i, p in enumerate(scraped_pages) if p in v] 
                                for k, v in pages_by_document_type.items()},
            'by_work_type': {k: [i for i, p in enumerate(scraped_pages) if p in v] 
                           for k, v in pages_by_work_type.items()},
            'by_theme': {k: [i for i, p in enumerate(scraped_pages) if p in v] 
                        for k, v in pages_by_theme.items()},
            'by_area_of_reference': {k: [i for i, p in enumerate(scraped_pages) if p in v] 
                                    for k, v in pages_by_area.items()},
            'by_geo_area': {k: [i for i, p in enumerate(scraped_pages) if p in v] 
                          for k, v in pages_by_geo.items()},
            'by_salesian_family_group': {k: [i for i, p in enumerate(scraped_pages) if p in v] 
                                       for k, v in pages_by_family_group.items()}
        }
    }
    
    return structured_data


def export_structured_data(scraped_pages: List[Dict[str, Any]], 
                          output_file: str = 'structured_scraped_data.json'):
    """
    Export scraped data in a structured format
    
    Args:
        scraped_pages: List of scraped page dictionaries
        output_file: Output file path
    """
    structured = structure_scraped_data(scraped_pages)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(structured, f, indent=2, ensure_ascii=False)
    
    print(f"[INFO] Exported structured data to {output_file}")
    print(f"[INFO] Total pages: {structured['metadata']['total_pages']}")
    print(f"[INFO] Categories: {len(structured['statistics']['categories'])}")
    print(f"[INFO] Document types: {len(structured['statistics']['document_types'])}")
    print(f"[INFO] Work types: {len(structured['statistics']['work_types'])}")
    print(f"[INFO] Themes: {len(structured['statistics']['themes'])}")
    
    return structured


def load_structured_data(input_file: str) -> Dict[str, Any]:
    """
    Load structured data from a JSON file
    
    Args:
        input_file: Input file path
        
    Returns:
        Structured data dictionary
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        return json.load(f)


if __name__ == '__main__':
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python data_structure_utils.py <input_json_file> [output_file]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'structured_scraped_data.json'
    
    print(f"[INFO] Loading data from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        scraped_pages = json.load(f)
    
    print(f"[INFO] Structuring {len(scraped_pages)} pages...")
    structured = export_structured_data(scraped_pages, output_file)
    
    print("\n[INFO] Export complete!")

