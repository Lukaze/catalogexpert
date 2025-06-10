/**
 * Main Teams App Catalog Explorer Module
 * Core application class that coordinates all other modules
 */
class TeamsAppCatalogExplorer {
    constructor() {
        // Core data stores
        this.catalogConfigs = new Map(); // Store configs per audience group
        this.appDefinitions = new Map(); // App ID -> Map of audienceGroup -> app definition
        this.appEntitlements = new Map(); // App ID -> Map of "audienceGroup.scope.context" -> preconfigured entitlement
        this.loadedSources = 0;
        this.totalSources = 0;
        this.isLoading = false;        // Configuration        this.audienceGroups = new Set(); // Will be populated from actual data
        this.constants = window.utils.CONSTANTS;
        
        // Global audience filter state for Entitlement States tab
        this.globalSelectedAudiences = new Set(); // Will be populated when data is loaded
        
        // Search audience filter state for Search Apps tab
        this.searchSelectedAudiences = new Set(); // Will be populated when data is loaded
        
        // Initialize modules
        this.dataLoader = new window.DataLoader(
            (message, progress) => this.updateBlockingLoader(message, progress),
            (message, type) => this.showStatus(message, type),
            () => this.updateStats(),
            () => this.hideBlockingLoader(),
            () => this.showAllApps(),
            this.catalogConfigs,
            this.appDefinitions,
            this.appEntitlements
        );
        
        this.searchEngine = new window.SearchEngine(
            this.appDefinitions,
            this.appEntitlements
        );
        
        this.uiRenderer = new window.UIRenderer(
            this.appDefinitions,
            this.appEntitlements
        );
        
        this.modalManager = new window.ModalManager();
        
        this.eventHandlers = new window.EventHandlers();

        // Initialize the application
        this.initializeApp();
    }

    /**
     * Initialize the application
     */
    initializeApp() {
        this.eventHandlers.initializeEventListeners(this);
        this.initializeBlockingLoader();
        this.setupPageVisibilityHandling();
        
        // Show initial loading state
        this.updateBlockingLoader('🚀 Initializing Teams App Catalog Explorer...', 0);
        
        // Start loading catalog data automatically
        setTimeout(() => {
            this.dataLoader.loadAllCatalogConfigurations();
        }, 100);
    }

    /**
     * Setup page visibility handling for better UX
     */
    setupPageVisibilityHandling() {
        // Handle page visibility changes to improve user experience
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, user navigated away
                this.isPageHidden = true;
            } else {
                // Page is visible again
                this.isPageHidden = false;
                
                // If no data has been loaded yet and page becomes visible, ensure loading starts
                if (this.appDefinitions.size === 0 && !this.dataLoader.isLoading) {
                    this.dataLoader.loadAllCatalogConfigurations();
                }
            }
        });
        
        // Handle page unload to clean up any pending operations
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /**
     * Cleanup function for when page is unloading
     */
    cleanup() {
        // Cancel any pending operations or clean up resources
        if (this.blockingLoader) {
            this.blockingLoader.style.display = 'none';
        }
    }

    /**
     * Initialize blocking loader elements
     */
    initializeBlockingLoader() {
        this.blockingLoader = document.getElementById('blockingLoader');
        this.loaderMessage = document.getElementById('loaderMessage');
        this.loaderProgressBar = document.getElementById('loaderProgressBar');
        this.loaderStats = document.getElementById('loaderStats');
        this.loaderSourcesLoaded = document.getElementById('loaderSourcesLoaded');
        this.loaderTotalSources = document.getElementById('loaderTotalSources');
    }

    /**
     * Update blocking loader display with enhanced progress tracking
     */
    updateBlockingLoader(message, progressPercent = 0) {
        if (this.loaderMessage) {
            this.loaderMessage.textContent = message;
        }
        
        if (this.loaderProgressBar) {
            this.loaderProgressBar.style.width = `${progressPercent}%`;
        }
        
        // Show stats when we have meaningful data
        if (this.dataLoader && this.dataLoader.totalSources > 0) {
            if (this.loaderStats) {
                this.loaderStats.style.display = 'grid';
            }
            if (this.loaderSourcesLoaded) {
                this.loaderSourcesLoaded.textContent = this.dataLoader.loadedSources;
            }
            if (this.loaderTotalSources) {
                this.loaderTotalSources.textContent = this.dataLoader.totalSources;
            }
        }
        
        if (this.blockingLoader) {
            if (progressPercent === 0 || !this.blockingLoader.style.display || this.blockingLoader.style.display === 'none') {
                this.blockingLoader.style.display = 'flex';
            }
        }
        
        // Handle error states
        if (message.includes('❌') || message.includes('Failed')) {
            this.showLoadingError(message);
        }
    }

    /**
     * Show error state in loading screen
     */
    showLoadingError(errorMessage) {
        if (this.loaderProgressBar) {
            this.loaderProgressBar.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
        }
        
        // Add retry button to loader if it doesn't exist
        if (this.blockingLoader && !this.blockingLoader.querySelector('.loader-retry-btn')) {
            const retryButton = document.createElement('button');
            retryButton.className = 'loader-retry-btn';
            retryButton.textContent = '🔄 Retry Loading';
            retryButton.style.cssText = `
                margin-top: 20px;
                padding: 10px 20px;
                background: #4f46e5;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 500;
                transition: background 0.2s;
            `;
            retryButton.addEventListener('mouseenter', () => {
                retryButton.style.background = '#3730a3';
            });
            retryButton.addEventListener('mouseleave', () => {
                retryButton.style.background = '#4f46e5';
            });
            retryButton.addEventListener('click', () => {
                this.retryLoading();
            });
            
            const loaderContainer = this.blockingLoader.querySelector('.loader-container');
            if (loaderContainer) {
                loaderContainer.appendChild(retryButton);
            }
        }
    }

    /**
     * Retry loading catalog data
     */
    retryLoading() {
        // Reset error state
        if (this.loaderProgressBar) {
            this.loaderProgressBar.style.background = 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)';
        }
        
        // Remove retry button
        const retryButton = this.blockingLoader.querySelector('.loader-retry-btn');
        if (retryButton) {
            retryButton.remove();
        }
        
        // Reset data loader state
        this.dataLoader.loadedSources = 0;
        this.dataLoader.totalSources = 0;
        this.dataLoader.urlCache.clear();
        this.catalogConfigs.clear();
        
        // Restart loading
        this.updateBlockingLoader('🔄 Retrying catalog data loading...', 0);
        setTimeout(() => {
            this.dataLoader.loadAllCatalogConfigurations();
        }, 500);
    }

    /**
     * Hide blocking loader with smooth animation
     */
    hideBlockingLoader() {
        if (this.blockingLoader) {
            // Add fade-out animation
            this.blockingLoader.style.opacity = '0';
            this.blockingLoader.style.transition = 'opacity 0.5s ease-out';
            
            setTimeout(() => {
                this.blockingLoader.style.display = 'none';
                this.blockingLoader.style.opacity = '1';
                this.blockingLoader.style.transition = '';
            }, 500);
        }
    }

    /**
     * Update application statistics
     */
    updateStats() {
        this.uiRenderer.updateStats();
    }    /**
     * Show all available apps
     */
    showAllApps() {
        // Populate audience groups from loaded data
        this.populateAudienceGroups();
        
        // Initialize search tab now that we have data
        this.initializeSearchTab();
        
        // Show all apps in the search results
        this.searchEngine.showAllApps();
    }

    /**
     * Handle search input
     */
    handleSearchInput(query) {
        this.searchEngine.handleSearchInput(query);
    }    /**
     * Refresh search display with audience filtering
     */
    refreshSearchDisplay() {
        // Get current search term
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        
        if (searchTerm) {
            // If there's a search term, perform filtered search
            this.searchEngine.handleSearchInput(searchTerm, this.searchSelectedAudiences);
        } else {
            // If no search term, show all apps with audience filtering
            if (this.searchSelectedAudiences && this.searchSelectedAudiences.size > 0) {
                this.searchEngine.showAllAppsWithAudienceFilter(this.searchSelectedAudiences);
            } else {
                this.searchEngine.showAllApps();
            }
        }
    }

    /**
     * Show app modal
     */
    showAppModal(appId) {
        this.modalManager.showAppModal(
            appId,
            this.appDefinitions,
            this.dataLoader,
            this.uiRenderer,
            this.constants
        );
    }

    /**
     * Show state details modal
     */
    showStateDetails(state) {
        this.modalManager.showStateDetails(
            state,
            () => this.analyzeEntitlementStatesUnfiltered(),
            (appId) => this.getAppInfo(appId),
            this.appEntitlements,
            this.globalSelectedAudiences
        );
    }

    /**
     * Show state reference modal
     */
    showStateReference() {
        this.modalManager.showStateReference();
    }

    /**
     * Show loaded sources modal
     */
    showLoadedSourcesModal() {
        this.modalManager.showLoadedSourcesModal(
            this.uiRenderer,        this.dataLoader.urlToAudienceGroups
        );
    }

    /**
     * Tab switching functionality
     */
    switchTab(tabName) {
        this.eventHandlers.switchTab(tabName);
        
        // Initialize tab-specific content
        if (tabName === 'entitlementStates') {
            this.initializeEntitlementStatesTab();
        } else if (tabName === 'search') {
            this.initializeSearchTab();
        }
    }    /**
     * Populate audience groups from loaded data
     */
    populateAudienceGroups() {
        const actualAudienceGroups = new Set();
        
        // Collect audience groups from app definitions (always available)
        for (const [appId, audienceMap] of this.appDefinitions.entries()) {
            for (const [audienceGroup] of audienceMap.entries()) {
                actualAudienceGroups.add(audienceGroup);
            }
        }
        
        // Also collect from entitlements if available (for consistency)
        if (this.appEntitlements.size > 0) {
            for (const [appId, entitlementMap] of this.appEntitlements.entries()) {
                for (const [entitlementKey] of entitlementMap.entries()) {
                    // Extract audience group from the entitlement key format: "audienceGroup.scope.context"
                    const [audienceGroup] = entitlementKey.split('.');
                    if (audienceGroup) {
                        actualAudienceGroups.add(audienceGroup);
                    }
                }
            }
        }

        // Update the audienceGroups with actual data
        this.audienceGroups = actualAudienceGroups;

        // Initialize global selected audiences if empty or if using old hardcoded data
        if (this.globalSelectedAudiences.size === 0 || 
            !Array.from(this.globalSelectedAudiences).some(audience => actualAudienceGroups.has(audience))) {
            // Start with all actual audience groups selected
            this.globalSelectedAudiences = new Set(actualAudienceGroups);
        }

        // Initialize search selected audiences if empty or if using old hardcoded data
        if (this.searchSelectedAudiences.size === 0 || 
            !Array.from(this.searchSelectedAudiences).some(audience => actualAudienceGroups.has(audience))) {
            // Start with all actual audience groups selected for search
            this.searchSelectedAudiences = new Set(actualAudienceGroups);
        }
    }

    /**
     * Initialize the Entitlement States tab content
     */    initializeEntitlementStatesTab() {
        // Only initialize if we have data loaded
        if (this.appDefinitions.size === 0 || this.appEntitlements.size === 0) {
            const resultsElement = document.getElementById('entitlementStatesResults');
            if (resultsElement) {
                resultsElement.innerHTML = `
                    <div class="no-entitlements-message">
                        <p>No catalog data loaded yet.</p>
                        <p>Please load catalog data from the Search Apps tab first.</p>
                    </div>
                `;
            }
            return;
        }

        // Populate audience groups from data
        this.populateAudienceGroups();

        // Show and populate the global audience filter
        const filterContainer = document.getElementById('globalAudienceFilter');
        if (filterContainer) {
            filterContainer.style.display = 'block';
        }

        // Render the global audience filter with actual audience groups
        this.uiRenderer.renderGlobalAudienceFilter(this.audienceGroups, this.globalSelectedAudiences);

        // Show the stats section
        const statsElement = document.getElementById('entitlementStatesStats');
        if (statsElement) {
            statsElement.style.display = 'grid';
        }

        // Refresh the entitlement states display
        this.refreshEntitlementStatesDisplay();
    }    /**
     * Initialize the Search tab content
     */
    initializeSearchTab() {
        // Only initialize if we have data loaded
        if (this.appDefinitions.size === 0) {
            const filterContainer = document.getElementById('searchAudienceFilter');
            if (filterContainer) {
                filterContainer.style.display = 'none';
            }
            return;
        }

        // Initialize search selected audiences if empty or if using old hardcoded data
        if (this.searchSelectedAudiences.size === 0 || 
            !Array.from(this.searchSelectedAudiences).some(audience => this.audienceGroups.has(audience))) {
            // Start with all actual audience groups selected for search
            this.searchSelectedAudiences = new Set(this.audienceGroups);
        }

        // Show and populate the search audience filter
        const filterContainer = document.getElementById('searchAudienceFilter');
        if (filterContainer) {
            filterContainer.style.display = 'block';
        }

        // Render the search audience filter with actual audience groups
        this.uiRenderer.renderSearchAudienceFilter(this.audienceGroups, this.searchSelectedAudiences);
        
        // Refresh the search display to apply any existing filters
        this.refreshSearchDisplay();
    }

    /**
     * Toggle global audience filter
     */
    toggleGlobalAudienceFilter(audience) {
        this.eventHandlers.toggleGlobalAudienceFilter(audience, this);
    }

    /**
     * Select all global audiences
     */
    selectAllGlobalAudiences() {
        this.eventHandlers.selectAllGlobalAudiences(this);
    }

    /**
     * Clear all global audiences
     */
    clearAllGlobalAudiences() {
        this.eventHandlers.clearAllGlobalAudiences(this);
    }

    /**
     * Toggle search audience filter
     */
    toggleSearchAudienceFilter(audience) {
        this.eventHandlers.toggleSearchAudienceFilter(audience, this);
    }

    /**
     * Select all search audiences
     */
    selectAllSearchAudiences() {
        this.eventHandlers.selectAllSearchAudiences(this);
    }

    /**
     * Clear all search audiences
     */
    clearAllSearchAudiences() {
        this.eventHandlers.clearAllSearchAudiences(this);
    }

    /**
     * Toggle audience filter in state details modal
     */
    toggleAudienceFilter(audience) {
        this.eventHandlers.handleAudienceFilterToggle(audience, this);
    }

    /**
     * Clear audience filters in state details modal
     */
    clearAudienceFilters() {
        this.eventHandlers.handleClearAudienceFilters(this);
    }

    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        this.eventHandlers.showStatus(message, type);
    }

    /**
     * Hide status message
     */
    hideStatus() {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = 'status';
        }
    }

    /**
     * Get app information
     */
    getAppInfo(appId) {
        const audienceMap = this.appDefinitions.get(appId);
        if (!audienceMap || audienceMap.size === 0) {
            return {
                name: this.constants.UNKNOWN_APP,
                developerName: this.constants.UNKNOWN_DEVELOPER,
                version: this.constants.VERSION_NA,
                largeImageUrl: '',
                isCoreApp: false,
                isTeamsOwned: false
            };
        }
        
        // Return the first app instance (they should have the same basic info)
        return audienceMap.values().next().value;
    }

    /**
     * Get app preconfigured entitlements
     */
    getAppPreconfiguredEntitlements(appId) {
        const entitlementMap = this.appEntitlements.get(appId);
        if (!entitlementMap) return {};
        
        const audienceEntitlements = {};
        
        for (const [key, entitlement] of entitlementMap.entries()) {
            // Extract audience group from key format: "audienceGroup.scope.context"
            const [audienceGroup] = key.split('.');
            
            if (!audienceEntitlements[audienceGroup]) {
                audienceEntitlements[audienceGroup] = [];
            }
            
            audienceEntitlements[audienceGroup].push(entitlement);
        }
        
        return audienceEntitlements;
    }

    /**
     * Analyze entitlement states (filtered by global audience selection)
     */
    analyzeEntitlementStates() {
        const stateToApps = new Map();
        
        // Only process apps from selected audience groups
        for (const [appId, entitlementMap] of this.appEntitlements.entries()) {
            for (const [entitlementKey, entitlement] of entitlementMap.entries()) {
                // Extract audience group from the entitlement key format: "audienceGroup.scope.context"
                const [audienceGroup] = entitlementKey.split('.');
                
                // Skip if this audience group is not selected
                if (!this.globalSelectedAudiences.has(audienceGroup)) {
                    continue;
                }
                
                const state = entitlement.state;
                if (!stateToApps.has(state)) {
                    stateToApps.set(state, {
                        apps: new Set(),
                        audiences: new Set()
                    });
                }
                
                stateToApps.get(state).apps.add(appId);
                stateToApps.get(state).audiences.add(audienceGroup);
            }
        }
        
        return stateToApps;
    }

    /**
     * Analyze entitlement states (unfiltered - shows all audience groups)
     */
    analyzeEntitlementStatesUnfiltered() {
        const stateToApps = new Map();
        
        // Process all apps regardless of global audience selection
        for (const [appId, entitlementMap] of this.appEntitlements.entries()) {
            for (const [entitlementKey, entitlement] of entitlementMap.entries()) {
                // Extract audience group from the entitlement key format: "audienceGroup.scope.context"
                const [audienceGroup] = entitlementKey.split('.');
                
                const state = entitlement.state;
                if (!stateToApps.has(state)) {
                    stateToApps.set(state, {
                        apps: new Set(),
                        audiences: new Set()
                    });
                }
                
                stateToApps.get(state).apps.add(appId);
                stateToApps.get(state).audiences.add(audienceGroup);
            }
        }
        
        return stateToApps;
    }

    /**
     * Refresh entitlement states display
     */
    refreshEntitlementStatesDisplay() {
        try {
            const resultsElement = document.getElementById('entitlementStatesResults');
            
            if (!resultsElement) {
                console.error('Entitlement states results element not found');
                return;
            }

            // Show message if no audience groups are selected
            if (this.globalSelectedAudiences.size === 0) {
                resultsElement.innerHTML = `
                    <div class="no-entitlements-message">
                        <p style="color: #ef4444; font-weight: bold;">No audience groups selected</p>
                        <p>Select at least one audience group using the filter above to view entitlement states.</p>
                    </div>
                `;
                
                // Clear stats
                const uniqueStatesEl = document.getElementById('uniqueStates');
                const appsWithEntitlementsEl = document.getElementById('appsWithEntitlements');
                if (uniqueStatesEl) uniqueStatesEl.textContent = '0';
                if (appsWithEntitlementsEl) appsWithEntitlementsEl.textContent = '0';
                return;
            }

            // Get filtered entitlement states
            const entitlementStates = this.analyzeEntitlementStates();
            
            if (entitlementStates.size === 0) {
                resultsElement.innerHTML = `
                    <div class="no-entitlements-message">
                        <p>No preconfigured entitlement states found for the selected audience groups.</p>
                        <p>Load catalog data from the Search Apps tab first, or try selecting different audience groups.</p>
                    </div>
                `;
                return;
            }

            // Update stats
            this.uiRenderer.updateEntitlementStatesStats(entitlementStates);
            
            // Display filtered results
            this.uiRenderer.displayEntitlementStates(entitlementStates);
            
        } catch (error) {
            console.error('Error refreshing entitlement states display:', error);
            const resultsElement = document.getElementById('entitlementStatesResults');
            if (resultsElement) {
                resultsElement.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ef4444;">
                        <p>Error refreshing entitlement states display</p>
                    </div>
                `;
            }
        }
    }
}
