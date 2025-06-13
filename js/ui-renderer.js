/**
 * UI Renderer Module
 * Handles all UI rendering and DOM manipulation for the Teams App Catalog Explorer
 */
class UIRenderer {
    constructor(appDefinitions, appEntitlements) {
        this.appDefinitions = appDefinitions;
        this.appEntitlements = appEntitlements;
    }

    /**
     * Update statistics display
     */
    updateStats() {
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
        document.getElementById('catalogStats').style.display = 'grid';
    }

    /**
     * Update entitlement states statistics
     */
    updateEntitlementStatesStats(entitlementStates) {
        const uniqueStatesEl = document.getElementById('uniqueStates');
        const appsWithEntitlementsEl = document.getElementById('appsWithEntitlements');
        
        const allApps = new Set();
        
        for (const [state, data] of entitlementStates.entries()) {
            data.apps.forEach(app => allApps.add(app));
        }
        
        uniqueStatesEl.textContent = entitlementStates.size;
        appsWithEntitlementsEl.textContent = allApps.size;
    }

    /**
     * Display entitlement states in grid format
     */
    displayEntitlementStates(entitlementStates) {
        const resultsElement = document.getElementById('entitlementStatesResults');
        
        if (entitlementStates.size === 0) {
            resultsElement.innerHTML = `
                <div class="no-entitlements-message">
                    <p>No preconfigured entitlement states found.</p>
                    <p>Load catalog data from the Search Apps tab first.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        // Sort states by number of apps (descending)
        const sortedStates = Array.from(entitlementStates.entries())
            .sort(([,a], [,b]) => b.apps.size - a.apps.size);
        
        for (const [state, data] of sortedStates) {
            const appsArray = Array.from(data.apps);
            const audiencesArray = Array.from(data.audiences).sort();
            
            html += `
                <div class="entitlement-state-card" onclick="window.appExplorer.showStateDetails('${window.utils.escapeHtml(state)}')">
                    <div class="entitlement-state-header">
                        <h3 class="entitlement-state-title">${window.utils.escapeHtml(state)}</h3>
                        <span class="entitlement-state-count">${appsArray.length}</span>
                    </div>
                    <div class="entitlement-apps-list">
                        ${appsArray.slice(0, 8).map(appId => {
                            const app = this.getAppInfo(appId);
                            const iconUrl = app.largeImageUrl || '';
                            const appItemHtml = this.createAppItemHtml(app, appId, iconUrl);
                            return `
                                <div class="entitlement-app-item">
                                    <div class="entitlement-app-info">
                                        <div class="entitlement-app-name">${appItemHtml}</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                        ${appsArray.length > 8 ? 
                            `<div style="text-align: center; padding: 10px; color: #64748b; font-size: 0.9rem;">
                                ... and ${appsArray.length - 8} more apps (click card to view all)
                            </div>` : ''
                        }
                    </div>
                </div>
            `;
        }
        
        resultsElement.innerHTML = html;
    }

    /**
     * Generate detailed app content for modal
     */
    generateDetailedAppContent(audienceMap, appId) {
        const entitlementInfo = this.getAppPreconfiguredEntitlements(appId);
        const firstApp = audienceMap.values().next().value;
        
        // Create audience group versions table with source type info
        const audienceVersionsHtml = this.createAudienceVersionsHtml(audienceMap);
        
        return `
            <div class="modal-app-header">
                ${firstApp.largeImageUrl ? `<img src="${firstApp.largeImageUrl}" alt="${firstApp.name}" class="modal-app-icon" onerror="this.style.display='none'">` : ''}
                <div class="modal-app-basic-info">
                    <h4>ID: ${appId}</h4>
                    <p>Available in ${audienceMap.size} audience groups</p>
                    <p>Preconfigured entitlements: ${Object.keys(entitlementInfo).length}</p>
                </div>
            </div>
            
            <div class="modal-app-details">
                <div class="detail-group">
                    <h4>Audience Group Versions</h4>
                    ${audienceVersionsHtml}
                </div>
                
                <div class="detail-group">
                    <h4>Basic Information</h4>
                    <div class="detail-item">
                        <span class="detail-label">Developer:</span>
                        <span class="detail-value">${firstApp.developerName || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Developer URL:</span>
                        <span class="detail-value">
                            ${firstApp.developerUrl ? `<a href="${firstApp.developerUrl}" target="_blank">${firstApp.developerUrl}</a>` : 'N/A'}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Manifest Version:</span>
                        <span class="detail-value">${firstApp.manifestVersion || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Last Updated:</span>
                        <span class="detail-value">${firstApp.lastUpdatedAt ? new Date(firstApp.lastUpdatedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    ${firstApp.description ? `
                        <div class="detail-item">
                            <span class="detail-label">Description:</span>
                            <span class="detail-value">${firstApp.description}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="detail-group">
                    <h4>App Properties</h4>
                    <div class="detail-item">
                        <span class="detail-label">Core App:</span>
                        <span class="detail-value">${firstApp.isCoreApp ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Teams Owned:</span>
                        <span class="detail-value">${firstApp.isTeamsOwned ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Pinnable:</span>
                        <span class="detail-value">${firstApp.isPinnable ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Preinstallable:</span>
                        <span class="detail-value">${firstApp.isPreinstallable ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Blockable:</span>
                        <span class="detail-value">${firstApp.isBlockable ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Full Trust:</span>
                        <span class="detail-value">${firstApp.isFullTrust ? '✅ Yes' : '❌ No'}</span>
                    </div>
                </div>
            </div>
            
            ${this.renderPreconfiguredEntitlements(entitlementInfo)}
            
            <div class="modal-tags">
                ${firstApp.categories ? firstApp.categories.map(cat => `<span class="tag">${cat}</span>`).join('') : ''}
                ${firstApp.industries ? firstApp.industries.map(ind => `<span class="tag">${ind}</span>`).join('') : ''}
            </div>
        `;
    }    /**
     * Create audience versions HTML
     */
    createAudienceVersionsHtml(audienceMap) {
        return Array.from(audienceMap.entries()).map(([audience, app]) => {
            const shorthand = window.utils.getAudienceGroupShorthand(audience);
            return `
                <div class="detail-item">
                    <span class="detail-label">${shorthand}:</span>
                    <span class="detail-value">
                        v${app.version}
                        ${app.sourceType ? `<span class="tag" style="margin-left: 8px; font-size: 0.7rem;">${app.sourceType}</span>` : ''}
                    </span>
                </div>
            `;
        }).join('');
    }/**
     * Create app item HTML with icon and name
     */
    createAppItemHtml(app, appId, iconUrl) {
        const iconHtml = window.utils.createSmallAppIconHtml(iconUrl);
        const displayName = window.utils.getAppDisplayName(app, appId);
        return `${iconHtml}${displayName}`;
    }

    /**
     * Render preconfigured entitlements
     */
    renderPreconfiguredEntitlements(entitlementInfo) {
        if (Object.keys(entitlementInfo).length === 0) {
            return '<div class="detail-group"><h4>Preconfigured Entitlements</h4><p>No preconfigured entitlements found.</p></div>';
        }

        let html = '<div class="detail-group"><h4>Preconfigured Entitlements</h4>';
        
        for (const [audience, entitlements] of Object.entries(entitlementInfo)) {
            html += `<div class="entitlement-audience-group">
                <h5>${audience}</h5>
                <div class="entitlement-list">`;
            
            entitlements.forEach(entitlement => {
                html += `
                    <div class="entitlement-item">
                        <div class="entitlement-key">${entitlement.scope}/${entitlement.context}</div>
                        <div class="entitlement-state state-${entitlement.state}">${entitlement.state}</div>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
        
        html += '</div>';
        return html;
    }

    /**
     * Render the global audience filter for the Entitlement States tab
     */
    renderGlobalAudienceFilter(audienceGroups, globalSelectedAudiences) {
        const filterContainer = document.getElementById('globalAudienceFilterButtons');
        const filterSummary = document.getElementById('globalFilterSummary');
        
        if (!filterContainer || !filterSummary) return;

        // Get all unique audience groups from loaded entitlements
        const allAudiences = Array.from(audienceGroups).sort();
        
        if (allAudiences.length === 0) {
            filterContainer.innerHTML = '<p style="color: #64748b; font-style: italic;">No audience groups loaded yet.</p>';
            filterSummary.innerHTML = '';
            return;
        }        // Generate filter buttons
        let buttonsHtml = '';
        allAudiences.forEach(audience => {
            const isSelected = globalSelectedAudiences.has(audience);
            const selectedClass = isSelected ? 'selected' : '';
            const shorthand = window.utils.getAudienceGroupShorthand(audience);
            buttonsHtml += `
                <button class="audience-filter-btn ${selectedClass}" 
                        data-audience="${audience.toLowerCase()}"
                        onclick="window.appExplorer.toggleGlobalAudienceFilter('${audience}')">
                    ${shorthand}
                </button>
            `;
        });

        // Add "Select All" and "Clear All" buttons
        const allSelected = globalSelectedAudiences.size === allAudiences.length;
        const noneSelected = globalSelectedAudiences.size === 0;
        
        buttonsHtml += `
            <button class="audience-filter-btn" 
                    onclick="window.appExplorer.selectAllGlobalAudiences()" 
                    style="margin-left: 10px; font-size: 0.8rem; background: #10b981; border-color: #10b981; color: white;"
                    ${allSelected ? 'disabled' : ''}>
                Select All
            </button>
            <button class="audience-filter-btn" 
                    onclick="window.appExplorer.clearAllGlobalAudiences()" 
                    style="margin-left: 5px; font-size: 0.8rem; background: #ef4444; border-color: #ef4444; color: white;"
                    ${noneSelected ? 'disabled' : ''}>
                Clear All
            </button>
        `;

        filterContainer.innerHTML = buttonsHtml;        // Update summary
        if (globalSelectedAudiences.size === 0) {
            filterSummary.innerHTML = '<span style="color: #ef4444;">No audience groups selected - no entitlement states will be shown</span>';
        } else if (globalSelectedAudiences.size === allAudiences.length) {
            filterSummary.innerHTML = `<span style="color: #10b981;">All ${allAudiences.length} audience groups selected</span>`;
        } else {
            const selectedShorthands = Array.from(globalSelectedAudiences).sort().map(audience => 
                window.utils.getAudienceGroupShorthand(audience)
            ).join(', ');
            filterSummary.innerHTML = `<span style="color: #4f46e5;">${globalSelectedAudiences.size} of ${allAudiences.length} audience groups selected: ${selectedShorthands}</span>`;
        }
    }

    /**
     * Render the search audience filter for the Search Apps tab
     */
    renderSearchAudienceFilter(audienceGroups, searchSelectedAudiences) {
        const filterContainer = document.getElementById('searchAudienceFilterButtons');
        const filterSummary = document.getElementById('searchFilterSummary');
        
        if (!filterContainer || !filterSummary) return;

        // Get all unique audience groups from loaded data
        const allAudiences = Array.from(audienceGroups).sort();
        
        if (allAudiences.length === 0) {
            filterContainer.innerHTML = '<p style="color: #64748b; font-style: italic;">No audience groups loaded yet.</p>';
            filterSummary.innerHTML = '';
            return;
        }

        // Generate filter buttons
        let buttonsHtml = '';
        allAudiences.forEach(audience => {
            const isSelected = searchSelectedAudiences.has(audience);
            const selectedClass = isSelected ? 'selected' : '';
            const shorthand = window.utils.getAudienceGroupShorthand(audience);
            buttonsHtml += `
                <button class="audience-filter-btn ${selectedClass}" 
                        data-audience="${audience.toLowerCase()}"
                        onclick="window.appExplorer.toggleSearchAudienceFilter('${audience}')">
                    ${shorthand}
                </button>
            `;
        });

        // Add "Select All" and "Clear All" buttons
        const allSelected = searchSelectedAudiences.size === allAudiences.length;
        const noneSelected = searchSelectedAudiences.size === 0;
        
        buttonsHtml += `
            <button class="audience-filter-btn" 
                    onclick="window.appExplorer.selectAllSearchAudiences()" 
                    style="margin-left: 10px; font-size: 0.8rem; background: #10b981; border-color: #10b981; color: white;"
                    ${allSelected ? 'disabled' : ''}>
                Select All
            </button>
            <button class="audience-filter-btn" 
                    onclick="window.appExplorer.clearAllSearchAudiences()" 
                    style="margin-left: 5px; font-size: 0.8rem; background: #ef4444; border-color: #ef4444; color: white;"
                    ${noneSelected ? 'disabled' : ''}>
                Clear All
            </button>
        `;

        filterContainer.innerHTML = buttonsHtml;

        // Update summary
        if (searchSelectedAudiences.size === 0) {
            filterSummary.innerHTML = '<span style="color: #ef4444;">No audience groups selected - no apps will be shown</span>';
        } else if (searchSelectedAudiences.size === allAudiences.length) {
            filterSummary.innerHTML = `<span style="color: #10b981;">All ${allAudiences.length} audience groups selected</span>`;
        } else {
            const selectedShorthands = Array.from(searchSelectedAudiences).sort().map(audience => 
                window.utils.getAudienceGroupShorthand(audience)
            ).join(', ');
            filterSummary.innerHTML = `<span style="color: #4f46e5;">${searchSelectedAudiences.size} of ${allAudiences.length} audience groups selected: ${selectedShorthands}</span>`;
        }
    }

    /**
     * Render the state details content with current filters
     */
    renderStateDetailsContent(currentStateDetails) {
        const body = document.getElementById('stateDetailsBody');
        const title = document.getElementById('stateDetailsTitle');
        const { state, stateData, selectedAudiences, allAppsData } = currentStateDetails;
        
        // Filter apps based on selected audiences
        let filteredApps = [];
        if (selectedAudiences.size > 0) {
            filteredApps = allAppsData.filter(appData => 
                appData.audiences.some(audience => selectedAudiences.has(audience))
            );
        } else {
            // No audiences selected = show no apps
            filteredApps = [];
        }

        // Update title with filtered count
        title.textContent = `${state} (${filteredApps.length} of ${allAppsData.length} app${allAppsData.length !== 1 ? 's' : ''})`;

        // Get all unique audience groups in this state
        const allAudiences = Array.from(stateData.audiences).sort();

        let html = `
            <!-- Audience Group Filter -->
            <div class="audience-filter-container">
                <h4 class="audience-filter-title">🎯 Filter by Audience Groups</h4>
                <div class="audience-filter-buttons">
        `;

        // Add filter buttons for each audience group
        allAudiences.forEach(audience => {
            const isSelected = selectedAudiences.has(audience);
            const selectedClass = isSelected ? 'selected' : '';
            html += `
                <button class="audience-filter-btn ${selectedClass}" 
                        onclick="window.appExplorer.toggleAudienceFilter('${audience}')">
                    ${audience}
                </button>
            `;
        });

        html += `
                </div>
                <div style="margin-top: 10px; font-size: 0.8rem; color: #64748b;">
                    ${selectedAudiences.size === 0 ? 'No audience groups selected (showing no apps)' : 
                      selectedAudiences.size === allAudiences.length ? 'Showing all audience groups' : 
                      `Filtering by: ${Array.from(selectedAudiences).join(', ')}`}
                    ${selectedAudiences.size < allAudiences.length ? `<button class="audience-filter-btn" onclick="window.appExplorer.clearAudienceFilters()" style="margin-left: 10px; font-size: 0.7rem;">Select All</button>` : ''}
                </div>
            </div>

            <!-- Summary -->
            <div style="margin-bottom: 20px;">
                <h4 style="color: #4338ca; margin-bottom: 10px;">📊 Summary</h4>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #1f2937;">${filteredApps.length}</div>
                    <div style="color: #64748b; font-size: 0.9rem;">
                        ${selectedAudiences.size === 0 ? 'No Apps (no audiences selected)' : 
                          selectedAudiences.size === allAudiences.length ? 'Total Apps' : 'Filtered Apps'}
                    </div>
                </div>
                <div style="margin-bottom: 15px; color: #64748b; font-size: 0.9rem;">
                    Audience groups are listed per app below showing which specific configuration defines each app's entitlement state.
                </div>
            </div>
            
            <!-- Applications List -->
            <div>
                <h4 style="color: #4338ca; margin-bottom: 15px;">📱 Applications</h4>
                <div class="state-app-simple-list">
        `;

        // Add filtered apps to the list
        filteredApps.forEach(appData => {
            const { appId, app, audiences } = appData;
            const iconUrl = app.largeImageUrl || '';
            const appItemHtml = this.createAppItemHtml(app, appId, iconUrl);
            
            html += `
                <div class="state-app-list-item" onclick="window.appExplorer.showAppModal('${appId}')">
                    <div class="state-app-list-content">
                        <span class="state-app-list-name">
                            ${appItemHtml}
                        </span>
                        <span class="state-app-list-audiences">
                            ${audiences.join(', ')}
                        </span>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        body.innerHTML = html;
    }

    /**
     * Generate content for loaded sources modal
     */
    generateLoadedSourcesContent(urlToAudienceGroups) {
        if (urlToAudienceGroups.size === 0) {
            return `
                <div class="detail-group">
                    <p style="color: #64748b; font-style: italic; text-align: center; padding: 20px;">
                        No sources loaded yet. Load catalog data from the Search Apps tab first.
                    </p>
                </div>
            `;
        }

        // Group sources by type
        const sourcesByType = {
            appDefinitions: [],
            entitlements: [],
            configs: []
        };

        // Categorize URLs by type based on their patterns
        urlToAudienceGroups.forEach((audiences, url) => {
            const audienceList = Array.from(audiences).sort().join(', ');
            
            if (url.includes('catalogConfig')) {
                sourcesByType.configs.push({ url, audiences: audienceList });
            } else if (url.includes('preconfigured_appentitlements')) {
                sourcesByType.entitlements.push({ url, audiences: audienceList });
            } else {
                sourcesByType.appDefinitions.push({ url, audiences: audienceList });
            }
        });

        let html = `
            <!-- Summary -->
            <div class="detail-group">
                <h4>📊 Sources Summary</h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0;">
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #1f2937;">${urlToAudienceGroups.size}</div>
                        <div style="color: #64748b; font-size: 0.9rem;">Total Sources</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #059669;">${sourcesByType.configs.length}</div>
                        <div style="color: #64748b; font-size: 0.9rem;">Config Sources</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #7c3aed;">${sourcesByType.appDefinitions.length}</div>
                        <div style="color: #64748b; font-size: 0.9rem;">App Definition Sources</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #dc2626;">${sourcesByType.entitlements.length}</div>
                        <div style="color: #64748b; font-size: 0.9rem;">Entitlement Sources</div>
                    </div>
                </div>
            </div>
        `;

        // Catalog Configuration Sources
        if (sourcesByType.configs.length > 0) {
            html += `
                <div class="detail-group">
                    <h4>⚙️ Catalog Configuration Sources (${sourcesByType.configs.length})</h4>
                    <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 10px;">
                        These sources contain the main catalog configuration that defines where to find app definitions and entitlements.
                    </div>
            `;
            sourcesByType.configs.forEach(source => {
                html += `
                    <div class="detail-item" style="align-items: flex-start;">
                        <span class="detail-label" style="min-width: 120px;">Audience Groups:</span>
                        <span class="detail-value">
                            <div style="margin-bottom: 5px;"><strong>${source.audiences}</strong></div>
                            <div style="font-family: 'Courier New', monospace; font-size: 0.8rem; color: #4b5563; word-break: break-all;">
                                ${source.url}
                            </div>
                        </span>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // App Definition Sources
        if (sourcesByType.appDefinitions.length > 0) {
            html += `
                <div class="detail-group">
                    <h4>📱 App Definition Sources (${sourcesByType.appDefinitions.length})</h4>
                    <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 10px;">
                        These sources contain the app definitions (store, core, preApproved, override).
                    </div>
            `;
            sourcesByType.appDefinitions.forEach(source => {
                html += `
                    <div class="detail-item" style="align-items: flex-start;">
                        <span class="detail-label" style="min-width: 120px;">Audience Groups:</span>
                        <span class="detail-value">
                            <div style="margin-bottom: 5px;"><strong>${source.audiences}</strong></div>
                            <div style="font-family: 'Courier New', monospace; font-size: 0.8rem; color: #4b5563; word-break: break-all;">
                                ${source.url}
                            </div>
                        </span>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Preconfigured Entitlements Sources
        if (sourcesByType.entitlements.length > 0) {
            html += `
                <div class="detail-group">
                    <h4>🔐 Preconfigured Entitlements Sources (${sourcesByType.entitlements.length})</h4>
                    <div style="font-size: 0.9rem; color: #64748b; margin-bottom: 10px;">
                        These sources contain the preconfigured app entitlements that define what apps are installed/enabled by default.
                    </div>
            `;
            sourcesByType.entitlements.forEach(source => {
                html += `
                    <div class="detail-item" style="align-items: flex-start;">
                        <span class="detail-label" style="min-width: 120px;">Audience Groups:</span>
                        <span class="detail-value">
                            <div style="margin-bottom: 5px;"><strong>${source.audiences}</strong></div>
                            <div style="font-family: 'Courier New', monospace; font-size: 0.8rem; color: #4b5563; word-break: break-all;">
                                ${source.url}
                            </div>
                        </span>
                    </div>
                `;
            });
            html += `</div>`;
        }

        return html;
    }

    /**
     * Refresh the entitlement states display with current filters
     */
    refreshEntitlementStatesDisplay(entitlementStates, globalSelectedAudiences) {
        const resultsElement = document.getElementById('entitlementStatesResults');
        if (!resultsElement) return;

        try {
            if (entitlementStates.size === 0) {
                resultsElement.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #64748b;">
                        <p style="font-size: 1.1rem; margin-bottom: 10px;">No entitlement states to display</p>
                        <p style="font-size: 0.9rem;">
                            ${globalSelectedAudiences.size === 0 ? 
                                'Please select at least one audience group above.' : 
                                'No apps have preconfigured entitlements for the selected audience groups.'}
                        </p>
                    </div>
                `;
                return;
            }

            // Update stats
            this.updateEntitlementStatesStats(entitlementStates);
            
            // Display filtered results
            this.displayEntitlementStates(entitlementStates);
            
        } catch (error) {
            console.error('Error refreshing entitlement states display:', error);
            resultsElement.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <p>Error refreshing entitlement states display</p>
                </div>
            `;
        }
    }

    /**
     * Get app info helper method
     */
    getAppInfo(appId) {
        if (window.appExplorer && typeof window.appExplorer.getAppInfo === 'function') {
            return window.appExplorer.getAppInfo(appId);
        }
        return { name: 'Unknown App', largeImageUrl: '' };
    }

    /**
     * Get app preconfigured entitlements helper method
     */
    getAppPreconfiguredEntitlements(appId) {
        if (window.appExplorer && typeof window.appExplorer.getAppPreconfiguredEntitlements === 'function') {
            return window.appExplorer.getAppPreconfiguredEntitlements(appId);
        }
        return {};
    }
}

// Export to global scope
window.UIRenderer = UIRenderer;
