# Iron Oracle

A web application for rolling oracle tables from **Ironsworn** and **Ironsworn: Starforged** tabletop RPG games. This Progressive Web App (PWA) provides an intuitive interface to access and roll on hundreds of oracle tables, with full support for Portuguese and English translations.

🌐 **Visit the website**: [https://sergiosjs.github.io/iron-oracle/](https://sergiosjs.github.io/iron-oracle/)

[🇧🇷 Read in Portuguese / Leia em Português](README.pt.md)

## Features

- 🎲 **Complete Oracle Tables**: Access all oracle tables from both Ironsworn and Starforged
- 🌍 **Bilingual Support**: Full Portuguese and English translations for UI and oracle results
- 🎨 **Dynamic Theming**: Visual themes that change based on the selected game mode
  - **Ironsworn**: Dark fantasy theme with Metamorphous font
  - **Starforged**: Space theme with Orbitron font
- 🌓 **Light/Dark Mode**: Toggle between light and dark themes
- 📱 **Progressive Web App**: Installable on mobile and desktop devices
- 🔌 **Works Offline**: After the first visit, the app works completely offline using Service Worker
- 💾 **Persistent Settings**: All preferences (theme, language, game mode, region) are saved automatically
- 🔄 **Automatic Sub-rolls**: Automatically rolls linked tables when results reference other oracles
- 📜 **Roll History**: Track all your rolls with a detailed history log
- 🎯 **Region Support**: For Starforged, select between Terminus, Outlands, and Expanse regions
- ⚡ **Roll Shortcuts**: Pre-configured buttons that roll multiple tables at once, such as "Complete Character", "Planet", "Action and Theme", etc.

## Acknowledgments

This project uses data from the [Datasworn](https://github.com/rsek/datasworn/) repository, which provides game rules from Ironsworn and Ironsworn: Starforged in JSON format. Special thanks to rsek and all contributors to the Datasworn project for making this possible.

The Datasworn packages used:
- `@datasworn/core`: Core TypeScript typings and JSON schema
- `@datasworn/ironsworn-classic`: JSON data from the original Ironsworn rulebook
- `@datasworn/starforged`: JSON data from Ironsworn: Starforged

## Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd iron-oracle
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

### Standard Build

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Building for GitHub Pages

To build the application for GitHub Pages deployment:

1. Update the `base` path in `vite.config.ts` to match your repository name (if deploying to a subdirectory):
```typescript
export default defineConfig({
  base: '/iron-oracle/', // Replace with your repository name
  plugins: [react()],
})
```

2. Build the application:
```bash
npm run build
```

3. The `dist` folder will contain all static files ready for GitHub Pages.

4. To deploy to GitHub Pages:
   - Push the `dist` folder contents to the `gh-pages` branch, or
   - Use GitHub Actions to automatically deploy on push (see `.github/workflows/deploy.yml` example below)

## Project Structure

```
iron-oracle/
├── public/                 # Static assets
│   ├── favicon.svg        # Application favicon
│   ├── manifest.json      # PWA manifest file
│   └── 404.html           # 404 redirect for GitHub Pages SPA routing
├── src/
│   ├── components/        # React components
│   │   ├── AskTheOracle/  # "Ask the Oracle" quick access component
│   │   ├── Header/        # Application header with controls
│   │   ├── Modals/        # Modal dialogs (Result, Log)
│   │   ├── OracleNavigation/ # Recursive oracle navigation component
│   │   ├── OracleShortcuts/  # Roll shortcut component for quick access
│   │   ├── OracleText/    # Text component with tooltip support
│   │   └── RollLog/       # Roll history component
│   ├── hooks/             # Custom React hooks
│   │   ├── useGameData.ts # Game data management and rolling logic
│   │   └── useScreenSize.ts # Responsive screen size detection
│   ├── i18n/              # Internationalization
│   │   ├── context.tsx     # i18n context provider
│   │   ├── translations/  # UI text translations (en, pt)
│   │   ├── oracleTranslations/ # Oracle table translations
│   │   │   ├── ironsworn.ts   # Ironsworn oracle translations
│   │   │   ├── starforged.ts  # Starforged oracle translations
│   │   │   └── types.ts       # Translation type definitions
│   │   └── types.ts       # i18n type definitions
│   ├── styles/            # CSS modules
│   │   ├── base.css       # Base styles and theme variables
│   │   ├── header.css     # Header component styles
│   │   ├── oracle.css     # Oracle navigation styles
│   │   ├── roll-log.css   # Roll log styles
│   │   ├── modals.css     # Modal styles
│   │   └── tooltip.css    # Tooltip styles
│   ├── types/             # TypeScript type definitions
│   │   └── datasworn.ts   # Datasworn data structure types
│   ├── utils/             # Utility functions
│   │   ├── oracleDataUtils.ts # Oracle data processing utilities
│   │   ├── oracleIcons.tsx    # Icon mapping for oracles
│   │   ├── oracleShortcuts.tsx # Roll shortcut definitions and utilities
│   │   └── oracleUtils.ts     # Oracle rolling and parsing utilities
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
└── package.json            # Project dependencies and scripts
```

## Key Files Explained

### `src/App.tsx`
Main application component that orchestrates all other components. Manages global state (theme, modals, logs) and coordinates between Header, OracleNavigation, AskTheOracle, and RollLog components.

### `src/hooks/useGameData.ts`
Core hook that manages:
- Game mode selection (Ironsworn/Starforged)
- Oracle rolling logic with automatic sub-rolls
- Roll history management
- Region selection for Starforged
- LocalStorage persistence for game settings

### `src/components/OracleNavigation/OracleNavigator.tsx`
Recursive component that renders the hierarchical oracle structure. Handles:
- Rendering rollable tables as buttons
- Rendering categories/collections as collapsible sections
- Special handling for Ironsworn name tables
- Region-based oracle filtering for Starforged

### `src/components/OracleShortcuts/OracleShortcuts.tsx`
Component that renders shortcut buttons for quick access to common oracle combinations. Displays as a collapsible group similar to other oracle categories, with icons for each shortcut.

### `src/utils/oracleShortcuts.tsx`
Defines shortcut structures and utilities:
- `ShortcutDefinition` and `ShortcutRoll` types
- `IRONSWORN_SHORTCUTS` and `STARFORGED_SHORTCUTS` arrays
- `getShortcutIcon` function for icon mapping
- Helper functions for finding and selecting oracles

### `src/i18n/oracleTranslations/`
Contains Portuguese translations for all oracle tables. The translations are modularized by game:
- `ironsworn.ts`: All Ironsworn oracle translations
- `starforged.ts`: All Starforged oracle translations

### `src/utils/oracleUtils.ts`
Utility functions for:
- Finding roll results based on dice values
- Extracting oracle references from result text
- Handling region-specific table structures
- Generating unique log IDs

### `src/utils/oracleIcons.tsx`
Maps oracle IDs to appropriate icons from `react-icons`. Provides visual consistency and helps users quickly identify oracle types.

## Development

### Available Scripts

- `npm run dev`: Start development server with hot module replacement
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint to check code quality

### Adding New Translations

1. Add UI text translations in `src/i18n/translations/[lang].ts`
2. Add oracle translations in `src/i18n/oracleTranslations/[game].ts`
3. Update `TRANSLATION_STATUS.md` to track progress

### Creating New Shortcuts

Shortcuts allow you to roll multiple oracle tables at once, grouping the results in a single log entry. To create a new shortcut:

1. **Open the shortcuts file**:
   - For Ironsworn: `src/utils/oracleShortcuts.tsx` → `IRONSWORN_SHORTCUTS`
   - For Starforged: `src/utils/oracleShortcuts.tsx` → `STARFORGED_SHORTCUTS`

2. **Add a new shortcut definition**:
```typescript
{
  name: 'Shortcut Name',
  rolls: [
    { oracleId: 'classic/oracles/oracle/id' }, // Roll once
    { oracleId: 'classic/oracles/oracle/id', count: 2 }, // Roll twice
    { oracleId: ['id1', 'id2', 'id3'] }, // Randomly select between IDs
  ]
}
```

3. **Available parameters**:
   - `oracleId`: String with the complete oracle ID, or array of IDs for random selection
   - `count`: Number of times to roll (default: 1)
   - `condition`: Optional function `(region?: StarforgedRegion) => boolean` to conditionally include

4. **Usage examples**:
   - **Random selection**: Use an array of IDs to randomly select between tables
   - **Multiple rolls**: Use `count` to roll the same table multiple times
   - **Dynamic IDs**: For planets, use `/planets/desert/` as placeholder - will be replaced by the rolled class
   - **Region specific**: For Starforged, use `/terminus` as placeholder - will be replaced by the selected region

5. **Special cases already implemented**:
   - **Character names (Ironsworn)**: Use array with name IDs - will be randomly selected
   - **Settlement names (Ironsworn)**: Use array with settlement name IDs - will be randomly selected
   - **Planets (Starforged)**: Use `/planets/desert/` as placeholder - will be adjusted by the rolled class
   - **Vital Planet**: If the class is "vital", diversity and biomes are automatically added

6. **Add icon** (optional):
   - Edit the `getShortcutIcon` function in `src/utils/oracleShortcuts.tsx`
   - Add a condition for your shortcut name returning the appropriate icon

**Complete example**:
```typescript
{
  name: 'My New Shortcut',
  rolls: [
    { oracleId: 'classic/oracles/action_and_theme/action' },
    { oracleId: 'classic/oracles/action_and_theme/theme' },
    { oracleId: 'classic/oracles/character/descriptor', count: 3 }
  ]
}
```

## Deployment to GitHub Pages

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Copy the contents of the `dist` folder to the root of your `gh-pages` branch, or use a tool like `gh-pages`:
```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

Then run:
```bash
npm run deploy
```

### Automated Deployment with GitHub Actions

A GitHub Actions workflow file is already included at `.github/workflows/deploy.yml`. This workflow:
- Automatically builds the application on every push to `main`
- Deploys to GitHub Pages using the official GitHub Actions
- Requires GitHub Pages to be enabled in your repository settings

**To enable GitHub Pages:**
1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. The workflow will automatically deploy on the next push to `main`

**Note:** The workflow file uses the latest GitHub Actions for Pages deployment. Make sure your repository has Pages enabled with the "GitHub Actions" source selected.

### Important Notes for GitHub Pages

1. **Base Path**: If your repository is not at the root of your GitHub Pages site, update the `base` in `vite.config.ts`:
```typescript
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
  plugins: [react()],
})
```

2. **404 Handling**: GitHub Pages doesn't support client-side routing by default. This project includes a `404.html` file in the `public` folder that automatically redirects to `index.html` for client-side routing. The file is automatically copied to `dist` during build. To enable it on GitHub Pages:
   - Go to your repository Settings → Pages
   - Under "Custom 404", select "Use a custom 404 page"
   - The `404.html` file will be used automatically

3. **HTTPS**: GitHub Pages serves over HTTPS, which is required for PWA features like service workers.

4. **Offline Functionality**: The app uses Service Worker to cache all assets. After the first online visit, the app will work completely offline. To test:
   - Access the app once with internet
   - Enable airplane mode or disable internet
   - The app will continue to work normally

## License

This project uses data from Datasworn, which is licensed under:
- Core package content: MIT License
- Textual and image content: CC-BY-4.0 or CC-BY-NC-4.0

See the [Datasworn repository](https://github.com/rsek/datasworn/) for full licensing details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues related to:
- **This application**: Open an issue in this repository
- **Datasworn data**: Visit the [Datasworn repository](https://github.com/rsek/datasworn/)

## Important Note

**AI-Generated Content**: The majority of the code and translations in this project were generated with the assistance of AI. While every effort has been made to ensure accuracy and functionality, there may be bugs, translation errors, or unexpected behaviors.

If you encounter any issues, strange behaviors, or errors:
- Please open an issue in this repository with a detailed description
- Or contact the repository author directly

Your feedback and bug reports are highly appreciated and help improve the project!

---

Made with ❤️ for the Ironsworn and Starforged community
