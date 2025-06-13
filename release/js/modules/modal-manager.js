class ModalManager{constructor(){this.currentStateDetails=null;}
showAppModal(appId,appDefinitions,dataLoader,uiRenderer,constants){const audienceMap=appDefinitions.get(appId);if(!audienceMap){this.showStatus('❌ App not found','error');return;}
const modalContent=window.appModalRenderer.generateDetailedAppContent(audienceMap,appId,dataLoader,constants);const modalBody=document.querySelector('#appModal .modal-body');const modalTitle=document.querySelector('#appModal .modal-header h2');const firstApp=audienceMap.values().next().value;if(modalTitle){modalTitle.textContent=firstApp.name || constants.UNKNOWN_APP;}
if(modalBody){modalBody.innerHTML=modalContent;}
const modal=document.getElementById('appModal');modal.style.display='flex';document.body.style.overflow='hidden';}
closeModal(){const modal=document.getElementById('appModal');modal.style.display='none';document.body.style.overflow='auto';}
switchModalTab(event,tabName){document.querySelectorAll('.modal-tab-button').forEach(btn=> btn.classList.remove('active'));document.querySelectorAll('.modal-tab-pane').forEach(pane=> pane.classList.remove('active'));event.target.classList.add('active');document.getElementById(`modal-tab-${tabName}`).classList.add('active');}
showStatus(message,type){console.log(`Status[${type}]: ${message}`);}
showStateReference(){return window.stateModalManager.showStateReference();}
closeStateReferenceModal(){return window.stateModalManager.closeStateReferenceModal();}
showStateDetails(state,analyzeEntitlementStatesUnfiltered,getAppInfo,appEntitlements,globalSelectedAudiences){return window.stateModalManager.showStateDetails(state,analyzeEntitlementStatesUnfiltered,getAppInfo,appEntitlements,globalSelectedAudiences);}
closeStateDetailsModal(){return window.stateModalManager.closeStateDetailsModal();}
toggleAudienceFilter(audience,globalSelectedAudiences,renderGlobalAudienceFilter,refreshEntitlementStatesDisplay){return window.stateModalManager.toggleAudienceFilter(audience,globalSelectedAudiences,renderGlobalAudienceFilter,refreshEntitlementStatesDisplay);}
clearAudienceFilters(globalSelectedAudiences,renderGlobalAudienceFilter,refreshEntitlementStatesDisplay){return window.stateModalManager.clearAudienceFilters(globalSelectedAudiences,renderGlobalAudienceFilter,refreshEntitlementStatesDisplay);}
showLoadedSourcesModal(uiRenderer,urlToAudienceGroups){const modal=document.getElementById('loadedSourcesModal');const content=document.getElementById('loadedSourcesContent');if(!modal || !content)return;const sourcesHtml=uiRenderer.generateLoadedSourcesContent(urlToAudienceGroups);content.innerHTML=sourcesHtml;modal.style.display='flex';document.body.style.overflow='hidden';}
closeLoadedSourcesModal(){const modal=document.getElementById('loadedSourcesModal');if(modal){modal.style.display='none';document.body.style.overflow='auto';}
}
closeAllModals(){this.closeModal();this.closeStateReferenceModal();this.closeStateDetailsModal();this.closeLoadedSourcesModal();}
getStateColor(state){const stateColors={'Installed': '#10b981','InstalledAndPermanent': '#8b5cf6','PreConsented': '#06b6d4','Featured': '#f59e0b','NotInstalled': '#ef4444','InstalledAndDeprecated': '#f97316','HiddenFromAppStore': '#6b7280','Available': '#10b981','Blocked': '#dc2626','BlockedByAdmin': '#991b1b','BlockedByUser': '#b91c1c','Pinned': '#3b82f6','Preinstalled': '#7c3aed'
};return stateColors[state]|| '#64748b';}
getStateClass(state){const stateClasses={'Installed': 'state-installed','InstalledAndPermanent': 'state-permanent','PreConsented': 'state-preconsented','Featured': 'state-featured','NotInstalled': 'state-not-installed','InstalledAndDeprecated': 'state-deprecated','HiddenFromAppStore': 'state-hidden','Available': 'state-available','Blocked': 'state-blocked','BlockedByAdmin': 'state-blocked-admin','BlockedByUser': 'state-blocked-user','Pinned': 'state-pinned','Preinstalled': 'state-preinstalled'
};return stateClasses[state]|| 'state-default';}
getStateIcon(state){const stateIcons={'Installed': '🟢','InstalledAndPermanent': '🔒','PreConsented': '✅','Featured': '⭐','NotInstalled': '❌','InstalledAndDeprecated': '⚠️','HiddenFromAppStore': '🚫','Available': '✅','Blocked': '🔴','BlockedByAdmin': '🚫','BlockedByUser': '⛔','Pinned': '📌','Preinstalled': '💜'
};return stateIcons[state]|| '❓';}
}
window.ModalManager=ModalManager;window.modalManager=new ModalManager();
