"""
crawler_taxonomy.py
- Recursively crawl internal links of a site
- Extract full HTML, ul blocks, li items, clean text
- Classify using OWL ontology (Salesian Simple Taxonomy)
- Fallback to predefined taxonomy or OpenAI if needed
- Save final structured output to JSON
"""
 
import os
import time
import json
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from collections import deque

# Import OWL parser
try:
    from owl_parser import OntologyParser
    OWL_PARSER = None
    OWL_FILE = "salesian_simple.owl"
    if os.path.exists(OWL_FILE):
        try:
            OWL_PARSER = OntologyParser(OWL_FILE)
            print(f"[INFO] Loaded OWL ontology from {OWL_FILE}")
        except Exception as e:
            print(f"[WARN] Failed to load OWL ontology: {e}")
    else:
        print(f"[WARN] OWL file {OWL_FILE} not found. Ontology classification disabled.")
except ImportError:
    print("[WARN] OWL parser not available. Ontology classification disabled.")
    OWL_PARSER = None
 
OPENAI_API_KEY = ""
BASE_URL = "https://www.donboscochennai.org"
OUTPUT_FILE = "donbosco_site_with_taxonomy.json"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
 
# --- Predefined taxonomy (example) ---
PREDEFINED_TAXONOMY = {
    "About": ["about", "who we are", "history", "mission"],
    "News": ["news", "press", "bulletin", "announc"],
    "Events": ["event", "calendar", "schedule", "program"],
    "Institutions": ["school", "college", "institute", "home", "parish"],
    "Projects": ["project", "initiative", "program"],
    "Contact": ["contact", "address", "phone", "email"],
    "Media": ["gallery", "photo", "video", "multimedia"],
    "Leadership": ["rector", "principal", "director", "staff", "leadership"],
    "Admissions": ["admission", "apply", "fees", "enroll"],
    # extend with domain-specific keywords
}
 
# --- Helper functions ---
def is_internal(url, base_url=None):
    """Check if URL is internal to the base URL"""
    if not url:
        return False
    if base_url is None:
        base_url = BASE_URL
    parsed = urlparse(urljoin(base_url, url))
    base_parsed = urlparse(base_url)
    return parsed.netloc == base_parsed.netloc
 
def normalize_url(url):
    return url.split('#')[0].rstrip('/')
 
def safe_get(url, timeout=12, retries=2):
    """
    Safely fetch a URL with retry logic and better headers
    
    Args:
        url: URL to fetch
        timeout: Request timeout in seconds
        retries: Number of retry attempts
        
    Returns:
        HTML content as string or None if failed
    """
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0"
    }
    
    for attempt in range(retries + 1):
        try:
            r = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
            
            # Check for 403 Forbidden
            if r.status_code == 403:
                print(f"[WARN] GET {url} failed: 403 Forbidden - Website may be blocking automated requests")
                print(f"[INFO] Try using a different URL or check if the website requires authentication")
                return None
            
            # Check for other client errors
            if r.status_code >= 400:
                if attempt < retries:
                    print(f"[INFO] GET {url} returned {r.status_code}, retrying... (attempt {attempt + 1}/{retries + 1})")
                    time.sleep(1)  # Wait before retry
                    continue
                else:
                    r.raise_for_status()
            
            return r.text
            
        except requests.exceptions.Timeout:
            if attempt < retries:
                print(f"[INFO] GET {url} timed out, retrying... (attempt {attempt + 1}/{retries + 1})")
                time.sleep(1)
                continue
            else:
                print(f"[WARN] GET {url} failed: Timeout after {retries + 1} attempts")
                return None
                
        except requests.exceptions.RequestException as e:
            if attempt < retries:
                print(f"[INFO] GET {url} failed: {e}, retrying... (attempt {attempt + 1}/{retries + 1})")
                time.sleep(1)
                continue
            else:
                print(f"[WARN] GET {url} failed: {e}")
                return None
        except Exception as e:
            print(f"[WARN] GET {url} failed with unexpected error: {e}")
            return None
    
    return None
 
def extract_html_parts(html):
    soup = BeautifulSoup(html, "html.parser")
    data = {}
    data["full_html"] = str(soup)
    data["ul_blocks"] = [str(u) for u in soup.find_all("ul")]
    data["li_items"] = [li.get_text(" ", strip=True) for li in soup.find_all("li")]
    data["clean_text"] = soup.get_text(" ", strip=True)
    # optionally capture title/meta
    data["title"] = soup.title.string.strip() if soup.title and soup.title.string else ""
    meta_desc = soup.find("meta", attrs={"name":"description"})
    data["meta_description"] = meta_desc["content"].strip() if meta_desc and meta_desc.get("content") else ""
    return data
 
# Simple rule-based classifier (predefined taxonomy)
def match_predefined_taxonomy(text):
    text_low = text.lower()
    scores = {}
    for cat, keywords in PREDEFINED_TAXONOMY.items():
        score = 0
        for k in keywords:
            # presence and count
            matches = len(re.findall(r'\b' + re.escape(k.lower()) + r'\b', text_low))
            score += matches
        if score > 0:
            scores[cat] = score
    if not scores:
        return None, 0.0
    # pick best and compute a crude confidence (normalized)
    best_cat = max(scores, key=scores.get)
    total = sum(scores.values())
    confidence = scores[best_cat] / total if total else 0.0
    # If best score is weak (e.g., only 1 match and confidence low), treat as uncertain
    return best_cat, confidence
 
# Auto taxonomy via OpenAI (chat completion)
def call_openai_classify(text, predefined=None):
    """
    Classify text using OpenAI API
    Supports both old (v0.x) and new (v1.x+) OpenAI API formats
    """
    if not OPENAI_API_KEY or OPENAI_API_KEY.strip() == "":
        return None, 0.0, ""
    
    try:
        import openai
    except ImportError:
        return None, 0.0, ""
    
    prompt = f"""
You are an assistant that classifies website pages into categories.
Predefined categories (if given): {list(PREDEFINED_TAXONOMY.keys())}
If there is a clear category, return JSON: {{"category":"...", "confidence":0-100, "reason":"short explanation"}}
If multiple apply, return a comma-separated category string in "category".
Page text (first 4000 chars):
{text[:4000]}
"""
    try:
        # Try new OpenAI API format (v1.x+)
        try:
            from openai import OpenAI
            
            # Initialize client with just the API key
            client = OpenAI(api_key=OPENAI_API_KEY)
            
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role":"user","content":prompt}],
                max_tokens=300,
                temperature=0.0
            )
            reply = resp.choices[0].message.content.strip()
                    
        except Exception as e:
            error_msg = str(e)
            # If new API fails, try old API format (v0.x) as fallback
            try:
                import openai
                openai.api_key = OPENAI_API_KEY
                resp = openai.ChatCompletion.create(
                    model="gpt-4o-mini",
                    messages=[{"role":"user","content":prompt}],
                    max_tokens=300,
                    temperature=0.0
                )
                reply = resp["choices"][0]["message"]["content"].strip()
            except Exception as e2:
                # Silently fail - will fall back to predefined taxonomy
                return None, 0.0, ""
        
        # Try to extract JSON-like from reply; fallback: parse heuristically
        # We expect something like: {"category":"News","confidence":85,"reason":"..."}
        try:
            jstart = reply.index("{")
            j = json.loads(reply[jstart:])
            return j.get("category"), float(j.get("confidence", 0))/100.0, j.get("reason","")
        except Exception:
            # naive parse: first line category: ...
            cat_match = re.search(r'category["\']?\s*[:\-]\s*["\']?([A-Za-z0-9,\s/]+)["\']?', reply, re.I)
            conf_match = re.search(r'confidence.*?(\d{1,3})', reply, re.I)
            cat = cat_match.group(1).strip() if cat_match else reply.splitlines()[0][:100]
            conf = float(conf_match.group(1))/100.0 if conf_match else 0.6
            return cat, conf, reply
    except Exception as e:
        # Silently fail - will fall back to predefined taxonomy or OWL classification
        return None, 0.0, ""
 
# Check robots.txt politely
def allowed_by_robots(base_url=None):
    """Check robots.txt for a given URL"""
    if base_url is None:
        base_url = BASE_URL
    robots_url = urljoin(base_url, "/robots.txt")
    txt = safe_get(robots_url)
    if not txt:
        return True
    # super-simple: if "Disallow: /" at top, block
    if re.search(r"Disallow:\s*/\s*$", txt, re.I | re.M):
        return False
    return True
 
def scrape_single_page(url):
    """
    Scrape a single page and return taxonomy data with OWL ontology classification
    
    Args:
        url: URL to scrape
        
    Returns:
        Dictionary with taxonomy data or None if scraping failed
    """
    html = safe_get(url)
    if not html:
        return None
    
    extracted = extract_html_parts(html)
    
    # Primary: Try OWL ontology classification
    ontology_classification = None
    used = "ontology"
    reason = ""
    
    if OWL_PARSER:
        try:
            ontology_classification = OWL_PARSER.classify_page(
                extracted["clean_text"],
                extracted.get("title", ""),
                extracted.get("meta_description", "")
            )
            
            # Determine primary category from ontology
            if ontology_classification.get('document_type'):
                cat = ontology_classification['document_type']['label']
                conf = ontology_classification['document_type']['confidence']
            elif ontology_classification.get('work_type'):
                cat = ontology_classification['work_type']['label']
                conf = ontology_classification['work_type']['confidence']
            elif ontology_classification.get('areas_of_reference'):
                cat = ontology_classification['areas_of_reference'][0]['label']
                conf = ontology_classification['areas_of_reference'][0]['confidence']
            else:
                cat = None
                conf = 0.0
        except Exception as e:
            print(f"[WARN] OWL ontology classification failed: {e}")
            ontology_classification = None
            cat = None
            conf = 0.0
    
    # Fallback: Try predefined taxonomy classification
    if not cat or conf < 0.3:
        cat_fallback, conf_fallback = match_predefined_taxonomy(
            extracted["clean_text"] + " " + extracted["title"] + " " + extracted["meta_description"]
        )
        if cat_fallback and (not cat or conf_fallback > conf):
            cat = cat_fallback
            conf = conf_fallback
            used = "predefined"
            if not ontology_classification:
                ontology_classification = {}
    
    # Last resort: Try OpenAI classification
    if not cat or conf < 0.5:
        try:
            ai_cat, ai_conf, ai_reason = call_openai_classify(extracted["clean_text"])
            if ai_cat and (not cat or ai_conf > conf):
                cat = ai_cat
                conf = ai_conf
                used = "auto"
                reason = ai_reason
                if not ontology_classification:
                    ontology_classification = {}
        except Exception as e:
            print(f"[WARN] OpenAI classification failed: {e}")
    
    # Build result matching the JSON structure with ontology data
    result = {
        "url": url,
        "title": extracted.get("title", ""),
        "meta_description": extracted.get("meta_description", ""),
        "category": cat or "Uncategorized",
        "confidence": conf,
        "category_source": used,
        "category_reason": reason,
        "ontology": ontology_classification or {},
        "ul_blocks": extracted["ul_blocks"],
        "li_items": extracted["li_items"],
        "clean_text": extracted["clean_text"][:15000],  # truncate very large pages
        "full_html_snippet": extracted["full_html"][:200000]  # keep but limited
    }
    
    return result


def crawl_site(start_url=None, max_pages=1000, delay=1.0):
    """
    Crawl a website starting from a given URL
    
    Args:
        start_url: Starting URL for crawling (defaults to BASE_URL)
        max_pages: Maximum number of pages to crawl
        delay: Delay between requests in seconds
        
    Returns:
        List of taxonomy results
    """
    if start_url is None:
        start_url = BASE_URL
    
    if not allowed_by_robots(start_url):
        print("[ERROR] Crawling disallowed by robots.txt. Aborting.")
        return []
    visited = set()
    q = deque([normalize_url(start_url)])
    results = []

    while q and len(results) < max_pages:
        url = q.popleft()
        if url in visited:
            continue
        visited.add(url)
        print("[CRAWL] ", url)
        
        result = scrape_single_page(url)
        if result:
            results.append(result)

        # find links and enqueue for multi-page crawling
        html = safe_get(url)
        if html:
            soup = BeautifulSoup(html, "html.parser")
            for a in soup.find_all("a", href=True):
                raw = a["href"]
                full = urljoin(url, raw)
                if not is_internal(full, start_url):
                    continue
                full_norm = normalize_url(full)
                if full_norm not in visited and full_norm not in q:
                    q.append(full_norm)

        time.sleep(delay)

    return results
 
if __name__ == "__main__":
    out = crawl_site(BASE_URL, max_pages=2000, delay=0.8)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"[DONE] Saved {len(out)} pages to {OUTPUT_FILE}")