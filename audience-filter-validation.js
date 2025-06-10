/**
 * Search Apps Audience Filter - Functionality Validation
 * This script validates that the audience filter is properly working on the Search Apps tab
 */

// Validation function to run after page loads
function validateSearchAudienceFilter() {
    console.log('🧪 Validating Search Apps Audience Filter...');
    
    const results = {
        appExplorerExists: false,
        dataLoaded: false,
        audienceGroupsPopulated: false,
        searchAudiencesInitialized: false,
        filterElementExists: false,
        filterVisible: false,
        filterRendered: false
    };
    
    // Check if app explorer exists
    if (window.appExplorer) {
        results.appExplorerExists = true;
        
        // Check if data is loaded
        if (window.appExplorer.appDefinitions.size > 0) {
            results.dataLoaded = true;
        }
        
        // Check if audience groups are populated
        if (window.appExplorer.audienceGroups.size > 0) {
            results.audienceGroupsPopulated = true;
        }
        
        // Check if search audiences are initialized
        if (window.appExplorer.searchSelectedAudiences.size > 0) {
            results.searchAudiencesInitialized = true;
        }
    }
    
    // Check if filter DOM elements exist
    const filterElement = document.getElementById('searchAudienceFilter');
    if (filterElement) {
        results.filterElementExists = true;
        
        // Check if filter is visible
        if (filterElement.style.display !== 'none') {
            results.filterVisible = true;
        }
        
        // Check if filter has been rendered with content
        const filterButtons = document.getElementById('searchAudienceFilterButtons');
        if (filterButtons && filterButtons.innerHTML.length > 0) {
            results.filterRendered = true;
        }
    }
    
    // Log results
    console.log('📊 Validation Results:');
    Object.entries(results).forEach(([key, value]) => {
        const icon = value ? '✅' : '❌';
        console.log(`${icon} ${key}: ${value}`);
    });
    
    // Overall result
    const allPassed = Object.values(results).every(result => result === true);
    console.log(`\n🏆 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return results;
}

// Run validation after page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to initialize and data to load
    setTimeout(() => {
        validateSearchAudienceFilter();
    }, 3000);
    
    // Run again after longer delay for slow loading
    setTimeout(() => {
        console.log('\n🔄 Running validation again after 8 seconds...');
        validateSearchAudienceFilter();
    }, 8000);
});

// Export for manual testing
window.validateSearchAudienceFilter = validateSearchAudienceFilter;
