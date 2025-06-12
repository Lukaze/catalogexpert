# Changelog

All notable changes to the Microsoft Teams App Catalog Explorer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2025-06-12

### 🔧 Definition Tab Refinements

### Removed
- **Localized Definitions Property**: Removed from property display to reduce clutter

### Fixed
- **Object Property Display**: All object properties in App Capabilities section now consistently show as collapsible "View Object" sections
- **Consistent Object Handling**: Eliminated `[object Object]` display issues across all property categories
- **Property Type Consistency**: Standardized all complex object properties to use collapsible JSON viewers

### Enhanced
- **App Capabilities Section**: All capability properties (bots, connectors, plugins, etc.) now display as expandable object viewers
- **Uniform Object Display**: Consistent "View Object (X properties)" format across all sections
- **Clean Property Layout**: Removed unnecessary properties that added visual noise

## [2.0.0] - 2025-06-12

### 🎉 Major Release: Enhanced Definition Tab & Modular Architecture

### Added
- **Version-Based App Grouping**: Definition tab now groups apps by unique versions instead of audience groups
- **Comprehensive Property Formatting**: Support for 8+ data types with intelligent formatting:
  - Text properties with proper typography
  - Color properties with visual color swatches
  - URL properties as clickable links with external indicators
  - Object properties with collapsible JSON viewers
  - Array properties with formatted lists
  - Boolean properties with visual checkmarks/X marks
  - Date properties with formatted date strings
  - Code properties with monospace styling
- **Collapsible Interface**: All version sections collapsed by default with smooth animations
- **Modular CSS Architecture**: Organized CSS into 9 specialized modules for better maintainability
- **Enhanced Property Categorization**: 107+ app properties organized into 15 logical categories
- **Smart Version Sorting**: Semantic version comparison with newest versions displayed first
- **Audience Bubble Display**: Multiple audience groups shown as bubbles for each version
- **Responsive Header Design**: Improved Definition tab header with mobile support

### Enhanced
- **Definition Tab UX**: Complete redesign with professional styling and intuitive navigation
- **Property Display**: Categorized layout with gradient headers and consistent spacing
- **Interactive Elements**: Hover effects, expandable sections, and responsive design
- **Data Type Handling**: Intelligent detection and formatting of different property types
- **Visual Hierarchy**: Clear separation between categories and improved readability
- **Mobile Experience**: Responsive design that works across all screen sizes

### Technical Improvements
- **CSS Organization**: Split monolithic CSS into focused modules:
  - `base.css` - Core styles and variables
  - `header.css` - Header and navigation
  - `search.css` - Search interface
  - `search-results.css` - App tiles and results
  - `entitlements.css` - Entitlement visualization
  - `entitlement-states.css` - State cards and filtering
  - `modals.css` - Modal dialogs
  - `modal-tabs.css` - Tabbed interface and Definition tab
  - `state-modals.css` - State details modal
  - `loaders.css` - Loading animations
- **Property Rendering Engine**: Complete rewrite of `formatPropertyValue()` method
- **Version Grouping Logic**: New algorithm for grouping audiences by app version
- **Collapsible Component System**: Reusable collapse functionality with animations

### Fixed
- **Definition Header Layout**: Improved responsive behavior on smaller screens
- **Property Value Formatting**: Consistent styling across all data types
- **Version Sorting**: Proper semantic version comparison handling edge cases
- **Audience Group Display**: Consistent shorthand notation (R4, R3, R2, R1)
- **Modal Responsiveness**: Better mobile experience for detailed app views

### Changed
- **Definition Tab Structure**: Switched from audience-based to version-based organization
- **CSS Architecture**: Migrated from single file to modular approach
- **Property Categories**: Reorganized into 15 logical groupings for better discoverability
- **Collapse Behavior**: All sections now start collapsed for cleaner initial view
- **Visual Design**: Enhanced professional appearance with improved typography and spacing

### Performance
- **Reduced CSS Complexity**: Modular architecture improves load times and maintainability
- **Optimized Rendering**: Efficient property formatting reduces DOM manipulation
- **Better Caching**: Improved browser caching with modular CSS files

## [1.0.0] - 2025-06-11

### Added
- Initial release of Microsoft Teams App Catalog Explorer
- Multi-criteria app search functionality
- Entitlement states analysis and visualization
- Modal-based detailed app information
- Audience group filtering
- Real-time search with advanced operators
- Comprehensive app property display
- PowerShell development server
- Responsive design for mobile and desktop

### Features
- Search by App ID, name, developer, Office Asset ID, version, or description
- Wildcard search support with `*` operator
- Boolean search operators (AND/OR)
- Visual entitlement state mapping
- Color-coded entitlement badges
- Interactive state drill-down
- Tabbed modal interface (Overview, Versions, Entitlements, Definition, Technical)
- Global audience filtering
- Loading indicators with progress tracking
- Error handling and retry functionality

### Technical
- Modular JavaScript architecture
- Event-driven design pattern
- Efficient data caching system
- Progressive loading
- CORS support for development
- Modern ES6+ JavaScript features
- Mobile-first responsive CSS
