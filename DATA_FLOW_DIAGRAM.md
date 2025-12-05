# Data Flow: How URL Affects Data

## Simple Explanation

```
┌─────────────────────────────────────────────────────────────┐
│                    STATIC (Never Changes)                    │
│                                                               │
│  salesian_simple.owl                                         │
│  ├── 20 Document Types (Video, Audio, Manual, etc.)          │
│  ├── 12 Work Types (School, Parish, Oratory, etc.)          │
│  ├── 12 Themes (Youth Ministry, Don Bosco, etc.)            │
│  ├── 11 Areas of Reference (Education, History, etc.)        │
│  ├── 7 Geo Areas (Asia, Europe, America, etc.)             │
│  └── 6 Salesian Family Groups (SDB, FMA, etc.)               │
│                                                               │
│  Total: 68 categories ALWAYS available                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Used for classification)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              DYNAMIC (Changes with Each URL)                 │
│                                                               │
│  URL 1: https://school.example.com                           │
│  ├── Scraped Content: "Our school offers..."                │
│  ├── Classification:                                         │
│  │   ├── Work Type: "School" ✓                              │
│  │   ├── Area: "Education" ✓                                │
│  │   └── Theme: "Youth Ministry" ✓                          │
│  └── Usage: 15 categories used                              │
│                                                               │
│  URL 2: https://parish.example.com                           │
│  ├── Scraped Content: "Our parish welcomes..."               │
│  ├── Classification:                                         │
│  │   ├── Work Type: "Parish" ✓ (DIFFERENT!)                  │
│  │   ├── Area: "Catechesis" ✓ (DIFFERENT!)                   │
│  │   └── Theme: "Spirituality" ✓ (DIFFERENT!)                │
│  └── Usage: 12 categories used (DIFFERENT!)                 │
│                                                               │
│  URL 3: https://youth-center.example.com                     │
│  ├── Scraped Content: "Youth activities include..."           │
│  ├── Classification:                                         │
│  │   ├── Work Type: "Oratory" ✓ (DIFFERENT!)                 │
│  │   ├── Area: "Youth Ministry" ✓ (DIFFERENT!)               │
│  │   └── Theme: "Young People" ✓ (DIFFERENT!)                │
│  └── Usage: 8 categories used (DIFFERENT!)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Display                          │
│                                                               │
│  OWL Categories Browser shows:                               │
│  ├── ALL 68 categories (from OWL - static)                  │
│  ├── ✓ Green checkmark = Found in current scraped data      │
│  ├── ✗ Gray X = Not found in current scraped data          │
│  └── Usage counts = How many times used                      │
│                                                               │
│  When you change URL:                                         │
│  ├── Categories list stays the same (68 total)              │
│  ├── Checkmarks change (different categories found)           │
│  └── Usage counts change (different numbers)                 │
└─────────────────────────────────────────────────────────────┘
```

## Real Example

### Before Scraping (No Data)

```
OWL Categories Browser:
├── Document Types: 20 categories shown
│   ├── Video ❌ (not used - no data yet)
│   ├── Audio ❌ (not used - no data yet)
│   └── ... (all 20 shown)
└── All categories have ✗ (no scraped data)
```

### After Scraping School Website

```
OWL Categories Browser:
├── Document Types: 20 categories shown
│   ├── Video ✓ (used 5 times)
│   ├── Audio ✓ (used 2 times)
│   ├── Manual ✓ (used 3 times)
│   ├── Statistics ✗ (not used in this website)
│   └── ... (all 20 shown, some ✓, some ✗)
└── Coverage: 8 of 20 document types used (40%)
```

### After Scraping Different Website (Parish)

```
OWL Categories Browser:
├── Document Types: 20 categories shown (SAME 20!)
│   ├── Video ✗ (not used in this website)
│   ├── Audio ✓ (used 4 times) - DIFFERENT!
│   ├── Manual ✗ (not used in this website)
│   ├── Statistics ✗ (not used in this website)
│   ├── Informative Text ✓ (used 6 times) - NEW!
│   └── ... (all 20 shown, different ✓/✗ pattern)
└── Coverage: 5 of 20 document types used (25%) - DIFFERENT!
```

## Key Takeaway

**The OWL file is like a dictionary:**

- It contains ALL possible words (categories)
- It doesn't change based on what you read (scrape)

**The scraped website is like a book:**

- Different books use different words
- Some words from the dictionary appear, some don't
- The dictionary always has all words available

**The dashboard shows:**

- The complete dictionary (all OWL categories) - Static
- Which words appear in the current book (usage) - Dynamic
