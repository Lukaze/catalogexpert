/**
 * Data loading and caching functionality for the Teams App Catalog Explorer
 */

class DataLoader {
    constructor(progressCallback, statusCallback, statsCallback, hideLoaderCallback, showAppsCallback, catalogConfigs, appDefinitions, appEntitlements) {
        // Use external data stores if provided, otherwise create our own
        this.catalogConfigs = catalogConfigs || new Map(); 
        this.appDefinitions = appDefinitions || new Map(); 
        this.appEntitlements = appEntitlements || new Map(); 
        this.loadedSources = 0;
        this.totalSources = 0;
        this.isLoading = false;
        
        // URL-based caching to avoid fetching the same files multiple times
        this.urlCache = new Map(); // URL -> Promise<data>
        this.urlToAudienceGroups = new Map(); // URL -> Set<audienceGroup>
        
        // Callback functions to communicate with parent
        this.updateBlockingLoader = progressCallback;
        this.showStatus = statusCallback;
        this.updateStats = statsCallback;
        this.hideBlockingLoader = hideLoaderCallback;
        this.showAllApps = showAppsCallback;
    }

    // Fetch URL with caching to avoid duplicate requests
    async fetchUrlWithCache(url) {
        // Check if we already have this URL cached
        if (this.urlCache.has(url)) {
            return await this.urlCache.get(url);
        }
        
        // Create a promise for this URL and cache it immediately
        const fetchPromise = fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Origin': 'https://teams.microsoft.com',
                'Referer': 'https://teams.microsoft.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            mode: 'cors',
            credentials: 'omit'
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }        }).then(data => {
            // Update progress counter when URL is successfully fetched for the first time
            this.loadedSources++;
            const progressPercent = Math.floor((this.loadedSources / this.totalSources) * 30) + 30; // 30-60% range for loading
            this.updateBlockingLoader(`📥 Loaded ${this.loadedSources}/${this.totalSources} data sources...`, progressPercent);
            return data;
        }).catch(error => {
            // Update progress counter even on error
            this.loadedSources++;
            const progressPercent = Math.floor((this.loadedSources / this.totalSources) * 30) + 30;
            this.updateBlockingLoader(`⚠️ Error loading source ${this.loadedSources}/${this.totalSources}`, progressPercent);
            throw error;
        });
        
        // Cache the promise immediately so concurrent requests use the same promise
        this.urlCache.set(url, fetchPromise);
        
        return await fetchPromise;
    }

    // Track which audience groups use each URL
    trackUrlForAudience(url, audienceGroup) {
        if (!this.urlToAudienceGroups.has(url)) {
            this.urlToAudienceGroups.set(url, new Set());
        }
        this.urlToAudienceGroups.get(url).add(audienceGroup);
    }

    // Load catalog configuration for a specific audience group
    async loadCatalogConfiguration(audienceGroup) {
        try {
            // Construct the catalog configuration URL using the correct config.edge.skype.com endpoint
            let configUrl = 'https://config.edge.skype.com/config/v1/MicrosoftTeams/1.0.0.0?agents=MicrosoftTeamsAppCatalog';
            
            // Add AudienceGroup query parameter for non-general audiences
            if (audienceGroup !== 'general') {
                configUrl += `&AudienceGroup=${audienceGroup}`;
            }
            
            // Fetch and cache the configuration
            const configData = await this.fetchUrlWithCache(configUrl);
            
            if (configData && configData.MicrosoftTeamsAppCatalog) {
                // Store the configuration for this audience group
                this.catalogConfigs.set(audienceGroup, configData);
                return configData;
            } else {
                console.warn(`⚠️ Invalid config structure for ${audienceGroup}`);
                throw new Error(`Invalid catalog configuration structure for ${audienceGroup}`);
            }
        } catch (error) {
            console.error(`❌ Failed to load catalog configuration for ${audienceGroup}:`, error);
            throw error;
        }
    }    // Load configurations for all audience groups
    async loadAllCatalogConfigurations() {
        try {
            this.updateBlockingLoader('🔧 Connecting to Microsoft Teams catalog servers...', 5);
            
            // Load configurations for all audience groups in parallel
            const configPromises = window.utils.AUDIENCE_GROUPS.map(audienceGroup => 
                this.loadCatalogConfiguration(audienceGroup)
            );
            const results = await Promise.allSettled(configPromises);
            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.length - succeeded;
            
            if (succeeded === 0) {
                this.updateBlockingLoader('❌ Failed to connect to catalog servers', 100);
                throw new Error('Failed to load any catalog configurations');
            }
            
            this.updateBlockingLoader(`✅ Connected to ${succeeded} audience groups!${failed > 0 ? ` (${failed} failed)` : ''}`, 20);
            
            // Now load all catalog data
            await this.loadAllCatalogData();
        } catch (error) {
            this.updateBlockingLoader('❌ Failed to load Microsoft Teams catalog configurations. Please check your network connection and try again.', 100);
            console.error('Error loading configurations:', error);
        }
    }

    // Load all catalog data (app definitions and entitlements)
    async loadAllCatalogData() {
        // First pass: collect all unique URLs and track which audience groups use them
        const uniqueUrls = new Set();
        this.totalSources = 0;
        this.loadedSources = 0;
        
        this.updateBlockingLoader('🔍 Analyzing catalog data sources...', 25);
        
        this.catalogConfigs.forEach((config, audienceGroup) => {
            const catalogConfig = config.MicrosoftTeamsAppCatalog?.appCatalog;
            if (catalogConfig) {
                // Track app definition sources
                const appDefinitionSources = [
                    catalogConfig.storeAppDefinitions,
                    catalogConfig.coreAppDefinitions,
                    catalogConfig.preApprovedAppDefinitions,
                    catalogConfig.overrideAppDefinitions
                ];
                
                appDefinitionSources.forEach(sourceConfig => {
                    if (sourceConfig && sourceConfig.sources) {
                        sourceConfig.sources.forEach(url => {
                            uniqueUrls.add(url);
                            this.trackUrlForAudience(url, audienceGroup);
                        });
                    }
                });
                
                // Track preconfigured entitlement sources
                if (catalogConfig.preconfiguredAppEntitlements && catalogConfig.preconfiguredAppEntitlements.sources) {
                    catalogConfig.preconfiguredAppEntitlements.sources.forEach(url => {
                        uniqueUrls.add(url);
                        this.trackUrlForAudience(url, audienceGroup);
                    });
                }
            }
        });
        
        this.totalSources = uniqueUrls.size;
        this.updateBlockingLoader(`📦 Preparing to load ${this.totalSources} data sources...`, 30);
        
        // Step 1: Load ALL app definitions first (across all audience groups)
        const appDefinitionPromises = [];
        let loadedCount = 0;
        
        this.catalogConfigs.forEach((config, audienceGroup) => {
            appDefinitionPromises.push(                this.loadAppDefinitionsForAudience(audienceGroup, config).then(() => {
                    loadedCount++;
                    this.updateBlockingLoader(`📱 Loaded app definitions for ${audienceGroup} (${loadedCount}/${this.catalogConfigs.size})`, 30 + Math.floor(30 * loadedCount / this.catalogConfigs.size));
                })
            );
        });
        
        await Promise.allSettled(appDefinitionPromises);
        this.updateBlockingLoader('🔐 App definitions loaded. Now loading entitlements...', 65);
        
        // Step 2: Load preconfigured entitlements AFTER all app definitions are loaded
        const entitlementPromises = [];
        loadedCount = 0;
        
        this.catalogConfigs.forEach((config, audienceGroup) => {
            entitlementPromises.push(                this.loadPreconfiguredEntitlementsForAudience(audienceGroup, config).then(() => {
                    loadedCount++;
                    this.updateBlockingLoader(`🔐 Loaded entitlements for ${audienceGroup} (${loadedCount}/${this.catalogConfigs.size})`, 65 + Math.floor(25 * loadedCount / this.catalogConfigs.size));
                })
            );
        });
        
        await Promise.allSettled(entitlementPromises);
        this.updateBlockingLoader('⚡ Finalizing catalog data...', 95);
        
        // Log cache efficiency
        const totalPossibleRequests = Array.from(this.urlToAudienceGroups.values())
            .reduce((sum, audiences) => sum + audiences.size, 0);
        const savedRequests = totalPossibleRequests - this.totalSources;        this.updateBlockingLoader(`🎉 All catalog data loaded! Cache saved ${savedRequests} requests.`, 100);
        this.updateStatsDisplay();
        
        setTimeout(() => {
            this.hideBlockingLoader();
            // Show all apps by default in search tab
            this.showAllApps();
        }, 600);
    }

    // Load app definitions for a specific audience group
    async loadAppDefinitionsForAudience(audienceGroup, config) {
        const catalogConfig = config.MicrosoftTeamsAppCatalog?.appCatalog;
        if (!catalogConfig) return;
        
        // Load all types of app definitions for this audience group
        const appDefinitionSources = [
            { type: 'store', config: catalogConfig.storeAppDefinitions },
            { type: 'core', config: catalogConfig.coreAppDefinitions },
            { type: 'preApproved', config: catalogConfig.preApprovedAppDefinitions },
            { type: 'override', config: catalogConfig.overrideAppDefinitions }
        ];
        
        // Load app definitions sequentially to ensure proper ordering
        for (const source of appDefinitionSources) {
            if (source.config && source.config.sources) {
                await this.loadAppDefinitions(source.config.sources, audienceGroup, source.type);
            }
        }
    }

    // Load preconfigured entitlements for a specific audience group
    async loadPreconfiguredEntitlementsForAudience(audienceGroup, config) {
        const catalogConfig = config.MicrosoftTeamsAppCatalog?.appCatalog;
        if (!catalogConfig) return;
        
        // Load preconfigured entitlements ONLY AFTER all app definitions are loaded
        if (catalogConfig.preconfiguredAppEntitlements && catalogConfig.preconfiguredAppEntitlements.sources) {
            await this.loadAppPreconfiguredEntitlements(catalogConfig.preconfiguredAppEntitlements.sources, audienceGroup);
        }
    }

    // Load app definitions from sources
    async loadAppDefinitions(sources, audienceGroup, sourceType = 'store') {
        const loadPromises = sources.map(async (sourceUrl) => {
            try {
                const appData = await this.fetchUrlWithCache(sourceUrl);
                
                if (appData.value && appData.value.appDefinitions) {
                    appData.value.appDefinitions.forEach(app => {
                        if (app.id) {
                            // Initialize app map if it doesn't exist
                            if (!this.appDefinitions.has(app.id)) {
                                this.appDefinitions.set(app.id, new Map());
                            }
                            
                            // Store app definition for this audience group with source type info
                            const appWithMeta = { ...app, sourceType, audienceGroup };
                            this.appDefinitions.get(app.id).set(audienceGroup, appWithMeta);
                        }
                    });
                }
                
            } catch (error) {
                console.error(`Error loading ${sourceType} app definitions from`, sourceUrl, 'for audience', audienceGroup, error);
            }
        });
        
        await Promise.all(loadPromises);
    }

    // Load preconfigured entitlements from sources
    async loadAppPreconfiguredEntitlements(sources, audienceGroup) {
        const loadPromises = sources.map(async (sourceUrl) => {
            try {
                const preconfiguredEntitlementData = await this.fetchUrlWithCache(sourceUrl);
                
                if (preconfiguredEntitlementData.value && preconfiguredEntitlementData.value.appEntitlements) {
                    // Process preconfigured entitlements by scope and context
                    Object.keys(preconfiguredEntitlementData.value.appEntitlements).forEach(scope => {
                        const scopeEntitlements = preconfiguredEntitlementData.value.appEntitlements[scope];
                        
                        Object.keys(scopeEntitlements).forEach(context => {
                            const entitlementArray = scopeEntitlements[context];
                            if (Array.isArray(entitlementArray)) {
                                entitlementArray.forEach((entitlement, index) => {
                                    if (entitlement) {
                                        let appId = null;
                                        
                                        // Method 1: Check if entitlement has explicit id field (Microsoft Teams standard)
                                        if (entitlement.id) {
                                            appId = entitlement.id;
                                        }
                                        // Method 2: Check if entitlement has appId field (legacy/alternative)
                                        else if (entitlement.appId) {
                                            appId = entitlement.appId;
                                        }
                                        // Skip entitlements without ID - these might be empty objects or defaults
                                        else {
                                            return;
                                        }
                                        
                                        if (appId) {
                                            // Verify this app exists in our definitions for this audience
                                            if (this.appDefinitions.has(appId) && this.appDefinitions.get(appId).has(audienceGroup)) {
                                                if (!this.appEntitlements.has(appId)) {
                                                    this.appEntitlements.set(appId, new Map());
                                                }
                                                
                                                const appEntitlementMap = this.appEntitlements.get(appId);
                                                const key = `${audienceGroup}.${scope}.${context}`;
                                                
                                                // Add the appId to the entitlement for reference
                                                const entitlementWithAppId = { ...entitlement, appId };
                                                appEntitlementMap.set(key, entitlementWithAppId);
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
                
            } catch (error) {
                console.error('Error loading app entitlements from', sourceUrl, 'for audience', audienceGroup, error);
            }
        });
        
        await Promise.all(loadPromises);
        
        // Log summary for this audience group
        const totalEntitlementsForAudience = Array.from(this.appEntitlements.values())
            .reduce((count, appMap) => {
                const audienceEntitlements = Array.from(appMap.keys()).filter(key => key.startsWith(audienceGroup + '.'));
                return count + audienceEntitlements.length;
            }, 0);
    }    // Update statistics
    updateStatsDisplay() {
        // Calculate total unique apps across all audience groups
        const uniqueApps = new Set();
        this.appDefinitions.forEach((audienceMap, appId) => {
            if (audienceMap.size > 0) uniqueApps.add(appId);
        });
        
        // Count unique preconfigured entitlements by App ID (not total occurrences)
        const uniquePreconfiguredEntitlements = new Set();
        this.appEntitlements.forEach((entitlementMap, appId) => {
            if (entitlementMap.size > 0) {
                uniquePreconfiguredEntitlements.add(appId);
            }
        });
        
        document.getElementById('totalApps').textContent = uniqueApps.size;
        document.getElementById('loadedSources').textContent = this.loadedSources;
        document.getElementById('entitlementConfigs').textContent = uniquePreconfiguredEntitlements.size;
        document.getElementById('catalogStats').style.display = 'grid';
    }// Get app information
    getAppInfo(appId) {
        const audienceMap = this.appDefinitions.get(appId);
        if (!audienceMap || audienceMap.size === 0) {
            return { name: window.utils.CONSTANTS.UNKNOWN_APP, developerName: window.utils.CONSTANTS.UNKNOWN_DEVELOPER };
        }
        return audienceMap.values().next().value;
    }

    // Get app preconfigured entitlements
    getAppPreconfiguredEntitlements(appId) {
        if (!this.appEntitlements.has(appId)) {
            return {};
        }
        
        const entitlementMap = this.appEntitlements.get(appId);
        const entitlementInfo = {};
        
        entitlementMap.forEach((entitlement, key) => {
            entitlementInfo[key] = entitlement;
        });
        
        return entitlementInfo;
    }
}

// Export for use in other modules
window.DataLoader = DataLoader;
