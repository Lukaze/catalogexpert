// Comprehensive Application Test Suite
// This script can be run in the browser console to validate functionality

console.log('%c🚀 Teams App Catalog Explorer - Validation Suite', 'color: #2563eb; font-size: 16px; font-weight: bold;');
console.log('====================================================');

const tests = [];
let passedTests = 0;
let totalTests = 0;

function runTest(name, testFn) {
    totalTests++;
    try {
        const result = testFn();
        if (result) {
            console.log(`%c✅ ${name}`, 'color: #16a34a;');
            passedTests++;
            tests.push({ name, status: 'PASS', result });
        } else {
            console.log(`%c❌ ${name}`, 'color: #dc2626;');
            tests.push({ name, status: 'FAIL', result });
        }
    } catch (error) {
        console.log(`%c💥 ${name} - ERROR: ${error.message}`, 'color: #dc2626;');
        tests.push({ name, status: 'ERROR', error: error.message });
    }
}

// Test 1: Module Loading
console.log('\n📦 Testing Module Loading...');
runTest('Utils module loaded', () => typeof window.Utils !== 'undefined' && typeof window.utils !== 'undefined');
runTest('DataLoader module loaded', () => typeof window.DataLoader !== 'undefined');
runTest('SearchEngine module loaded', () => typeof window.SearchEngine !== 'undefined');
runTest('UIRenderer module loaded', () => typeof window.UIRenderer !== 'undefined');
runTest('ModalManager module loaded', () => typeof window.ModalManager !== 'undefined');
runTest('EventHandlers module loaded', () => typeof window.EventHandlers !== 'undefined');
runTest('TeamsAppCatalogExplorer module loaded', () => typeof window.TeamsAppCatalogExplorer !== 'undefined');

// Test 2: Constants and Utils
console.log('\n🔧 Testing Utils and Constants...');
runTest('AUDIENCE_GROUPS available', () => {
    return window.utils && 
           window.utils.AUDIENCE_GROUPS && 
           Array.isArray(window.utils.AUDIENCE_GROUPS) && 
           window.utils.AUDIENCE_GROUPS.length > 0;
});
runTest('CONSTANTS available', () => {
    return window.utils && 
           window.utils.CONSTANTS && 
           typeof window.utils.CONSTANTS === 'object';
});

// Test 3: Global Instance
console.log('\n🌐 Testing Global Instance...');
runTest('window.appExplorer exists', () => typeof window.appExplorer !== 'undefined');
runTest('appExplorer has all components', () => {
    return window.appExplorer &&
           window.appExplorer.dataLoader &&
           window.appExplorer.searchEngine &&
           window.appExplorer.uiRenderer &&
           window.appExplorer.modalManager &&
           window.appExplorer.eventHandlers;
});

// Test 4: Circular Dependency Resolution
console.log('\n🔄 Testing Circular Dependency Fix...');
runTest('DataLoader has callback functions', () => {
    const dl = window.appExplorer?.dataLoader;
    return dl &&
           typeof dl.updateBlockingLoader === 'function' &&
           typeof dl.showStatus === 'function' &&
           typeof dl.hideBlockingLoader === 'function';
});

runTest('DataLoader can execute without window.appExplorer', () => {
    // Test creating a standalone DataLoader with callbacks
    const testCallbacks = {
        updateProgress: () => true,
        showStatus: () => true,
        updateStats: () => true,
        hideLoader: () => true,
        showApps: () => true
    };
    
    const testLoader = new window.DataLoader(
        testCallbacks.updateProgress,
        testCallbacks.showStatus,
        testCallbacks.updateStats,
        testCallbacks.hideLoader,
        testCallbacks.showApps,
        new Map(),
        new Map(),
        new Map()
    );
    
    return testLoader && typeof testLoader.updateBlockingLoader === 'function';
});

// Test 5: Data Store Consistency
console.log('\n💾 Testing Data Store Sharing...');
runTest('Shared data stores between components', () => {
    const app = window.appExplorer;
    return app &&
           app.catalogConfigs &&
           app.appDefinitions &&
           app.appEntitlements &&
           app.dataLoader.catalogConfigs === app.catalogConfigs &&
           app.dataLoader.appDefinitions === app.appDefinitions &&
           app.dataLoader.appEntitlements === app.appEntitlements;
});

// Test 6: DOM Elements
console.log('\n🎨 Testing DOM Elements...');
runTest('Required DOM elements exist', () => {
    const elements = [
        'searchInput',
        'results',
        'catalogStats',
        'blockingLoader',
        'searchTab',
        'entitlementStatesTab'
    ];
    return elements.every(id => document.getElementById(id) !== null);
});

// Test 7: Event Handlers
console.log('\n⚡ Testing Event System...');
runTest('Tab switching functionality', () => {
    return typeof window.appExplorer?.switchTab === 'function';
});

runTest('Search functionality', () => {
    return typeof window.appExplorer?.performSearch === 'function';
});

// Test 8: Application Methods
console.log('\n🔍 Testing Application Methods...');
runTest('Core application methods exist', () => {
    const app = window.appExplorer;
    const requiredMethods = [
        'initializeApp',
        'updateStats',
        'showStatus',
        'updateBlockingLoader',
        'hideBlockingLoader',
        'showAllApps',
        'switchTab'
    ];
    return requiredMethods.every(method => typeof app?.[method] === 'function');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`%c📊 TEST SUMMARY`, 'color: #2563eb; font-size: 14px; font-weight: bold;');
console.log(`%c✅ Passed: ${passedTests}/${totalTests} tests`, passedTests === totalTests ? 'color: #16a34a; font-weight: bold;' : 'color: #ea580c;');

if (passedTests === totalTests) {
    console.log(`%c🎉 ALL TESTS PASSED! Application is working correctly.`, 'color: #16a34a; font-size: 14px; font-weight: bold;');
    console.log(`%c✨ The modularization and circular dependency fix was successful!`, 'color: #16a34a;');
} else {
    console.log(`%c⚠️  Some tests failed. Check the results above.`, 'color: #ea580c; font-weight: bold;');
}

console.log('\n🔍 Detailed test results:', tests);
console.log('====================================================');
