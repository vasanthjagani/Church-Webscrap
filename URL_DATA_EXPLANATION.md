# How Data Changes with Different URLs

## Understanding Static vs Dynamic Data

### 🔒 **STATIC (Does NOT Change with URL)**

**OWL Categories** - These are FIXED and come from `salesian_simple.owl`:

- All 20+ Document Types (Video, Audio, Manual, etc.)
- All 12+ Work Types (School, Parish, Oratory, etc.)
- All 12+ Themes (Youth Ministry, Don Bosco, etc.)
- All 11+ Areas of Reference (Education, History, etc.)
- All 7 Geographical Areas (Asia, Europe, etc.)
- All 6 Salesian Family Groups (SDB, FMA, etc.)

**These categories are ALWAYS available** regardless of which URL you scrape. They are the "vocabulary" of your taxonomy.

---

### 🔄 **DYNAMIC (Changes with Each URL)**

#### 1. **Usage Statistics** (Which categories are actually used)

- When you scrape `https://example1.com`, it might use:
  - Document Type: "Video" (used 5 times)
  - Work Type: "School" (used 10 times)
  - Theme: "Youth Ministry" (used 8 times)
- When you scrape `https://example2.com`, it might use:
  - Document Type: "Audio" (used 3 times) - DIFFERENT!
  - Work Type: "Parish" (used 7 times) - DIFFERENT!
  - Theme: "Don Bosco" (used 12 times) - DIFFERENT!

**The OWL Categories Browser shows:**

- ✅ Green checkmark = This category WAS FOUND/USED in the scraped data
- ❌ Gray X = This category EXISTS in OWL but was NOT FOUND in this website

#### 2. **Scraped Content** (The actual page data)

- Each URL has different:
  - Page titles
  - Content text
  - HTML structure
  - Navigation items
  - Metadata

#### 3. **Classification Results** (What categories match)

- Different websites get classified into different OWL categories
- A school website might match "Work_School" and "Area_Education"
- A parish website might match "Work_Parish" and "Area_Catechesis"

---

## Example Scenario

### Scenario 1: Scraping a School Website

```
URL: https://school.example.com

OWL Categories Available: 68 total (ALWAYS the same)
├── Document Types: 20
├── Work Types: 12
├── Themes: 12
├── Areas: 11
├── Geo Areas: 7
└── Family Groups: 6

Categories USED in this website: 15
├── Document Types: 3 used (Video, Manual, Statistics)
├── Work Types: 2 used (School, High School)
├── Themes: 5 used (Youth Ministry, Education, etc.)
├── Areas: 3 used (Education, Pedagogy, etc.)
├── Geo Areas: 1 used (Asia)
└── Family Groups: 1 used (SDB)

Categories NOT USED: 53
(These exist in OWL but weren't found in this website)
```

### Scenario 2: Scraping a Parish Website

```
URL: https://parish.example.com

OWL Categories Available: 68 total (SAME as before - static!)

Categories USED in this website: 12 (DIFFERENT from school!)
├── Document Types: 2 used (Audio, Informative Text) - DIFFERENT!
├── Work Types: 2 used (Parish, Parish Catechesis) - DIFFERENT!
├── Themes: 4 used (Spirituality, Family, etc.) - DIFFERENT!
├── Areas: 3 used (Catechesis, Religious Education) - DIFFERENT!
├── Geo Areas: 1 used (Europe) - DIFFERENT!
└── Family Groups: 0 used - DIFFERENT!

Categories NOT USED: 56 (DIFFERENT from school!)
```

---

## Visual Representation in Dashboard

### OWL Categories Browser Shows:

**Tab: Document Types**

```
✅ Video (used 5 times)        ← Found in scraped data
✅ Audio (used 3 times)        ← Found in scraped data
❌ Manual (not used)           ← Exists in OWL, but not in this website
❌ Statistics (not used)        ← Exists in OWL, but not in this website
✅ Image (used 2 times)        ← Found in scraped data
... (all 20 document types shown)
```

**When you scrape a different URL:**

- The checkmarks (✅/❌) will change
- The usage counts will change
- But ALL 20 categories are still shown (they're always available)

---

## Key Points

1. **OWL File = Master List** (Never changes)

   - `salesian_simple.owl` contains ALL possible categories
   - This is your "dictionary" of categories

2. **Scraped Data = What Actually Exists** (Changes per URL)

   - Each website has different content
   - Different content matches different OWL categories
   - Usage statistics show which categories were found

3. **Dashboard Shows Both:**
   - All available categories (from OWL) - Static
   - Which ones are used (from scraped data) - Dynamic

---

## How to Test This

1. **Scrape Website A:**

   ```bash
   # In dashboard, enter: https://school.example.com
   # Click "Crawl Website"
   # Check OWL Categories Browser
   # Note which categories have green checkmarks
   ```

2. **Clear data and scrape Website B:**

   ```bash
   # In dashboard, enter: https://parish.example.com
   # Click "Crawl Website"
   # Check OWL Categories Browser again
   # Notice different categories have checkmarks now!
   ```

3. **Compare:**
   - Same 68 categories shown (static)
   - Different checkmarks (dynamic)
   - Different usage counts (dynamic)

---

## Summary

| Aspect              | Static (Same)           | Dynamic (Changes)    |
| ------------------- | ----------------------- | -------------------- |
| **OWL Categories**  | ✅ Always 68 categories | ❌                   |
| **Category Usage**  | ❌                      | ✅ Changes per URL   |
| **Scraped Content** | ❌                      | ✅ Different per URL |
| **Classification**  | ❌                      | ✅ Different per URL |
| **Statistics**      | ❌                      | ✅ Different per URL |

**Think of it like this:**

- OWL file = A complete dictionary with all words
- Scraped website = A book that uses some of those words
- Different books (websites) use different words (categories)
- But the dictionary (OWL) always has all words available
