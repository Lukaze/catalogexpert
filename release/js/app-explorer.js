class TeamsAppCatalogExplorer{constructor(){this.catalogConfigs=new Map();this.appDefinitions=new Map();this.appEntitlements=new Map();this.loadedSources=0;this.totalSources=0;this.isLoading=false;this.constants=window.utils.CONSTANTS;this.globalSelectedAudiences=new Set();this.searchSelectedAudiences=new Set();this.dataLoader=new window.DataLoader((message,progress)=> this.updateBlockingLoader(message,progress),(message,type)=> this.showStatus(message,type),()=> this.updateStats(),()=> this.hideBlockingLoader(),()=> this.showAllApps(),this.catalogConfigs,this.appDefinitions,this.appEntitlements);this.searchEngine=new window.SearchEngine(this.appDefinitions,this.appEntitlements);this.uiRenderer=new window.UIRenderer(this.appDefinitions,this.appEntitlements);this.modalManager=new window.ModalManager();this.eventHandlers=new window.EventHandlers();this.initializeApp();}
initializeApp(){this.eventHandlers.initializeEventListeners(this);this.initializeBlockingLoader();this.setupPageVisibilityHandling();this.updateBlockingLoader('🚀 Initializing Teams App Catalog Explorer...',0);setTimeout(()=>{this.dataLoader.loadAllCatalogConfigurations();},100);}
setupPageVisibilityHandling(){document.addEventListener('visibilitychange',()=>{if(document.hidden){this.isPageHidden=true;} else{this.isPageHidden=false;if(this.appDefinitions.size===0 && !this.dataLoader.isLoading){this.dataLoader.loadAllCatalogConfigurations();}
}
});window.addEventListener('beforeunload',()=>{this.cleanup();});}
cleanup(){if(this.blockingLoader){this.blockingLoader.style.display='none';}
}
initializeBlockingLoader(){this.blockingLoader=document.getElementById('blockingLoader');this.loaderMessage=document.getElementById('loaderMessage');this.loaderProgressBar=document.getElementById('loaderProgressBar');this.loaderStats=document.getElementById('loaderStats');this.loaderSourcesLoaded=document.getElementById('loaderSourcesLoaded');this.loaderTotalSources=document.getElementById('loaderTotalSources');}
updateBlockingLoader(message,progressPercent=0){if(this.loaderMessage){this.loaderMessage.textContent=message;}
if(this.loaderProgressBar){this.loaderProgressBar.style.width=`${progressPercent}%`;}
if(this.dataLoader && this.dataLoader.totalSources > 0){if(this.loaderStats){this.loaderStats.style.display='grid';}
if(this.loaderSourcesLoaded){this.loaderSourcesLoaded.textContent=this.dataLoader.loadedSources;}
if(this.loaderTotalSources){this.loaderTotalSources.textContent=this.dataLoader.totalSources;}
}
if(this.blockingLoader){if(progressPercent===0 || !this.blockingLoader.style.display || this.blockingLoader.style.display==='none'){this.blockingLoader.style.display='flex';}
}
if(message.includes('❌')|| message.includes('Failed')){this.showLoadingError(message);}
}
showLoadingError(errorMessage){if(this.loaderProgressBar){this.loaderProgressBar.style.background='linear-gradient(90deg,#ef4444 0%,#dc2626 100%)';}
if(this.blockingLoader && !this.blockingLoader.querySelector('.loader-retry-btn')){const retryButton=document.createElement('button');retryButton.className='loader-retry-btn';retryButton.textContent='🔄 Retry Loading';retryButton.style.cssText=`
margin-top: 20px;padding: 10px 20px;background: #4f46e5;color: white;border: none;border-radius: 8px;cursor: pointer;font-size: 0.9rem;font-weight: 500;transition: background 0.2s;`;retryButton.addEventListener('mouseenter',()=>{retryButton.style.background='#3730a3';});retryButton.addEventListener('mouseleave',()=>{retryButton.style.background='#4f46e5';});retryButton.addEventListener('click',()=>{this.retryLoading();});const loaderContainer=this.blockingLoader.querySelector('.loader-container');if(loaderContainer){loaderContainer.appendChild(retryButton);}
}
}
retryLoading(){if(this.loaderProgressBar){this.loaderProgressBar.style.background='linear-gradient(90deg,#4f46e5 0%,#7c3aed 100%)';}
const retryButton=this.blockingLoader.querySelector('.loader-retry-btn');if(retryButton){retryButton.remove();}
this.dataLoader.loadedSources=0;this.dataLoader.totalSources=0;this.dataLoader.urlCache.clear();this.catalogConfigs.clear();this.updateBlockingLoader('🔄 Retrying catalog data loading...',0);setTimeout(()=>{this.dataLoader.loadAllCatalogConfigurations();},500);}
hideBlockingLoader(){if(this.blockingLoader){this.blockingLoader.style.opacity='0';this.blockingLoader.style.transition='opacity 0.5s ease-out';setTimeout(()=>{this.blockingLoader.style.display='none';this.blockingLoader.style.opacity='1';this.blockingLoader.style.transition='';},500);}
}
updateStats(){this.uiRenderer.updateStats();}
showAllApps(){this.populateAudienceGroups();this.initializeSearchTab();this.searchEngine.showAllApps();}
handleSearchInput(query){this.searchEngine.handleSearchInput(query);}
refreshSearchDisplay(){const searchInput=document.getElementById('searchInput');const searchTerm=searchInput ? searchInput.value.trim(): '';if(searchTerm){this.searchEngine.handleSearchInput(searchTerm,this.searchSelectedAudiences);} else{if(this.searchSelectedAudiences && this.searchSelectedAudiences.size > 0){this.searchEngine.showAllAppsWithAudienceFilter(this.searchSelectedAudiences);} else{this.searchEngine.showAllApps();}
}
}
showAppModal(appId){this.modalManager.showAppModal(appId,this.appDefinitions,this.dataLoader,this.uiRenderer,this.constants);}
showStateDetails(state){this.modalManager.showStateDetails(state,()=> this.analyzeEntitlementStatesUnfiltered(),(appId)=> this.getAppInfo(appId),this.appEntitlements,this.globalSelectedAudiences);}
showStateReference(){this.modalManager.showStateReference();}
showLoadedSourcesModal(){this.modalManager.showLoadedSourcesModal(this.uiRenderer,this.dataLoader.urlToAudienceGroups);}
switchTab(tabName){this.eventHandlers.switchTab(tabName);if(tabName==='entitlementStates'){this.initializeEntitlementStatesTab();} else if(tabName==='search'){this.initializeSearchTab();}
}
populateAudienceGroups(){const actualAudienceGroups=new Set();for(const[appId,audienceMap]of this.appDefinitions.entries()){for(const[audienceGroup]of audienceMap.entries()){actualAudienceGroups.add(audienceGroup);}
}
if(this.appEntitlements.size > 0){for(const[appId,entitlementMap]of this.appEntitlements.entries()){for(const[entitlementKey]of entitlementMap.entries()){const[audienceGroup]=entitlementKey.split('.');if(audienceGroup){actualAudienceGroups.add(audienceGroup);}
}
}
}
this.audienceGroups=actualAudienceGroups;if(this.globalSelectedAudiences.size===0 ||
!Array.from(this.globalSelectedAudiences).some(audience=> actualAudienceGroups.has(audience))){this.globalSelectedAudiences=new Set(actualAudienceGroups);}
if(this.searchSelectedAudiences.size===0 ||
!Array.from(this.searchSelectedAudiences).some(audience=> actualAudienceGroups.has(audience))){this.searchSelectedAudiences=new Set(actualAudienceGroups);}
}
initializeEntitlementStatesTab(){if(this.appDefinitions.size===0 || this.appEntitlements.size===0){const resultsElement=document.getElementById('entitlementStatesResults');if(resultsElement){resultsElement.innerHTML=`
<div class="no-entitlements-message">
<p>No catalog data loaded yet.</p>
<p>Please load catalog data from the Search Apps tab first.</p>
</div>
`;}
return;}
this.populateAudienceGroups();const filterContainer=document.getElementById('globalAudienceFilter');if(filterContainer){filterContainer.style.display='block';}
this.uiRenderer.renderGlobalAudienceFilter(this.audienceGroups,this.globalSelectedAudiences);const statsElement=document.getElementById('entitlementStatesStats');if(statsElement){statsElement.style.display='grid';}
this.refreshEntitlementStatesDisplay();}
initializeSearchTab(){if(this.appDefinitions.size===0){const filterContainer=document.getElementById('searchAudienceFilter');if(filterContainer){filterContainer.style.display='none';}
return;}
if(this.searchSelectedAudiences.size===0 ||
!Array.from(this.searchSelectedAudiences).some(audience=> this.audienceGroups.has(audience))){this.searchSelectedAudiences=new Set(this.audienceGroups);}
const filterContainer=document.getElementById('searchAudienceFilter');if(filterContainer){filterContainer.style.display='block';}
this.uiRenderer.renderSearchAudienceFilter(this.audienceGroups,this.searchSelectedAudiences);this.refreshSearchDisplay();}
toggleGlobalAudienceFilter(audience){this.eventHandlers.toggleGlobalAudienceFilter(audience,this);}
selectAllGlobalAudiences(){this.eventHandlers.selectAllGlobalAudiences(this);}
clearAllGlobalAudiences(){this.eventHandlers.clearAllGlobalAudiences(this);}
toggleSearchAudienceFilter(audience){this.eventHandlers.toggleSearchAudienceFilter(audience,this);}
selectAllSearchAudiences(){this.eventHandlers.selectAllSearchAudiences(this);}
clearAllSearchAudiences(){this.eventHandlers.clearAllSearchAudiences(this);}
toggleAudienceFilter(audience){this.eventHandlers.handleAudienceFilterToggle(audience,this);}
clearAudienceFilters(){this.eventHandlers.handleClearAudienceFilters(this);}
showStatus(message,type='info'){this.eventHandlers.showStatus(message,type);}
hideStatus(){const statusElement=document.getElementById('status');if(statusElement){statusElement.textContent='';statusElement.className='status';}
}
getAppInfo(appId){const audienceMap=this.appDefinitions.get(appId);if(!audienceMap || audienceMap.size===0){return{name: this.constants.UNKNOWN_APP,developerName: this.constants.UNKNOWN_DEVELOPER,version: this.constants.VERSION_NA,largeImageUrl: '',isCoreApp: false,isTeamsOwned: false
};}
return audienceMap.values().next().value;}
getAppPreconfiguredEntitlements(appId){const entitlementMap=this.appEntitlements.get(appId);if(!entitlementMap)return{};const audienceEntitlements={};for(const[key,entitlement]of entitlementMap.entries()){const[audienceGroup]=key.split('.');if(!audienceEntitlements[audienceGroup]){audienceEntitlements[audienceGroup]=[];}
audienceEntitlements[audienceGroup].push(entitlement);}
return audienceEntitlements;}
analyzeEntitlementStates(){const stateToApps=new Map();for(const[appId,entitlementMap]of this.appEntitlements.entries()){for(const[entitlementKey,entitlement]of entitlementMap.entries()){const[audienceGroup]=entitlementKey.split('.');if(!this.globalSelectedAudiences.has(audienceGroup)){continue;}
const state=entitlement.state;if(!stateToApps.has(state)){stateToApps.set(state,{apps: new Set(),audiences: new Set()});}
stateToApps.get(state).apps.add(appId);stateToApps.get(state).audiences.add(audienceGroup);}
}
return stateToApps;}
analyzeEntitlementStatesUnfiltered(){const stateToApps=new Map();for(const[appId,entitlementMap]of this.appEntitlements.entries()){for(const[entitlementKey,entitlement]of entitlementMap.entries()){const[audienceGroup]=entitlementKey.split('.');const state=entitlement.state;if(!stateToApps.has(state)){stateToApps.set(state,{apps: new Set(),audiences: new Set()});}
stateToApps.get(state).apps.add(appId);stateToApps.get(state).audiences.add(audienceGroup);}
}
return stateToApps;}
refreshEntitlementStatesDisplay(){try{const resultsElement=document.getElementById('entitlementStatesResults');if(!resultsElement){console.error('Entitlement states results element not found');return;}
if(this.globalSelectedAudiences.size===0){resultsElement.innerHTML=`
<div class="no-entitlements-message">
<p style="color: #ef4444;font-weight: bold;">No audience groups selected</p>
<p>Select at least one audience group using the filter above to view entitlement states.</p>
</div>
`;const uniqueStatesEl=document.getElementById('uniqueStates');const appsWithEntitlementsEl=document.getElementById('appsWithEntitlements');if(uniqueStatesEl)uniqueStatesEl.textContent='0';if(appsWithEntitlementsEl)appsWithEntitlementsEl.textContent='0';return;}
const entitlementStates=this.analyzeEntitlementStates();if(entitlementStates.size===0){resultsElement.innerHTML=`
<div class="no-entitlements-message">
<p>No preconfigured entitlement states found for the selected audience groups.</p>
<p>Load catalog data from the Search Apps tab first,or try selecting different audience groups.</p>
</div>
`;return;}
this.uiRenderer.updateEntitlementStatesStats(entitlementStates);this.uiRenderer.displayEntitlementStates(entitlementStates);} catch(error){console.error('Error refreshing entitlement states display:',error);const resultsElement=document.getElementById('entitlementStatesResults');if(resultsElement){resultsElement.innerHTML=`
<div style="text-align: center;padding: 40px;color: #ef4444;">
<p>Error refreshing entitlement states display</p>
</div>
`;}
}
}
}
