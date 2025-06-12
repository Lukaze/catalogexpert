/**
 * Core Modal Manager Module
 * Handles basic modal operations, coordination between modules, and state management
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
        
        const modalContent = window.appModalRenderer.generateDetailedAppContent(audienceMap, appId, dataLoader, constants);
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
     * Switch modal tab
     */
    switchModalTab(event, tabName) {
        // Remove active class from all tabs and panes
        document.querySelectorAll('.modal-tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.modal-tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding pane
        event.target.classList.add('active');
        document.getElementById(`modal-tab-${tabName}`).classList.add('active');
    }

    /**
     * Show status message (utility method)
     */
    showStatus(message, type) {
        // This would be implemented by the main app
        console.log(`Status [${type}]: ${message}`);
    }

    /**
     * Show state reference modal
     */
    showStateReference() {
        return window.stateModalManager.showStateReference();
    }

    /**
     * Close state reference modal
     */
    closeStateReferenceModal() {
        return window.stateModalManager.closeStateReferenceModal();
    }

    /**
     * Show state details modal with audience group filtering
     */
    showStateDetails(state, analyzeEntitlementStatesUnfiltered, getAppInfo, appEntitlements, globalSelectedAudiences) {
        return window.stateModalManager.showStateDetails(state, analyzeEntitlementStatesUnfiltered, getAppInfo, appEntitlements, globalSelectedAudiences);
    }

    /**
     * Close state details modal
     */
    closeStateDetailsModal() {
        return window.stateModalManager.closeStateDetailsModal();
    }

    /**
     * Toggle audience group filter in state details modal
     */
    toggleAudienceFilter(audience, globalSelectedAudiences, renderGlobalAudienceFilter, refreshEntitlementStatesDisplay) {
        return window.stateModalManager.toggleAudienceFilter(audience, globalSelectedAudiences, renderGlobalAudienceFilter, refreshEntitlementStatesDisplay);
    }

    /**
     * Clear all audience filters (reset to show all)
     */
    clearAudienceFilters(globalSelectedAudiences, renderGlobalAudienceFilter, refreshEntitlementStatesDisplay) {
        return window.stateModalManager.clearAudienceFilters(globalSelectedAudiences, renderGlobalAudienceFilter, refreshEntitlementStatesDisplay);
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
     * Get color for entitlement state
     */
    getStateColor(state) {
        const stateColors = {
            'Installed': '#10b981',
            'InstalledAndPermanent': '#8b5cf6',
            'PreConsented': '#06b6d4',
            'Featured': '#f59e0b',
            'NotInstalled': '#ef4444',
            'InstalledAndDeprecated': '#f97316',
            'HiddenFromAppStore': '#6b7280',
            'Available': '#10b981',
            'Blocked': '#dc2626',
            'BlockedByAdmin': '#991b1b',
            'BlockedByUser': '#b91c1c',
            'Pinned': '#3b82f6',
            'Preinstalled': '#7c3aed'
        };
        return stateColors[state] || '#64748b';
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
}

// Make ModalManager available globally
window.ModalManager = ModalManager;
window.modalManager = new ModalManager();
