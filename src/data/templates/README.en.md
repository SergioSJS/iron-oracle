# Templates for Custom Themes and Domains

This directory contains JSON templates to facilitate creating new custom Site Themes and Site Domains.

## How to Use

### 1. Create a New Theme

1. Copy `theme-template.json` to `../customThemes/your_theme_id.json`
2. Fill in the fields:
   - `id`: Unique ID (snake_case, e.g., `mystical`, `cursed_ruins`)
   - `name`: Name in English (required)
   - `name_pt`: Name in Portuguese (optional)
   - `text`: Description in English (required)
   - `text_pt`: Description in Portuguese (optional)
   - `features`: Array of features (ranges 1-20)
     - Each feature can have optional `text_pt`
   - `dangers`: Array of dangers (ranges 1-15)
     - Each danger can have optional `text_pt`

3. **Translations**: 
   - **Recommended**: Add `name_pt`, `text_pt` and `text_pt` in each feature/danger directly in the JSON
   - **Fallback**: If you don't provide inline translations, the system will try to use translations in `delveFeatures.ts` or `ironsworn.ts`

### 2. Create a New Domain

1. Copy `domain-template.json` to `../customDomains/your_domain_id.json`
2. Fill in the fields:
   - `id`: Unique ID (snake_case, e.g., `floating_island`, `crystal_cavern`)
   - `name`: Name in English (required)
   - `name_pt`: Name in Portuguese (optional)
   - `text`: Description in English (required)
   - `text_pt`: Description in Portuguese (optional)
   - `features`: Array of features (ranges 21-100)
     - Each feature can have optional `text_pt`
   - `dangers`: Array of dangers (ranges 16-30)
     - Each danger can have optional `text_pt`

3. **Translations**: 
   - **Recommended**: Add `name_pt`, `text_pt` and `text_pt` in each feature/danger directly in the JSON
   - **Fallback**: If you don't provide inline translations, the system will try to use translations in `delveFeatures.ts` or `ironsworn.ts`

## Range Structure

### Themes
- **Features**: 1-20 (used when feature roll falls between 1-20)
- **Dangers**: 1-15 (used when danger roll falls between 1-15)

### Domains
- **Features**: 21-100 (used when feature roll falls between 21-100)
- **Dangers**: 16-30 (used when danger roll falls between 16-30)

## Complete Examples

See example files:
- `../customThemes/example-mystical.json` - Complete theme example
- `../customDomains/example-floating-island.json` - Complete domain example

## Available Formats

### Single File
- `theme-template.json` - Template for a single theme
- `domain-template.json` - Template for a single domain

### Card List
- `themes-list-template.json` - Template for multiple themes in one file (array)
- `domains-list-template.json` - Template for multiple domains in one file (array)

**Use whichever format you prefer!** The system automatically supports both.

The templates are simple, practical JSON files - just copy, rename, and fill in with your data!

## Important Notes

- Ranges must completely cover the interval (no gaps)
- Each range must be unique (no overlaps)
- **Inline translations**: Use `name_pt`, `text_pt` and `text_pt` fields directly in the JSON (recommended)
- **Fallback**: If you don't provide inline translations, the system will try to use `delveFeatures.ts` or `ironsworn.ts`
- **Priority**: Inline translation > Translation system > Original text
- All `_pt` fields are optional
