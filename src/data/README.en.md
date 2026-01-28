# Custom Delve Data

This directory contains the structure for adding custom Site Themes and Site Domains to the Delve exploration system.

## 📁 Directory Structure

```
src/data/
├── customThemes/          # JSON files for custom themes
│   ├── example-mystical.json
│   └── ...
├── customDomains/         # JSON files for custom domains
│   ├── example-floating-island.json
│   └── ...
└── templates/             # Templates and documentation
    ├── theme-template.json
    ├── domain-template.json
    └── README.md
```

## 🚀 How to Add a New Theme

1. **Create the JSON file** in `customThemes/`:
   ```bash
   cp templates/theme-template.json customThemes/my_theme.json
   ```

2. **Fill in the fields**:
   - `id`: Unique ID (snake_case, e.g., `mystical`, `cursed_ruins`)
   - `name`: Name in English (required)
   - `name_pt`: Name in Portuguese (optional - if not provided, existing translation system will be used)
   - `text`: Description in English (required)
   - `text_pt`: Description in Portuguese (optional)
   - `features`: Array of features (ranges **1-20**)
     - Each feature can have optional `text_pt`
   - `dangers`: Array of dangers (ranges **1-15**)
     - Each danger can have optional `text_pt`

3. **Translations**: 
   - **Inline translations (recommended)**: Add `name_pt`, `text_pt` and `text_pt` in each feature/danger directly in the JSON
   - **External translations (fallback)**: If you don't provide inline translations, the system will try to use translations in `delveFeatures.ts` or `ironsworn.ts`
   - **Priority**: Inline translation > Translation system > Original English text

4. **Restart the development server** - Files will be loaded automatically!

## 🚀 How to Add a New Domain

1. **Create the JSON file** in `customDomains/`:
   ```bash
   cp templates/domain-template.json customDomains/my_domain.json
   ```

2. **Fill in the fields**:
   - `id`: Unique ID (snake_case, e.g., `floating_island`, `crystal_cavern`)
   - `name`: Name in English (required)
   - `name_pt`: Name in Portuguese (optional)
   - `text`: Description in English (required)
   - `text_pt`: Description in Portuguese (optional)
   - `features`: Array of features (ranges **21-100**)
     - Each feature can have optional `text_pt`
   - `dangers`: Array of dangers (ranges **16-30**)
     - Each danger can have optional `text_pt`

3. **Translations**: 
   - **Inline translations (recommended)**: Add `name_pt`, `text_pt` and `text_pt` in each feature/danger directly in the JSON
   - **External translations (fallback)**: If you don't provide inline translations, the system will try to use translations in `delveFeatures.ts` or `ironsworn.ts`
   - **Priority**: Inline translation > Translation system > Original English text

4. **Restart the development server**

## 📊 Range Structure

### Themes
- **Features**: 1-20 (used when feature roll falls between 1-20)
- **Dangers**: 1-15 (used when danger roll falls between 1-15)

### Domains
- **Features**: 21-100 (used when feature roll falls between 21-100)
- **Dangers**: 16-30 (used when danger roll falls between 16-30)

## ⚠️ Important Rules

1. **Ranges must completely cover the interval** (no gaps)
2. **Each range must be unique** (no overlaps)
3. **IDs must follow snake_case** (e.g., `my_custom_theme`, not `my-custom-theme`)
4. **Translations**: 
   - **Recommended**: Use `name_pt`, `text_pt` and `text_pt` fields in features/dangers directly in the JSON
   - **Fallback**: If you don't provide inline translations, the system will try to use `delveFeatures.ts` or `ironsworn.ts`
   - **Priority**: Inline translation > Translation system > Original text
5. **Optional fields**: All `_pt` fields are optional - if not provided, the system will use the English text or try external translation

## 🔍 How It Works

The `useCustomDelveData` hook in `src/hooks/useCustomDelveData.ts`:
1. Automatically loads all JSON files from `customThemes/` and `customDomains/`
2. Merges with original Delve data (from `@datasworn/ironsworn-classic-delve` package)
3. Returns merged data ready to use

The `DelveExploration` and `SiteSetup` components use this hook to get the complete list of available themes and domains.

## 📝 Examples

See example files:
- `customThemes/example-mystical.json` - Example custom theme
- `customDomains/example-floating-island.json` - Example custom domain

## 🐛 Troubleshooting

- **Theme/Domain doesn't appear**: Check if the JSON file is in `customThemes/` or `customDomains/` and has the `.json` extension
- **Translations don't work**: Check if you added translations in `ironsworn.ts` and `delveFeatures.ts`
- **Validation errors**: Check if ranges are correct (1-20 for theme features, 21-100 for domain features, etc.)

## 📌 File Formats

**You can use two formats:**

### Option 1: One file per card (recommended for few cards)
- Each Theme = 1 JSON file in `customThemes/`
- Each Domain = 1 JSON file in `customDomains/`
- **Advantage**: Clear organization, easy to find and edit each card

### Option 2: List of cards in one file (recommended for many cards)
- Multiple Themes = 1 JSON file with array in `customThemes/`
- Multiple Domains = 1 JSON file with array in `customDomains/`
- **Advantage**: More practical for adding multiple cards at once

**Examples:**
- `customThemes/mystical.json` - single file with one theme
- `customThemes/my-themes.json` - file with array `[{...}, {...}]` containing multiple themes

**The system automatically supports both formats!**

**Simple process:**
1. **Single file**: Copy `templates/theme-template.json` → `customThemes/my_theme.json`
2. **List**: Copy `templates/themes-list-template.json` → `customThemes/my-cards.json`
3. Edit the file with your data
4. Add inline translations (optional)
5. Done - appears automatically in the app!
