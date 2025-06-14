class EventHandlers{constructor(){this.searchTimeout=null;}
initializeEventListeners(appExplorer){this.initializeSearchEvents(appExplorer);this.initializeModalEvents(appExplorer);this.initializeKeyboardEvents(appExplorer);}
initializeSearchEvents(appExplorer){const searchInput=document.getElementById('searchInput');if(searchInput){searchInput.addEventListener('input',(e)=>{this.handleSearchInput(e.target.value,appExplorer);});}
}
initializeModalEvents(appExplorer){this.initializeAppModalEvents(appExplorer);this.initializeStateReferenceModalEvents(appExplorer);this.initializeStateDetailsModalEvents(appExplorer);this.initializeLoadedSourcesModalEvents(appExplorer);}
initializeAppModalEvents(appExplorer){const closeModal=document.getElementById('closeModal');const modal=document.getElementById('appModal');if(closeModal){closeModal.addEventListener('click',()=> appExplorer.modalManager.closeModal());}
if(modal){modal.addEventListener('click',(e)=>{if(e.target===modal){appExplorer.modalManager.closeModal();}
});}
}
initializeStateReferenceModalEvents(appExplorer){const closeStateReferenceModal=document.getElementById('closeStateReferenceModal');const stateReferenceModal=document.getElementById('stateReferenceModal');if(closeStateReferenceModal){closeStateReferenceModal.addEventListener('click',()=> appExplorer.modalManager.closeStateReferenceModal());}
if(stateReferenceModal){stateReferenceModal.addEventListener('click',(e)=>{if(e.target===stateReferenceModal){appExplorer.modalManager.closeStateReferenceModal();}
});}
}
initializeStateDetailsModalEvents(appExplorer){const closeStateDetailsModal=document.getElementById('closeStateDetailsModal');const stateDetailsModal=document.getElementById('stateDetailsModal');if(closeStateDetailsModal){closeStateDetailsModal.addEventListener('click',()=> appExplorer.modalManager.closeStateDetailsModal());}
if(stateDetailsModal){stateDetailsModal.addEventListener('click',(e)=>{if(e.target===stateDetailsModal){appExplorer.modalManager.closeStateDetailsModal();}
});}
}
initializeLoadedSourcesModalEvents(appExplorer){const closeLoadedSourcesModal=document.getElementById('closeLoadedSourcesModal');const loadedSourcesModal=document.getElementById('loadedSourcesModal');if(closeLoadedSourcesModal){closeLoadedSourcesModal.addEventListener('click',()=> appExplorer.modalManager.closeLoadedSourcesModal());}
if(loadedSourcesModal){loadedSourcesModal.addEventListener('click',(e)=>{if(e.target===loadedSourcesModal){appExplorer.modalManager.closeLoadedSourcesModal();}
});}
}
initializeKeyboardEvents(appExplorer){document.addEventListener('keydown',(e)=>{if(e.key==='Escape'){appExplorer.modalManager.closeAllModals();}
});}
handleSearchInput(query,appExplorer){if(this.searchTimeout){clearTimeout(this.searchTimeout);}
this.searchTimeout=setTimeout(()=>{const searchTab=document.getElementById('searchTab');const isSearchTabActive=searchTab && searchTab.classList.contains('active');if(isSearchTabActive && appExplorer.searchSelectedAudiences && appExplorer.searchSelectedAudiences.size > 0){appExplorer.searchEngine.handleSearchInput(query,appExplorer.searchSelectedAudiences);} else{appExplorer.searchEngine.handleSearchInput(query);}
},300);}
switchTab(tabName){document.getElementById('searchTabContent').classList.remove('active');document.getElementById('entitlementStatesTabContent').classList.remove('active');document.getElementById('searchTab').classList.remove('active');document.getElementById('entitlementStatesTab').classList.remove('active');const resultsSection=document.querySelector('.results-section');if(tabName==='search'){document.getElementById('searchTabContent').classList.add('active');document.getElementById('searchTab').classList.add('active');if(resultsSection){resultsSection.style.display='block';}
} else if(tabName==='entitlementStates'){document.getElementById('entitlementStatesTabContent').classList.add('active');document.getElementById('entitlementStatesTab').classList.add('active');if(resultsSection){resultsSection.style.display='none';}
}
}
toggleGlobalAudienceFilter(audience,appExplorer){if(appExplorer.globalSelectedAudiences.has(audience)){appExplorer.globalSelectedAudiences.delete(audience);} else{appExplorer.globalSelectedAudiences.add(audience);}
appExplorer.uiRenderer.renderGlobalAudienceFilter(appExplorer.audienceGroups,appExplorer.globalSelectedAudiences);appExplorer.refreshEntitlementStatesDisplay();}
selectAllGlobalAudiences(appExplorer){appExplorer.audienceGroups.forEach(audience=>{appExplorer.globalSelectedAudiences.add(audience);});appExplorer.uiRenderer.renderGlobalAudienceFilter(appExplorer.audienceGroups,appExplorer.globalSelectedAudiences);appExplorer.refreshEntitlementStatesDisplay();}
clearAllGlobalAudiences(appExplorer){appExplorer.globalSelectedAudiences.clear();appExplorer.uiRenderer.renderGlobalAudienceFilter(appExplorer.audienceGroups,appExplorer.globalSelectedAudiences);appExplorer.refreshEntitlementStatesDisplay();}
toggleSearchAudienceFilter(audience,appExplorer){if(appExplorer.searchSelectedAudiences.has(audience)){appExplorer.searchSelectedAudiences.delete(audience);} else{appExplorer.searchSelectedAudiences.add(audience);}
appExplorer.uiRenderer.renderSearchAudienceFilter(appExplorer.audienceGroups,appExplorer.searchSelectedAudiences);appExplorer.refreshSearchDisplay();}
selectAllSearchAudiences(appExplorer){appExplorer.audienceGroups.forEach(audience=>{appExplorer.searchSelectedAudiences.add(audience);});appExplorer.uiRenderer.renderSearchAudienceFilter(appExplorer.audienceGroups,appExplorer.searchSelectedAudiences);appExplorer.refreshSearchDisplay();}
clearAllSearchAudiences(appExplorer){appExplorer.searchSelectedAudiences.clear();appExplorer.uiRenderer.renderSearchAudienceFilter(appExplorer.audienceGroups,appExplorer.searchSelectedAudiences);appExplorer.refreshSearchDisplay();}
handleAppCardClick(appId,appExplorer){appExplorer.modalManager.showAppModal(appId,appExplorer.appDefinitions,appExplorer.dataLoader,appExplorer.uiRenderer,appExplorer.constants);}
handleStateClick(state,appExplorer){appExplorer.modalManager.showStateDetails(state,()=> appExplorer.analyzeEntitlementStatesUnfiltered(),(appId)=> appExplorer.getAppInfo(appId),appExplorer.appEntitlements,appExplorer.globalSelectedAudiences);}
handleStateReferenceClick(appExplorer){appExplorer.modalManager.showStateReference();}
handleLoadedSourcesClick(appExplorer){appExplorer.modalManager.showLoadedSourcesModal(appExplorer.uiRenderer,appExplorer.dataLoader.urlToAudienceGroups);}
handleAudienceFilterToggle(audience,appExplorer){appExplorer.modalManager.toggleAudienceFilter(audience,appExplorer.globalSelectedAudiences,()=> appExplorer.uiRenderer.renderGlobalAudienceFilter(appExplorer.audienceGroups,appExplorer.globalSelectedAudiences),()=> appExplorer.refreshEntitlementStatesDisplay());}
handleClearAudienceFilters(appExplorer){appExplorer.modalManager.clearAudienceFilters(appExplorer.globalSelectedAudiences,()=> appExplorer.uiRenderer.renderGlobalAudienceFilter(appExplorer.audienceGroups,appExplorer.globalSelectedAudiences),()=> appExplorer.refreshEntitlementStatesDisplay());}
handleLoadCatalogConfig(appExplorer){appExplorer.dataLoader.loadAllCatalogConfigurations();}
showStatus(message,type='info'){const statusElement=document.getElementById('status');if(statusElement){statusElement.textContent=message;statusElement.className=`status ${type}`;if(type !=='error'){setTimeout(()=>{statusElement.textContent='';statusElement.className='status';},3000);}
}
}
updateBlockingLoader(message,progressPercent=0){const blockingLoader=document.getElementById('blockingLoader');const loaderMessage=document.getElementById('loaderMessage');const loaderProgressBar=document.getElementById('loaderProgressBar');if(loaderMessage){loaderMessage.textContent=message;}
if(loaderProgressBar){loaderProgressBar.style.width=`${progressPercent}%`;}
if(blockingLoader){if(progressPercent===0){blockingLoader.style.display='flex';} else if(progressPercent >=100){blockingLoader.style.opacity='0';blockingLoader.style.transition='opacity 0.5s ease-out';setTimeout(()=>{blockingLoader.style.display='none';blockingLoader.style.opacity='1';blockingLoader.style.transition='';},500);}
}
}
}
window.EventHandlers=EventHandlers;
