/**
 * Search Engine Module
 * Handles all search and filtering functionality for the Teams App Catalog Explorer
 */
class SearchEngine {
    constructor(appDefinitions, appEntitlements) {
        this.appDefinitions = appDefinitions;
        this.appEntitlements = appEntitlements;
    }

    /**
     * Main search method triggered by search button
     */
    searchApps() {
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput.value.trim();
        
        if (!searchTerm) {
            this.showStatus('❌ Please enter a search term (App ID, name, developer, etc.)', 'error');
            return;
        }
        
        const results = this.performMultiCriteriaSearch(searchTerm);
        
        if (results.length === 0) {
            this.displayNoResults(searchTerm);
            return;
        }
        
        this.displaySearchResults(results, searchTerm);
        this.hideStatus();
    }

    /**
     * Display all available apps
     */
    showAllApps() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Get all apps and display them
        const allApps = [];
        const seenAppIds = new Set();
        
        this.appDefinitions.forEach((audienceMap, appId) => {
            if (seenAppIds.has(appId)) return;
            
            const firstApp = audienceMap.values().next().value;
            if (firstApp) {
                seenAppIds.add(appId);
                allApps.push({
                    appId,
                    app: firstApp,
                    audienceMap,
                    hasEntitlements: this.appEntitlements.has(appId)
                });
            }
        });
        
        // Sort results: apps with entitlements first, then alphabetically by name
        const sortedApps = allApps.sort((a, b) => {
            if (a.hasEntitlements && !b.hasEntitlements) return -1;
            if (!a.hasEntitlements && b.hasEntitlements) return 1;
            return (a.app.name || '').localeCompare(b.app.name || '');
        });
        
        this.displayAllAppsResults(sortedApps);
    }

    /**
     * Handle real-time search input (as you type)
     */
    handleSearchInput(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            // If search is empty, show all apps
            this.showAllApps();
            return;
        }
        
        // Perform search with wildcard and operator support
        const results = this.performAdvancedSearch(searchTerm.trim());
        
        if (results.length === 0) {
            this.displayNoResults(searchTerm);
            return;
        }
        
        this.displaySearchResults(results, searchTerm);
    }

    /**
     * Advanced search with wildcard (*), AND, OR operators
     */
    performAdvancedSearch(searchTerm) {
        // Check if the search contains operators
        const hasOperators = /\b(AND|OR)\b/i.test(searchTerm) || searchTerm.includes('*');
        
        if (hasOperators) {
            return this.performWildcardSearch(searchTerm);
        } else {
            return this.performMultiCriteriaSearch(searchTerm);
        }
    }

    /**
     * Wildcard and operator search
     */
    performWildcardSearch(searchTerm) {
        const results = [];
        const seenAppIds = new Set();
        
        // Parse search terms with operators
        const searchConditions = this.parseSearchConditions(searchTerm);
        
        this.appDefinitions.forEach((audienceMap, appId) => {
            if (seenAppIds.has(appId)) return;
            
            const firstApp = audienceMap.values().next().value;
            if (!firstApp) return;
            
            // Check if app matches the search conditions
            const matches = this.evaluateSearchConditions(firstApp, appId, searchConditions);
            
            if (matches) {
                seenAppIds.add(appId);
                results.push({
                    appId,
                    app: firstApp,
                    audienceMap,
                    hasEntitlements: this.appEntitlements.has(appId)
                });
            }
        });
        
        // Sort results: apps with entitlements first, then alphabetically by name
        return results.sort((a, b) => {
            if (a.hasEntitlements && !b.hasEntitlements) return -1;
            if (!a.hasEntitlements && b.hasEntitlements) return 1;
            return (a.app.name || '').localeCompare(b.app.name || '');
        });
    }

    /**
     * Parse search terms with AND/OR operators
     */
    parseSearchConditions(searchTerm) {
        // Split by OR first (higher precedence)
        const orGroups = searchTerm.split(/\s+OR\s+/i);
        
        return orGroups.map(orGroup => {
            // Split each OR group by AND
            const andTerms = orGroup.split(/\s+AND\s+/i);
            // Convert wildcards to regex patterns
            return andTerms.map(term => term.trim().replace(/\*/g, '.*'));
        });
    }

    /**
     * Evaluate search conditions against an app
     */
    evaluateSearchConditions(app, appId, conditions) {
        const searchableText = [
            appId,
            app.name,
            app.developerName,
            app.officeAssetId,
            app.version,
            app.description
        ].filter(Boolean).join(' ').toLowerCase();
        
        // Each outer array element is an OR group
        return conditions.some(andGroup => {
            // All terms in an AND group must match
            return andGroup.every(term => {
                const regex = new RegExp(term.toLowerCase(), 'i');
                return regex.test(searchableText);
            });
        });
    }

    /**
     * Multi-criteria search (basic search without operators)
     */
    performMultiCriteriaSearch(searchTerm) {
        const results = [];
        const seenAppIds = new Set();
        const searchLower = searchTerm.toLowerCase();
        
        // Search through all app definitions
        this.appDefinitions.forEach((audienceMap, appId) => {
            if (seenAppIds.has(appId)) return;
            
            // Get first app instance for searching (they should have same basic info)
            const firstApp = audienceMap.values().next().value;
            if (!firstApp) return;
            
            // Check multiple criteria
            const matches = [
                appId.toLowerCase().includes(searchLower),
                firstApp.name?.toLowerCase().includes(searchLower),
                firstApp.developerName?.toLowerCase().includes(searchLower),
                firstApp.officeAssetId?.toLowerCase().includes(searchLower),
                firstApp.version?.toLowerCase().includes(searchLower),
                firstApp.description?.toLowerCase().includes(searchLower)
            ].some(match => match);
            
            if (matches) {
                seenAppIds.add(appId);
                results.push({
                    appId,
                    app: firstApp,
                    audienceMap,
                    hasEntitlements: this.appEntitlements.has(appId)
                });
            }
        });
        
        // Sort results: apps with entitlements first, then alphabetically by name
        return results.sort((a, b) => {
            if (a.hasEntitlements && !b.hasEntitlements) return -1;
            if (!a.hasEntitlements && b.hasEntitlements) return 1;
            return (a.app.name || '').localeCompare(b.app.name || '');
        });
    }

    /**
     * Display search results
     */
    displaySearchResults(results, searchTerm) {
        const resultsContainer = document.getElementById('results');
        
        const resultsHtml = `
            <div class="search-summary">
                <h3>Search Results</h3>
                <p>Found <strong>${results.length}</strong> app${results.length !== 1 ? 's' : ''} matching "<strong>${searchTerm}</strong>"</p>
            </div>
            <div class="search-results-grid">
                ${results.map(result => this.renderSearchResultCard(result)).join('')}
            </div>
        `;
        
        resultsContainer.innerHTML = resultsHtml;
    }

    /**
     * Display all apps results
     */
    displayAllAppsResults(results) {
        const resultsContainer = document.getElementById('results');
        
        const resultsHtml = `
            <div class="search-summary">
                <h3>All Available Apps</h3>
                <p>Showing <strong>${results.length}</strong> app${results.length !== 1 ? 's' : ''} across all audience groups</p>
            </div>
            <div class="search-results-grid">
                ${results.map(result => this.renderSearchResultCard(result)).join('')}
            </div>
        `;
        
        resultsContainer.innerHTML = resultsHtml;
    }

    /**
     * Display no results message
     */
    displayNoResults(searchTerm) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h3>No Apps Found</h3>
                <p>No applications found matching: <strong>${searchTerm}</strong></p>
                <p>Search criteria include: App ID, name, developer, Office Asset ID, version, and description.</p>
                <p>Try a different search term or check your spelling.</p>
            </div>
        `;
    }    /**
     * Render individual search result card
     */
    renderSearchResultCard(result) {
        const { appId, app, audienceMap, hasEntitlements } = result;
        const entitlementCount = hasEntitlements ? Array.from(this.appEntitlements.get(appId).keys()).length : 0;
        
        // Get audience groups and convert to shorthand
        const audienceGroups = Array.from(audienceMap.keys()).sort();
        const audienceBubbles = audienceGroups.map(audience => 
            `<span class="audience-bubble">${window.utils.getAudienceGroupShorthand(audience)}</span>`
        ).join('');

        return `
            <div class="search-result-card" onclick="window.appExplorer.showAppModal('${appId}');">
                <div class="card-header">
                    <div class="card-icon">
                        ${window.utils.createAppIconHtml(app.largeImageUrl)}
                    </div>
                    <div class="card-title-section">
                        <h4 class="card-title">${window.utils.escapeHtml(window.utils.getAppDisplayName(app, appId))}</h4>
                        <p class="card-id">${window.utils.escapeHtml(appId)}</p>
                    </div>
                </div>
                <div class="card-content">
                    <p class="card-developer"><strong>Developer:</strong> ${window.utils.escapeHtml(app.developerName || 'Unknown Developer')}</p>
                    <p class="card-version"><strong>Version:</strong> v${window.utils.escapeHtml(app.version || 'Unknown')}</p>
                    ${app.officeAssetId ? `<p class="card-office-asset"><strong>Office Asset ID:</strong> ${window.utils.escapeHtml(app.officeAssetId)}</p>` : ''}
                    ${app.description ? `<p class="card-description">${window.utils.escapeHtml(app.description).substring(0, 120)}${app.description.length > 120 ? '...' : ''}</p>` : ''}
                    <div class="card-badges">
                        ${hasEntitlements ? 
                            `<span class="entitlement-badge has-entitlements">✓ ${entitlementCount} entitlement${entitlementCount !== 1 ? 's' : ''}</span>` : 
                            '<span class="entitlement-badge no-entitlements">No entitlements</span>'
                        }
                    </div>
                </div>
                <div class="audience-groups">
                    ${audienceBubbles}
                </div>
            </div>
        `;
    }

    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        if (window.appExplorer && typeof window.appExplorer.showStatus === 'function') {
            window.appExplorer.showStatus(message, type);
        }
    }

    /**
     * Hide status message
     */
    hideStatus() {
        if (window.appExplorer && typeof window.appExplorer.hideStatus === 'function') {
            window.appExplorer.hideStatus();
        }
    }
}

// Export to global scope
window.SearchEngine = SearchEngine;
