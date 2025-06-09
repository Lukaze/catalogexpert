/**
 * Event Handlers Module
 * Manages all event listeners and user interactions for the Teams App Catalog Explorer
 */
class EventHandlers {
    constructor() {
        this.searchTimeout = null;
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners(appExplorer) {
        this.initializeSearchEvents(appExplorer);
        this.initializeModalEvents(appExplorer);
        this.initializeKeyboardEvents(appExplorer);
    }

    /**
     * Initialize search-related event listeners
     */
    initializeSearchEvents(appExplorer) {
        const searchInput = document.getElementById('searchInput');
        
        if (searchInput) {
            // Add real-time search filtering (as you type)
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value, appExplorer);
            });
        }
    }

    /**
     * Initialize modal-related event listeners
     */
    initializeModalEvents(appExplorer) {
        // App Modal
        this.initializeAppModalEvents(appExplorer);
        
        // State Reference Modal
        this.initializeStateReferenceModalEvents(appExplorer);
        
        // State Details Modal
        this.initializeStateDetailsModalEvents(appExplorer);
        
        // Loaded Sources Modal
        this.initializeLoadedSourcesModalEvents(appExplorer);
    }

    /**
     * Initialize app modal event listeners
     */
    initializeAppModalEvents(appExplorer) {
        const closeModal = document.getElementById('closeModal');
        const modal = document.getElementById('appModal');

        if (closeModal) {
            closeModal.addEventListener('click', () => appExplorer.modalManager.closeModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    appExplorer.modalManager.closeModal();
                }
            });
        }
    }

    /**
     * Initialize state reference modal event listeners
     */
    initializeStateReferenceModalEvents(appExplorer) {
        const closeStateReferenceModal = document.getElementById('closeStateReferenceModal');
        const stateReferenceModal = document.getElementById('stateReferenceModal');

        if (closeStateReferenceModal) {
            closeStateReferenceModal.addEventListener('click', () => appExplorer.modalManager.closeStateReferenceModal());
        }
        
        if (stateReferenceModal) {
            stateReferenceModal.addEventListener('click', (e) => {
                if (e.target === stateReferenceModal) {
                    appExplorer.modalManager.closeStateReferenceModal();
                }
            });
        }
    }

    /**
     * Initialize state details modal event listeners
     */
    initializeStateDetailsModalEvents(appExplorer) {
        const closeStateDetailsModal = document.getElementById('closeStateDetailsModal');
        const stateDetailsModal = document.getElementById('stateDetailsModal');

        if (closeStateDetailsModal) {
            closeStateDetailsModal.addEventListener('click', () => appExplorer.modalManager.closeStateDetailsModal());
        }
        
        if (stateDetailsModal) {
            stateDetailsModal.addEventListener('click', (e) => {
                if (e.target === stateDetailsModal) {
                    appExplorer.modalManager.closeStateDetailsModal();
                }
            });
        }
    }

    /**
     * Initialize loaded sources modal event listeners
     */
    initializeLoadedSourcesModalEvents(appExplorer) {
        const closeLoadedSourcesModal = document.getElementById('closeLoadedSourcesModal');
        const loadedSourcesModal = document.getElementById('loadedSourcesModal');

        if (closeLoadedSourcesModal) {
            closeLoadedSourcesModal.addEventListener('click', () => appExplorer.modalManager.closeLoadedSourcesModal());
        }
        
        if (loadedSourcesModal) {
            loadedSourcesModal.addEventListener('click', (e) => {
                if (e.target === loadedSourcesModal) {
                    appExplorer.modalManager.closeLoadedSourcesModal();
                }
            });
        }
    }

    /**
     * Initialize keyboard event listeners
     */
    initializeKeyboardEvents(appExplorer) {
        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                appExplorer.modalManager.closeAllModals();
            }
        });
    }

    /**
     * Handle search input with debouncing
     */
    handleSearchInput(query, appExplorer) {
        // Clear existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Set new timeout for debounced search
        this.searchTimeout = setTimeout(() => {
            appExplorer.searchEngine.handleSearchInput(query);
        }, 300); // 300ms debounce
    }    /**
     * Tab switching functionality
     */
    switchTab(tabName) {
        // Hide all tab contents
        document.getElementById('searchTabContent').classList.remove('active');
        document.getElementById('entitlementStatesTabContent').classList.remove('active');
        
        // Remove active class from all tab buttons
        document.getElementById('searchTab').classList.remove('active');
        document.getElementById('entitlementStatesTab').classList.remove('active');
        
        // Get the results section (used by search tab)
        const resultsSection = document.querySelector('.results-section');
        
        // Show selected tab content and activate button
        if (tabName === 'search') {
            document.getElementById('searchTabContent').classList.add('active');
            document.getElementById('searchTab').classList.add('active');
            // Show results section for search tab
            if (resultsSection) {
                resultsSection.style.display = 'block';
            }
        } else if (tabName === 'entitlementStates') {
            document.getElementById('entitlementStatesTabContent').classList.add('active');
            document.getElementById('entitlementStatesTab').classList.add('active');
            // Hide results section for entitlement states tab
            if (resultsSection) {
                resultsSection.style.display = 'none';
            }
        }
    }

    /**
     * Handle global audience filter selection for Entitlement States tab
     */
    toggleGlobalAudienceFilter(audience, appExplorer) {
        if (appExplorer.globalSelectedAudiences.has(audience)) {
            appExplorer.globalSelectedAudiences.delete(audience);
        } else {
            appExplorer.globalSelectedAudiences.add(audience);
        }
        
        // Update the filter UI and refresh display
        appExplorer.uiRenderer.renderGlobalAudienceFilter(
            appExplorer.audienceGroups, 
            appExplorer.globalSelectedAudiences
        );
        appExplorer.refreshEntitlementStatesDisplay();
    }

    /**
     * Select all global audience filters
     */
    selectAllGlobalAudiences(appExplorer) {
        appExplorer.audienceGroups.forEach(audience => {
            appExplorer.globalSelectedAudiences.add(audience);
        });
        
        // Update the filter UI and refresh display
        appExplorer.uiRenderer.renderGlobalAudienceFilter(
            appExplorer.audienceGroups, 
            appExplorer.globalSelectedAudiences
        );
        appExplorer.refreshEntitlementStatesDisplay();
    }

    /**
     * Clear all global audience filters
     */
    clearAllGlobalAudiences(appExplorer) {
        appExplorer.globalSelectedAudiences.clear();
        
        // Update the filter UI and refresh display
        appExplorer.uiRenderer.renderGlobalAudienceFilter(
            appExplorer.audienceGroups, 
            appExplorer.globalSelectedAudiences
        );
        appExplorer.refreshEntitlementStatesDisplay();
    }

    /**
     * Handle app card click to show modal
     */
    handleAppCardClick(appId, appExplorer) {
        appExplorer.modalManager.showAppModal(
            appId, 
            appExplorer.appDefinitions, 
            appExplorer.dataLoader, 
            appExplorer.uiRenderer, 
            appExplorer.constants
        );
    }

    /**
     * Handle state button click to show state details
     */
    handleStateClick(state, appExplorer) {
        appExplorer.modalManager.showStateDetails(
            state,
            () => appExplorer.analyzeEntitlementStatesUnfiltered(),
            (appId) => appExplorer.getAppInfo(appId),
            appExplorer.appEntitlements,
            appExplorer.globalSelectedAudiences
        );
    }

    /**
     * Handle state reference button click
     */
    handleStateReferenceClick(appExplorer) {
        appExplorer.modalManager.showStateReference();
    }

    /**
     * Handle loaded sources button click
     */
    handleLoadedSourcesClick(appExplorer) {
        appExplorer.modalManager.showLoadedSourcesModal(
            appExplorer.uiRenderer,
            appExplorer.dataLoader.urlToAudienceGroups
        );
    }

    /**
     * Handle audience filter toggle in state details modal
     */
    handleAudienceFilterToggle(audience, appExplorer) {
        appExplorer.modalManager.toggleAudienceFilter(
            audience,
            appExplorer.globalSelectedAudiences,
            () => appExplorer.uiRenderer.renderGlobalAudienceFilter(
                appExplorer.audienceGroups, 
                appExplorer.globalSelectedAudiences
            ),
            () => appExplorer.refreshEntitlementStatesDisplay()
        );
    }

    /**
     * Handle clear audience filters in state details modal
     */
    handleClearAudienceFilters(appExplorer) {
        appExplorer.modalManager.clearAudienceFilters(
            appExplorer.globalSelectedAudiences,
            () => appExplorer.uiRenderer.renderGlobalAudienceFilter(
                appExplorer.audienceGroups, 
                appExplorer.globalSelectedAudiences
            ),
            () => appExplorer.refreshEntitlementStatesDisplay()
        );
    }

    /**
     * Handle loading catalog configuration
     */
    handleLoadCatalogConfig(appExplorer) {
        appExplorer.dataLoader.loadAllCatalogConfigurations();
    }

    /**
     * Handle status message display
     */
    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status ${type}`;
            
            // Auto-hide after 3 seconds for non-error messages
            if (type !== 'error') {
                setTimeout(() => {
                    statusElement.textContent = '';
                    statusElement.className = 'status';
                }, 3000);
            }
        }
    }    /**
     * Handle blocking loader display
     */
    updateBlockingLoader(message, progressPercent = 0) {
        const blockingLoader = document.getElementById('blockingLoader');
        const loaderMessage = document.getElementById('loaderMessage');
        const loaderProgressBar = document.getElementById('loaderProgressBar');
        
        if (loaderMessage) {
            loaderMessage.textContent = message;
        }
        
        if (loaderProgressBar) {
            loaderProgressBar.style.width = `${progressPercent}%`;
        }
        
        if (blockingLoader) {
            if (progressPercent === 0) {
                blockingLoader.style.display = 'flex';
            } else if (progressPercent >= 100) {
                // Add fade-out animation
                blockingLoader.style.opacity = '0';
                blockingLoader.style.transition = 'opacity 0.5s ease-out';
                
                setTimeout(() => {
                    blockingLoader.style.display = 'none';
                    blockingLoader.style.opacity = '1';
                    blockingLoader.style.transition = '';
                }, 500);
            }
        }
    }
}

// Make EventHandlers available globally
window.EventHandlers = EventHandlers;
