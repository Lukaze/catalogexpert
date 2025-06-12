# Microsoft Teams App Catalog Explorer

> 🤖 **Built by LukasAgent** - An AI Assistant specialized in Microsoft Teams application development

A powerful web-based tool for exploring and analyzing Microsoft Teams application catalogs, with detailed information about app definitions and preconfigured entitlement states across different audience groups.

![Microsoft Teams App Catalog Explorer](https://img.shields.io/badge/Microsoft-Teams-5059C9?style=flat&logo=microsoft-teams&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## 🌟 Features

### 📱 App Search & Discovery
- **Multi-criteria search**: Search by App ID, name, developer, Office Asset ID, version, or description
- **Advanced search operators**: Support for wildcards (`*`), AND/OR operators for complex queries
- **Real-time search**: Instant results as you type
- **Smart sorting**: Apps with entitlements prioritized, then alphabetical

### 🔐 Entitlement States Analysis
- **Visual entitlement mapping**: See which apps have preconfigured entitlements
- **State-based grouping**: Apps organized by entitlement states (Installed, InstalledAndPermanent, PreConsented, etc.)
- **Audience group filtering**: Filter entitlements by specific audience groups
- **Interactive state cards**: Click to drill down into specific entitlement states

### 📊 Comprehensive App Details
- **Multi-audience support**: View app versions across different audience groups
- **Detailed app information**: Developer details, manifest versions, descriptions
- **Tabbed modal interface**: Organized presentation of app data with Overview, Versions, Entitlements, Definition, and Technical tabs
- **Complete app definition**: View all app properties and metadata in a readable format
- **Entitlement visualization**: Color-coded state badges with icons

### 🎯 Advanced Filtering
- **Global audience filters**: Filter all data by audience groups
- **Dynamic filter updates**: Real-time filtering without page reloads
- **Filter persistence**: Selections maintained while navigating

### 🚀 Performance & UX
- **Enhanced loading screen**: Progress indicators with real-time statistics
- **Caching system**: Efficient data loading with request deduplication
- **Responsive design**: Works on desktop and mobile devices
- **Error handling**: Graceful error recovery with retry functionality

## 🏗️ Architecture

### Core Modules

| Module | Purpose |
|--------|---------|
| `app-explorer.js` | Main application coordinator and state management |
| `data-loader.js` | Handles catalog configuration and data loading |
| `search-engine.js` | Advanced search functionality with multiple algorithms |
| `ui-renderer.js` | DOM manipulation and UI rendering |
| `modal-manager.js` | Modal dialogs and detailed app views |
| `event-handlers.js` | User interaction and event management |
| `utils.js` | Utility functions and constants |

### Data Flow
```
Catalog Configs → Data Loader → App Definitions + Entitlements → Search Engine → UI Renderer
                                        ↓
                               Modal Manager ← Event Handlers
```

## 🚀 Quick Start

### Prerequisites
- Web server capability (built-in PowerShell server included)
- Modern web browser with JavaScript enabled
- Microsoft Teams catalog configuration files

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lukaze/catalogexpert.git
   cd catalogexpert
   ```

2. **Start the development server**
   ```powershell
   .\start-server.ps1
   ```
   The server will:
   - Check if port 8080 is available
   - Start a local HTTP server (or reuse existing)
   - Automatically open your browser
   - Display the application at `http://localhost:8080`

3. **Load your catalog data**
   - Place your catalog configuration files in the `/samples` directory
   - The application will automatically detect and load them
   - Supported file patterns:
     - `catalogConfig*.json` - Main catalog configurations
     - `store_*.json` - App store definitions
     - `preconfigured_appentitlements_*.json` - Entitlement configurations

## 📁 Project Structure

```
CatalogExpert/
├── index.html                 # Main application interface
├── styles.css                 # Complete styling and responsive design
├── start-server.ps1           # PowerShell development server
├── validate.html              # Development validation tools
├── validation-suite.js        # Testing and validation utilities
├── js/                        # JavaScript modules
│   ├── app-explorer.js        # Main application controller
│   ├── data-loader.js         # Data loading and caching
│   ├── search-engine.js       # Search algorithms and filtering
│   ├── ui-renderer.js         # UI rendering and DOM management
│   ├── modal-manager.js       # Modal dialogs and detailed views
│   ├── event-handlers.js      # Event management and user interactions
│   └── utils.js               # Utility functions and constants
└── samples/                   # Sample data files
    ├── catalogConfig SAMPLE.json
    ├── preconfigured_appentitlements_general.json
    └── store_global_0.json
```

## 🔧 Configuration

### Catalog Configuration Format
The application expects JSON files with the following structure:

```json
{
  "MicrosoftTeamsAppCatalog": {
    "appCatalog": {
      "stores": {
        "sources": ["url1", "url2"]
      },
      "preconfiguredAppEntitlements": {
        "sources": ["entitlement-url1", "entitlement-url2"]
      }
    }
  }
}
```

### Supported Entitlement States
- 🔒 **InstalledAndPermanent**: Cannot be uninstalled by users
- 🟢 **Installed**: Can be uninstalled by users
- ✅ **PreConsented**: Silently installed on first use
- ⭐ **Featured**: Featured apps requiring user installation
- ❌ **NotInstalled**: Grandfathered state for existing tabs
- ⚠️ **InstalledAndDeprecated**: Marked for deprecation
- 🚫 **HiddenFromAppStore**: Hidden from all discovery

## 🎨 Features Deep Dive

### Search Capabilities
- **Wildcard Search**: Use `*` for partial matches (`micro*` finds Microsoft apps)
- **Boolean Operators**: Combine terms with `AND` and `OR`
- **Multi-field Search**: Searches across app names, IDs, developers, descriptions
- **Real-time Results**: Instant filtering as you type

### Entitlement Analysis
- **State Visualization**: Color-coded badges for different entitlement states
- **Audience Filtering**: View entitlements specific to audience groups
- **Detailed Drill-down**: Click state cards to see all apps in that state
- **Cross-reference**: See which audience groups have specific entitlements

### Data Management
- **Intelligent Caching**: Reduces redundant network requests
- **Progressive Loading**: Shows progress during data fetching
- **Error Recovery**: Graceful handling of failed requests
- **Source Tracking**: View all loaded data sources

## 🛠️ Development

### Local Development
```powershell
# Start development server
.\start-server.ps1

# The server includes:
# - Automatic port detection
# - Hot reloading support
# - CORS headers for development
# - Static file serving
```

### Validation
```powershell
# Open validation suite
# Navigate to: http://localhost:8080/validate.html
# Runs comprehensive tests on all modules
```

### Code Organization
- **Modular Architecture**: Each JavaScript file handles specific functionality
- **Event-Driven**: Loose coupling between modules via events
- **Responsive Design**: Mobile-first CSS with progressive enhancement
- **Modern JavaScript**: ES6+ features with broad browser compatibility

## 🔍 Usage Examples

### Basic App Search
1. Navigate to the **Search Apps** tab
2. Enter search terms in the search box
3. Use wildcards: `*teams*` to find all apps with "teams" in the name
4. Click any app tile to view detailed information

### Entitlement Analysis
1. Switch to the **Entitlement States** tab
2. Select audience groups using the filter buttons
3. Browse entitlement states organized by type
4. Click state cards to see all apps with that entitlement

### Advanced Filtering
1. Use the global audience filter to focus on specific groups
2. Combine multiple audience selections
3. Use "Select All" or "Clear All" for quick filtering
4. View real-time statistics as filters change

## 🤝 Contributing

This project was built by LukasAgent, an AI Assistant. Contributions are welcome!

### Development Guidelines
- Follow the existing modular architecture
- Maintain responsive design principles
- Add appropriate error handling
- Update validation tests for new features
- Document any new configuration options

## 📄 License

This project is available under the MIT License. See the LICENSE file for more details.

## 🆘 Support

### Troubleshooting
- **Port conflicts**: The server automatically detects and reuses existing servers
- **Data loading issues**: Check browser console for detailed error messages
- **Search not working**: Ensure catalog data is loaded first
- **Performance issues**: Clear browser cache and reload

### Known Limitations
- Requires modern browser with JavaScript enabled
- Large datasets may impact initial loading time
- Network connectivity required for external catalog sources

## 🎯 Roadmap

- [ ] Export functionality for search results
- [ ] Advanced analytics dashboard
- [ ] Custom entitlement state definitions
- [ ] Integration with Microsoft Graph API
- [ ] Bulk operations for app management

---

**Built with ❤️ by LukasAgent** - Enhancing Microsoft Teams app management through intelligent automation.
