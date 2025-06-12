/**
 * Modal Manager Module
 * Handles modal display, content generation, and modal-specific interactions
 */
class ModalManager {
    constructor() {
        this.currentStateDetails = null;
    }

    /**
     * Show app details modal
     */
    showAppModal(appId, appDefinitions, dataLoader, uiRenderer, constants) {
        const audienceMap = appDefinitions.get(appId);
        if (!audienceMap) {
            this.showStatus('❌ App not found', 'error');
            return;
        }
        
        const modalContent = this.generateDetailedAppContent(audienceMap, appId, dataLoader, constants);
        const modalBody = document.querySelector('#appModal .modal-body');
        const modalTitle = document.querySelector('#appModal .modal-header h2');
        
        const firstApp = audienceMap.values().next().value;
        if (modalTitle) {
            modalTitle.textContent = firstApp.name || constants.UNKNOWN_APP;
        }
        if (modalBody) {
            modalBody.innerHTML = modalContent;
        }
        
        const modal = document.getElementById('appModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }    /**
     * Generate detailed app content for modal
     */
    generateDetailedAppContent(audienceMap, appId, dataLoader, constants) {
        // Get entitlements in the correct format (grouped by audience)
        const entitlementInfo = this.getAppPreconfiguredEntitlementsGrouped(appId, dataLoader);
        const firstApp = audienceMap.values().next().value;
        
        // Create audience group versions table with source type info
        const audienceVersionsHtml = this.createAudienceVersionsHtml(audienceMap);
        
        return `
            <div class="modal-app-header">
                ${firstApp.largeImageUrl ? `<img src="${firstApp.largeImageUrl}" alt="${firstApp.name}" class="modal-app-icon" onerror="this.style.display='none'">` : ''}
                <div class="modal-app-basic-info">
                    <h4>${window.utils.escapeHtml(firstApp.name || 'Unknown App')}</h4>
                    <p class="app-id-modal">ID: ${appId}</p>
                    <p>Developer: ${window.utils.escapeHtml(firstApp.developerName || 'Unknown')}</p>
                    ${firstApp.description ? `<p class="app-description-modal">${window.utils.escapeHtml(firstApp.description)}</p>` : ''}
                </div>
                <div class="modal-app-stats">
                    <div class="modal-stat">
                        <div class="modal-stat-number">${audienceMap.size}</div>
                        <div class="modal-stat-label">Audience Groups</div>
                    </div>
                    <div class="modal-stat">
                        <div class="modal-stat-number">${Object.keys(entitlementInfo).length}</div>
                        <div class="modal-stat-label">Entitlements</div>
                    </div>
                </div>
            </div>
              <!-- Tab Navigation -->
            <div class="modal-tabs">
                <button class="modal-tab-button active" onclick="window.modalManager.switchModalTab(event, 'overview')">
                    📊 Overview
                </button>
                <button class="modal-tab-button" onclick="window.modalManager.switchModalTab(event, 'versions')">
                    🔄 Versions
                </button>
                <button class="modal-tab-button" onclick="window.modalManager.switchModalTab(event, 'entitlements')">
                    🔐 Entitlements (${Object.keys(entitlementInfo).length})
                </button>
                <button class="modal-tab-button" onclick="window.modalManager.switchModalTab(event, 'definition')">
                    📋 Definition
                </button>
                <button class="modal-tab-button" onclick="window.modalManager.switchModalTab(event, 'technical')">
                    ⚙️ Technical
                </button>
            </div>
            
            <!-- Tab Content -->
            <div class="modal-tab-content">
                <!-- Overview Tab -->
                <div id="modal-tab-overview" class="modal-tab-pane active">
                    <div class="modal-overview-grid">
                        <div class="overview-card">
                            <h5>📱 App Properties</h5>
                            <div class="property-badges">
                                ${firstApp.isCoreApp ? '<span class="property-badge core">Core App</span>' : ''}
                                ${firstApp.isTeamsOwned ? '<span class="property-badge teams">Teams Owned</span>' : ''}
                                ${firstApp.isPinnable ? '<span class="property-badge feature">Pinnable</span>' : ''}
                                ${firstApp.isPreinstallable ? '<span class="property-badge feature">Preinstallable</span>' : ''}
                                ${firstApp.isBlockable ? '<span class="property-badge warning">Blockable</span>' : ''}
                                ${firstApp.isFullTrust ? '<span class="property-badge trust">Full Trust</span>' : ''}
                                ${!firstApp.isCoreApp && !firstApp.isTeamsOwned && !firstApp.isPinnable && !firstApp.isPreinstallable && !firstApp.isBlockable && !firstApp.isFullTrust ? '<span class="property-badge default">Standard App</span>' : ''}
                            </div>
                        </div>
                        
                        <div class="overview-card">
                            <h5>🏷️ Categories & Industries</h5>
                            <div class="tag-container">
                                ${firstApp.categories ? firstApp.categories.map(cat => `<span class="tag category-tag">${cat}</span>`).join('') : '<span class="no-data">No categories</span>'}
                                ${firstApp.industries ? firstApp.industries.map(ind => `<span class="tag industry-tag">${ind}</span>`).join('') : '<span class="no-data">No industries</span>'}
                            </div>
                        </div>
                        
                        ${firstApp.developerUrl ? `
                        <div class="overview-card">
                            <h5>🔗 Developer Links</h5>
                            <a href="${firstApp.developerUrl}" target="_blank" class="developer-link">
                                Visit Developer Website
                                <span class="external-icon">↗</span>
                            </a>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Versions Tab -->
                <div id="modal-tab-versions" class="modal-tab-pane">
                    <div class="versions-container">
                        <h5>📋 Audience Group Versions</h5>
                        <div class="versions-grid">
                            ${this.createVersionsGrid(audienceMap)}
                        </div>
                    </div>
                </div>
                  <!-- Entitlements Tab -->
                <div id="modal-tab-entitlements" class="modal-tab-pane">
                    ${this.renderPreconfiguredEntitlements(entitlementInfo)}
                </div>
                
                <!-- Definition Tab -->
                <div id="modal-tab-definition" class="modal-tab-pane">
                    ${this.renderAppDefinition(audienceMap, appId)}
                </div>
                
                <!-- Technical Tab -->
                <div id="modal-tab-technical" class="modal-tab-pane">
                    <div class="technical-grid">
                        <div class="technical-card">
                            <h5>🔧 Technical Details</h5>
                            <div class="technical-items">
                                <div class="technical-item">
                                    <span class="tech-label">Manifest Version:</span>
                                    <span class="tech-value">${firstApp.manifestVersion || 'N/A'}</span>
                                </div>
                                <div class="technical-item">
                                    <span class="tech-label">Last Updated:</span>
                                    <span class="tech-value">${firstApp.lastUpdatedAt ? new Date(firstApp.lastUpdatedAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div class="technical-item">
                                    <span class="tech-label">Office Asset ID:</span>
                                    <span class="tech-value">${firstApp.officeAssetId || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }    /**
     * Create audience versions HTML for app modal
     */
    createAudienceVersionsHtml(audienceMap) {
        return Array.from(audienceMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([audience, app]) => {
                const shorthand = window.utils.getAudienceGroupShorthand(audience);
                return `
                <div class="detail-item">
                    <span class="detail-label">
                        <span class="audience-bubble" data-audience="${audience.toLowerCase()}">${shorthand}</span>:
                    </span>
                    <span class="detail-value">
                        v${app.version}
                        ${app.sourceType ? `<span class="tag" style="margin-left: 8px; font-size: 0.7rem;">${app.sourceType}</span>` : ''}
                    </span>
                </div>
            `}).join('');
    }    /**
     * Create versions grid for modal
     */
    createVersionsGrid(audienceMap) {
        return Array.from(audienceMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([audience, app]) => {
                const shorthand = window.utils.getAudienceGroupShorthand(audience);
                return `
                <div class="version-card">
                    <div class="version-header">
                        <h6>
                            <span class="audience-bubble" data-audience="${audience.toLowerCase()}">${shorthand}</span>
                        </h6>
                        <span class="version-number">v${app.version}</span>
                    </div>
                    ${app.sourceType ? `<div class="version-source">${app.sourceType}</div>` : ''}
                </div>
            `}).join('');
    }

    /**
     * Switch modal tab
     */
    switchModalTab(event, tabName) {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.modal-tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.modal-tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding pane
        event.target.classList.add('active');
        document.getElementById(`modal-tab-${tabName}`).classList.add('active');
    }    /**
     * Render preconfigured entitlements for app modal
     */
    renderPreconfiguredEntitlements(entitlementInfo) {
        if (Object.keys(entitlementInfo).length === 0) {
            return `
                <div class="entitlements-empty">
                    <div class="empty-state">
                        <div class="empty-icon">🔐</div>
                        <h5>No Preconfigured Entitlements</h5>
                        <p>This app doesn't have any preconfigured entitlement states defined for any audience groups.</p>
                    </div>
                </div>
            `;
        }
        
        let html = `
            <div class="entitlements-container">
                <div class="entitlements-header">
                    <h5>🔐 Preconfigured Entitlements</h5>
                    <div class="entitlements-summary">
                        <span class="summary-item">
                            <strong>${Object.keys(entitlementInfo).length}</strong> audience groups
                        </span>
                        <span class="summary-item">
                            <strong>${Object.values(entitlementInfo).reduce((total, ents) => total + ents.length, 0)}</strong> total entitlements
                        </span>
                    </div>
                </div>
                
                <div class="entitlements-grid">
        `;
          Object.entries(entitlementInfo).forEach(([audience, entitlements]) => {
            const shorthand = window.utils.getAudienceGroupShorthand(audience);
            html += `
                <div class="entitlement-audience-card">
                    <div class="audience-header">
                        <h6>
                            <span class="audience-bubble" data-audience="${audience.toLowerCase()}">${shorthand}</span>
                        </h6>
                        <span class="entitlement-count">${entitlements.length} entitlement${entitlements.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="entitlements-list">
            `;
            
            entitlements.forEach(entitlement => {
                const stateClass = this.getStateClass(entitlement.state);
                const stateIcon = this.getStateIcon(entitlement.state);
                html += `
                    <div class="entitlement-card">
                        <div class="entitlement-main">
                            <div class="entitlement-scope-context">
                                <span class="entitlement-scope">${entitlement.scope}</span>
                                <span class="entitlement-context">${entitlement.context}</span>
                            </div>
                            <div class="entitlement-state-badge ${stateClass}">
                                <span class="state-icon">${stateIcon}</span>
                                <span class="state-text">${entitlement.state}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        return html;
    }    /**
     * Get color for entitlement state
     */
    getStateColor(state) {
        const stateColors = {
            'Available': '#10b981',
            'Blocked': '#ef4444',
            'BlockedByAdmin': '#dc2626',
            'BlockedByUser': '#f59e0b',
            'Pinned': '#3b82f6',
            'Preinstalled': '#8b5cf6'
        };
        return stateColors[state] || '#6b7280';
    }

    /**
     * Get CSS class for entitlement state
     */
    getStateClass(state) {
        const stateClasses = {
            'Installed': 'state-installed',
            'InstalledAndPermanent': 'state-permanent',
            'PreConsented': 'state-preconsented',
            'Featured': 'state-featured',
            'NotInstalled': 'state-not-installed',
            'InstalledAndDeprecated': 'state-deprecated',
            'HiddenFromAppStore': 'state-hidden',
            'Available': 'state-available',
            'Blocked': 'state-blocked',
            'BlockedByAdmin': 'state-blocked-admin',
            'BlockedByUser': 'state-blocked-user',
            'Pinned': 'state-pinned',
            'Preinstalled': 'state-preinstalled'
        };
        return stateClasses[state] || 'state-default';
    }

    /**
     * Get icon for entitlement state
     */
    getStateIcon(state) {
        const stateIcons = {
            'Installed': '🟢',
            'InstalledAndPermanent': '🔒',
            'PreConsented': '✅',
            'Featured': '⭐',
            'NotInstalled': '❌',
            'InstalledAndDeprecated': '⚠️',
            'HiddenFromAppStore': '🚫',
            'Available': '✅',
            'Blocked': '🔴',
            'BlockedByAdmin': '🚫',
            'BlockedByUser': '⛔',
            'Pinned': '📌',
            'Preinstalled': '💜'
        };
        return stateIcons[state] || '❓';
    }

    /**
     * Close app modal
     */
    closeModal() {
        const modal = document.getElementById('appModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    /**
     * Show state reference modal
     */
    showStateReference() {
        const modal = document.getElementById('stateReferenceModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close state reference modal
     */
    closeStateReferenceModal() {
        const modal = document.getElementById('stateReferenceModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Show state details modal with audience group filtering
     */
    showStateDetails(state, analyzeEntitlementStatesUnfiltered, getAppInfo, appEntitlements, globalSelectedAudiences) {
        const modal = document.getElementById('stateDetailsModal');
        const title = document.getElementById('stateDetailsTitle');
        const body = document.getElementById('stateDetailsBody');
        
        if (!modal || !title || !body) return;

        // Get state data (use unfiltered version so modals show all audiences regardless of global filter)
        const entitlementStates = analyzeEntitlementStatesUnfiltered();
        const stateData = entitlementStates.get(state);
        
        if (!stateData) {
            console.error('State data not found for:', state);
            return;
        }

        // Store current state for filtering
        this.currentStateDetails = {
            state: state,
            stateData: stateData,
            selectedAudiences: new Set(
                Array.from(stateData.audiences).filter(audience => 
                    globalSelectedAudiences.has(audience)
                )
            ), // Start with globally selected audiences that are available in this state
            allAppsData: this.buildStateAppsData(state, stateData, getAppInfo, appEntitlements)
        };

        // Update modal title
        title.textContent = `${state}`;

        // Render modal content with filter
        this.renderStateDetailsContent();
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Build apps data for a state with audience information
     */
    buildStateAppsData(state, stateData, getAppInfo, appEntitlements) {
        const appsData = [];
        const appsArray = Array.from(stateData.apps);
        
        appsArray.forEach(appId => {
            const app = getAppInfo(appId);
            
            // Get audience groups for this specific app in this state
            const appAudiences = new Set();
            
            // Check if this app has entitlements
            if (appEntitlements.has(appId)) {
                const appEntitlementMap = appEntitlements.get(appId);
                
                // Go through each entitlement for this app
                for (const [entitlementKey, entitlement] of appEntitlementMap.entries()) {
                    // Check if this entitlement matches the current state
                    if (entitlement.state === state) {
                        // Extract audience group from the entitlement key format: "audienceGroup.scope.context"
                        const [audienceGroup] = entitlementKey.split('.');
                        appAudiences.add(audienceGroup);
                    }
                }
            }
            
            appsData.push({
                appId: appId,
                app: app,
                audiences: Array.from(appAudiences).sort()
            });
        });
        
        return appsData;
    }

    /**
     * Render the state details content with current filters
     */
    renderStateDetailsContent() {
        const body = document.getElementById('stateDetailsBody');
        const title = document.getElementById('stateDetailsTitle');
        const { state, stateData, selectedAudiences, allAppsData } = this.currentStateDetails;

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
        `;        // Add filter buttons for each audience group
        allAudiences.forEach(audience => {
            const isSelected = selectedAudiences.has(audience);
            const selectedClass = isSelected ? 'selected' : '';
            const shorthand = window.utils.getAudienceGroupShorthand(audience);
            html += `
                <button class="audience-filter-btn ${selectedClass}" 
                        data-audience="${audience.toLowerCase()}"
                        onclick="window.appExplorer.toggleAudienceFilter('${audience}')">
                    ${shorthand}
                </button>
            `;
        });        html += `
                </div>
                <div style="margin-top: 10px; font-size: 0.8rem; color: #64748b;">
                    ${selectedAudiences.size === 0 ? 'No audience groups selected (showing no apps)' : 
                      selectedAudiences.size === allAudiences.length ? 'Showing all audience groups' : 
                      `Filtering by: ${Array.from(selectedAudiences).map(audience => window.utils.getAudienceGroupShorthand(audience)).join(', ')}`}
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
        `;        // Add filtered apps to the list
        filteredApps.forEach(appData => {
            const { appId, app, audiences } = appData;
            const iconUrl = app.largeImageUrl || '';
            const appItemHtml = window.utils.createAppItemHtml(app, appId, iconUrl);
            const audienceShorthands = audiences.map(audience => 
                window.utils.getAudienceGroupShorthand(audience)
            );
            
            html += `
                <div class="state-app-list-item" onclick="window.appExplorer.showAppModal('${appId}')">
                    <div class="state-app-list-content">
                        <span class="state-app-list-name">
                            ${appItemHtml}
                        </span>
                        <span class="state-app-list-audiences">
                            ${audienceShorthands.join(', ')}
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
     * Toggle audience group filter in state details modal
     */
    toggleAudienceFilter(audience, globalSelectedAudiences, renderGlobalAudienceFilter, refreshEntitlementStatesDisplay) {
        if (this.currentStateDetails.selectedAudiences.has(audience)) {
            this.currentStateDetails.selectedAudiences.delete(audience);
            // Also remove from global filter
            globalSelectedAudiences.delete(audience);
        } else {
            this.currentStateDetails.selectedAudiences.add(audience);
            // Also add to global filter
            globalSelectedAudiences.add(audience);
        }
        
        // Update the modal content
        this.renderStateDetailsContent();
        
        // Update the global filter UI and refresh main display
        renderGlobalAudienceFilter();
        refreshEntitlementStatesDisplay();
    }

    /**
     * Clear all audience filters (reset to show all)
     */
    clearAudienceFilters(globalSelectedAudiences, renderGlobalAudienceFilter, refreshEntitlementStatesDisplay) {
        // Reset modal selection to all audiences in this state
        this.currentStateDetails.selectedAudiences = new Set(this.currentStateDetails.stateData.audiences);
        
        // Also add all these audiences to the global filter
        this.currentStateDetails.stateData.audiences.forEach(audience => {
            globalSelectedAudiences.add(audience);
        });
        
        // Update modal content
        this.renderStateDetailsContent();
        
        // Update global filter UI and refresh main display
        renderGlobalAudienceFilter();
        refreshEntitlementStatesDisplay();
    }

    /**
     * Close state details modal
     */
    closeStateDetailsModal() {
        const modal = document.getElementById('stateDetailsModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Show loaded sources modal
     */
    showLoadedSourcesModal(uiRenderer, urlToAudienceGroups) {
        const modal = document.getElementById('loadedSourcesModal');
        const content = document.getElementById('loadedSourcesContent');
        
        if (!modal || !content) return;
        
        // Generate the content for loaded sources
        const sourcesHtml = uiRenderer.generateLoadedSourcesContent(urlToAudienceGroups);
        content.innerHTML = sourcesHtml;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close loaded sources modal
     */
    closeLoadedSourcesModal() {
        const modal = document.getElementById('loadedSourcesModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        this.closeModal();
        this.closeStateReferenceModal();
        this.closeStateDetailsModal();
        this.closeLoadedSourcesModal();
    }

    /**
     * Get app preconfigured entitlements grouped by audience
     */
    getAppPreconfiguredEntitlementsGrouped(appId, dataLoader) {
        const rawEntitlements = dataLoader.getAppPreconfiguredEntitlements(appId);
        const audienceEntitlements = {};
        
        // Convert from { "audienceGroup.scope.context": entitlement } 
        // to { "audienceGroup": [entitlement1, entitlement2] }
        for (const [key, entitlement] of Object.entries(rawEntitlements)) {
            // Extract audience group from key format: "audienceGroup.scope.context"
            const [audienceGroup, scope, context] = key.split('.');
            
            if (!audienceEntitlements[audienceGroup]) {
                audienceEntitlements[audienceGroup] = [];
            }
            
            // Add scope and context to the entitlement object for display
            const entitlementWithContext = {
                ...entitlement,
                scope: scope,
                context: context
            };
            
            audienceEntitlements[audienceGroup].push(entitlementWithContext);
        }
        
        return audienceEntitlements;
    }
    
    /**
     * Render app definition for modal
     */
    renderAppDefinition(audienceMap, appId) {
        if (!audienceMap || audienceMap.size === 0) {
            return `
                <div class="definition-empty">
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <h5>No App Definition Available</h5>
                        <p>No app definition data found for this application.</p>
                    </div>
                </div>
            `;
        }

        // Get all unique audiences and their app data
        const audienceEntries = Array.from(audienceMap.entries()).sort(([a], [b]) => a.localeCompare(b));
        
        let html = `
            <div class="definition-container">
                <div class="definition-header">
                    <h5>📋 Complete App Definition</h5>
                    <div class="definition-summary">
                        <span class="summary-item">
                            <strong>${audienceEntries.length}</strong> audience group${audienceEntries.length !== 1 ? 's' : ''}
                        </span>
                        <span class="summary-item">
                            App ID: <strong>${appId}</strong>
                        </span>
                    </div>
                </div>
                
                <div class="definition-grid">
        `;

        // Create a definition card for each audience group
        audienceEntries.forEach(([audience, app]) => {
            const shorthand = window.utils.getAudienceGroupShorthand(audience);
            
            html += `
                <div class="definition-audience-card">
                    <div class="audience-header">
                        <h6>
                            <span class="audience-bubble" data-audience="${audience.toLowerCase()}">${shorthand}</span>
                            ${audience}
                        </h6>
                        ${app.sourceType ? `<span class="source-badge">${app.sourceType}</span>` : ''}
                    </div>
                    
                    <div class="definition-content">
                        ${this.renderAppProperties(app, appId)}
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * Render app properties in a readable format
     */
    renderAppProperties(app, appId) {
        const properties = [
            { label: 'App ID', value: appId, type: 'code' },
            { label: 'Name', value: app.name, type: 'text' },
            { label: 'Version', value: app.version, type: 'version' },
            { label: 'Developer Name', value: app.developerName, type: 'text' },
            { label: 'Developer URL', value: app.developerUrl, type: 'url' },
            { label: 'Description', value: app.description, type: 'description' },
            { label: 'Manifest Version', value: app.manifestVersion, type: 'text' },
            { label: 'Office Asset ID', value: app.officeAssetId, type: 'code' },
            { label: 'Large Image URL', value: app.largeImageUrl, type: 'url' },
            { label: 'Last Updated', value: app.lastUpdatedAt, type: 'date' },
            { label: 'Source Type', value: app.sourceType, type: 'badge' },
            { label: 'Audience Group', value: app.audienceGroup, type: 'text' },
            { label: 'Core App', value: app.isCoreApp, type: 'boolean' },
            { label: 'Teams Owned', value: app.isTeamsOwned, type: 'boolean' },
            { label: 'Pinnable', value: app.isPinnable, type: 'boolean' },
            { label: 'Preinstallable', value: app.isPreinstallable, type: 'boolean' },
            { label: 'Blockable', value: app.isBlockable, type: 'boolean' },
            { label: 'Full Trust', value: app.isFullTrust, type: 'boolean' },
            { label: 'Categories', value: app.categories, type: 'array' },
            { label: 'Industries', value: app.industries, type: 'array' }
        ];

        let html = '<div class="definition-properties">';

        properties.forEach(prop => {
            if (prop.value !== undefined && prop.value !== null && prop.value !== '') {
                html += `<div class="definition-property">`;
                html += `<span class="property-label">${prop.label}:</span>`;
                html += `<span class="property-value ${prop.type}">${this.formatPropertyValue(prop.value, prop.type)}</span>`;
                html += `</div>`;
            }
        });

        // Add any additional properties that might exist in the app object
        const knownProperties = new Set([
            'id', 'name', 'version', 'developerName', 'developerUrl', 'description', 
            'manifestVersion', 'officeAssetId', 'largeImageUrl', 'lastUpdatedAt', 
            'sourceType', 'audienceGroup', 'isCoreApp', 'isTeamsOwned', 'isPinnable', 
            'isPreinstallable', 'isBlockable', 'isFullTrust', 'categories', 'industries'
        ]);

        Object.keys(app).forEach(key => {
            if (!knownProperties.has(key) && app[key] !== undefined && app[key] !== null && app[key] !== '') {
                html += `<div class="definition-property">`;
                html += `<span class="property-label">${key}:</span>`;
                html += `<span class="property-value other">${this.formatPropertyValue(app[key], 'other')}</span>`;
                html += `</div>`;
            }
        });

        html += '</div>';
        return html;
    }

    /**
     * Format property values based on their type
     */
    formatPropertyValue(value, type) {
        if (value === undefined || value === null) {
            return '<span class="property-empty">N/A</span>';
        }

        switch (type) {
            case 'boolean':
                return value ? '<span class="property-true">✅ Yes</span>' : '<span class="property-false">❌ No</span>';
            
            case 'date':
                return value ? new Date(value).toLocaleString() : '<span class="property-empty">N/A</span>';
            
            case 'url':
                return value ? `<a href="${window.utils.escapeHtml(value)}" target="_blank" class="property-link">${window.utils.escapeHtml(value)} ↗</a>` : '<span class="property-empty">N/A</span>';
            
            case 'code':
                return `<code class="property-code">${window.utils.escapeHtml(value)}</code>`;
            
            case 'version':
                return `<span class="property-version">v${window.utils.escapeHtml(value)}</span>`;
            
            case 'badge':
                return `<span class="property-badge">${window.utils.escapeHtml(value)}</span>`;
            
            case 'array':
                if (Array.isArray(value) && value.length > 0) {
                    return value.map(item => `<span class="property-tag">${window.utils.escapeHtml(item)}</span>`).join('');
                }
                return '<span class="property-empty">None</span>';
            
            case 'description':
                return value ? `<span class="property-description">${window.utils.escapeHtml(value)}</span>` : '<span class="property-empty">N/A</span>';
            
            case 'other':
                if (typeof value === 'object') {
                    return `<pre class="property-json">${JSON.stringify(value, null, 2)}</pre>`;
                }
                return window.utils.escapeHtml(String(value));
            
            default:
                return window.utils.escapeHtml(String(value));
        }
    }

    // ...existing code...
}

// Make ModalManager available globally
window.ModalManager = ModalManager;
window.modalManager = new ModalManager();
