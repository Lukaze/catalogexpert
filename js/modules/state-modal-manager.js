/**
 * State Modal Manager Module
 * Handles state details modal, state reference modal, and audience filtering
 */
class StateModalManager {
    constructor() {
        this.currentStateDetails = null;
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

        const allAudiences = Array.from(stateData.audiences).sort();

        let html = `
            <!-- Audience Filter Controls -->
            <div style="margin-bottom: 20px;">
                <h4 style="color: #4338ca; margin-bottom: 10px;">🎯 Filter by Audience Groups</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
        `;

        // Add audience filter buttons
        allAudiences.forEach(audience => {
            const shorthand = window.utils.getAudienceGroupShorthand(audience);
            const isSelected = selectedAudiences.has(audience);
            html += `
                <button class="audience-filter-btn ${isSelected ? 'selected' : ''}" 
                        data-audience="${audience}"
                        onclick="window.appExplorer.toggleAudienceFilter('${audience}')">
                    ${shorthand}
                </button>
            `;
        });

        html += `
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
        `;

        // Add filtered apps to the list
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
}

// Make StateModalManager available globally
window.StateModalManager = StateModalManager;
window.stateModalManager = new StateModalManager();
