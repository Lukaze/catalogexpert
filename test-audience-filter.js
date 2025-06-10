// Debug script to check audience filter initialization
console.log('🔍 Debug: Checking audience filter initialization...');

// Wait for app to load
setTimeout(() => {
    console.log('🔍 Debug: Checking after 2 seconds...');
    
    // Check if app explorer exists
    if (window.appExplorer) {
        console.log('✅ App explorer exists');
        console.log('📊 App definitions size:', window.appExplorer.appDefinitions.size);
        console.log('🎯 Audience groups size:', window.appExplorer.audienceGroups.size);
        console.log('🔍 Search selected audiences size:', window.appExplorer.searchSelectedAudiences.size);
        
        // Check if filter element exists
        const filterElement = document.getElementById('searchAudienceFilter');
        console.log('🎨 Filter element exists:', !!filterElement);
        console.log('👁️ Filter element visible:', filterElement ? filterElement.style.display : 'N/A');
        
        // Check if filter buttons exist
        const filterButtons = document.getElementById('searchAudienceFilterButtons');
        console.log('🔘 Filter buttons exists:', !!filterButtons);
        console.log('📝 Filter buttons content:', filterButtons ? filterButtons.innerHTML.length : 'N/A');
        
    } else {
        console.log('❌ App explorer not found');
    }
}, 2000);

// Also check after a longer delay to see if it's a timing issue
setTimeout(() => {
    console.log('🔍 Debug: Checking after 5 seconds...');
    
    if (window.appExplorer) {
        console.log('📊 App definitions size:', window.appExplorer.appDefinitions.size);
        console.log('🎯 Audience groups size:', window.appExplorer.audienceGroups.size);
        
        const filterElement = document.getElementById('searchAudienceFilter');
        console.log('👁️ Filter element visible:', filterElement ? filterElement.style.display : 'N/A');
        
        // Force initialization if needed
        if (window.appExplorer.appDefinitions.size > 0 && (!filterElement || filterElement.style.display === 'none')) {
            console.log('🔧 Forcing search tab initialization...');
            window.appExplorer.initializeSearchTab();
        }
    }
}, 5000);
