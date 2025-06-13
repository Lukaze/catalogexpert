class StateModalManager{constructor(){this.currentStateDetails=null;}
showStateReference(){const modal=document.getElementById('stateReferenceModal');if(modal){modal.style.display='flex';document.body.style.overflow='hidden';}
}
closeStateReferenceModal(){const modal=document.getElementById('stateReferenceModal');if(modal){modal.style.display='none';document.body.style.overflow='auto';}
}
showStateDetails(state,analyzeEntitlementStatesUnfiltered,getAppInfo,appEntitlements,globalSelectedAudiences){const modal=document.getElementById('stateDetailsModal');const title=document.getElementById('stateDetailsTitle');const body=document.getElementById('stateDetailsBody');if(!modal || !title || !body)return;const entitlementStates=analyzeEntitlementStatesUnfiltered();const stateData=entitlementStates.get(state);if(!stateData){console.error('State data not found for:',state);return;}
this.currentStateDetails={state: state,stateData: stateData,selectedAudiences: new Set(Array.from(stateData.audiences).filter(audience=>
globalSelectedAudiences.has(audience))),allAppsData: this.buildStateAppsData(state,stateData,getAppInfo,appEntitlements)};title.textContent=`${state}`;this.renderStateDetailsContent();modal.style.display='flex';document.body.style.overflow='hidden';}
buildStateAppsData(state,stateData,getAppInfo,appEntitlements){const appsData=[];const appsArray=Array.from(stateData.apps);appsArray.forEach(appId=>{const app=getAppInfo(appId);const appAudiences=new Set();if(appEntitlements.has(appId)){const appEntitlementMap=appEntitlements.get(appId);for(const[entitlementKey,entitlement]of appEntitlementMap.entries()){if(entitlement.state===state){const[audienceGroup]=entitlementKey.split('.');appAudiences.add(audienceGroup);}
}
}
appsData.push({appId: appId,app: app,audiences: Array.from(appAudiences).sort()});});return appsData;}
renderStateDetailsContent(){const body=document.getElementById('stateDetailsBody');const title=document.getElementById('stateDetailsTitle');const{state,stateData,selectedAudiences,allAppsData }=this.currentStateDetails;let filteredApps=[];if(selectedAudiences.size > 0){filteredApps=allAppsData.filter(appData=>
appData.audiences.some(audience=> selectedAudiences.has(audience)));} else{filteredApps=[];}
title.textContent=`${state}(${filteredApps.length} of ${allAppsData.length} app${allAppsData.length !==1 ? 's' : ''})`;const allAudiences=Array.from(stateData.audiences).sort();let html=`
<!--Audience Filter Controls-->
<div style="margin-bottom: 20px;">
<h4 style="color: #4338ca;margin-bottom: 10px;">🎯 Filter by Audience Groups</h4>
<div style="display: flex;flex-wrap: wrap;gap: 8px;align-items: center;">
`;allAudiences.forEach(audience=>{const shorthand=window.utils.getAudienceGroupShorthand(audience);const isSelected=selectedAudiences.has(audience);html +=`
<button class="audience-filter-btn ${isSelected ? 'selected' : ''}"
data-audience="${audience}"
onclick="window.appExplorer.toggleAudienceFilter('${audience}')">
${shorthand}
</button>
`;});html +=`
</div>
<div style="margin-top: 10px;font-size: 0.8rem;color: #64748b;">
${selectedAudiences.size===0 ? 'No audience groups selected(showing no apps)' :
selectedAudiences.size===allAudiences.length ? 'Showing all audience groups' :
`Filtering by: ${Array.from(selectedAudiences).map(audience=> window.utils.getAudienceGroupShorthand(audience)).join(',')}`}
${selectedAudiences.size < allAudiences.length ? `<button class="audience-filter-btn" onclick="window.appExplorer.clearAudienceFilters()" style="margin-left: 10px;font-size: 0.7rem;">Select All</button>` : ''}
</div>
</div>
<!--Summary-->
<div style="margin-bottom: 20px;">
<h4 style="color: #4338ca;margin-bottom: 10px;">📊 Summary</h4>
<div style="background: #f1f5f9;padding: 15px;border-radius: 8px;margin-bottom: 20px;">
<div style="font-size: 1.5rem;font-weight: bold;color: #1f2937;">${filteredApps.length}</div>
<div style="color: #64748b;font-size: 0.9rem;">
${selectedAudiences.size===0 ? 'No Apps(no audiences selected)' :
selectedAudiences.size===allAudiences.length ? 'Total Apps' : 'Filtered Apps'}
</div>
</div>
<div style="margin-bottom: 15px;color: #64748b;font-size: 0.9rem;">
Audience groups are listed per app below showing which specific configuration defines each app's entitlement state.
</div>
</div>
<!--Applications List-->
<div>
<h4 style="color: #4338ca;margin-bottom: 15px;">📱 Applications</h4>
<div class="state-app-simple-list">
`;filteredApps.forEach(appData=>{const{appId,app,audiences }=appData;const iconUrl=app.largeImageUrl || '';const appItemHtml=window.utils.createAppItemHtml(app,appId,iconUrl);const audienceShorthands=audiences.map(audience=>
window.utils.getAudienceGroupShorthand(audience));html +=`
<div class="state-app-list-item" onclick="window.appExplorer.showAppModal('${appId}')">
<div class="state-app-list-content">
<span class="state-app-list-name">
${appItemHtml}
</span>
<span class="state-app-list-audiences">
${audienceShorthands.join(',')}
</span>
</div>
</div>
`;});html +=`
</div>
</div>
`;body.innerHTML=html;}
toggleAudienceFilter(audience,globalSelectedAudiences,renderGlobalAudienceFilter,refreshEntitlementStatesDisplay){if(this.currentStateDetails.selectedAudiences.has(audience)){this.currentStateDetails.selectedAudiences.delete(audience);globalSelectedAudiences.delete(audience);} else{this.currentStateDetails.selectedAudiences.add(audience);globalSelectedAudiences.add(audience);}
this.renderStateDetailsContent();renderGlobalAudienceFilter();refreshEntitlementStatesDisplay();}
clearAudienceFilters(globalSelectedAudiences,renderGlobalAudienceFilter,refreshEntitlementStatesDisplay){this.currentStateDetails.selectedAudiences=new Set(this.currentStateDetails.stateData.audiences);this.currentStateDetails.stateData.audiences.forEach(audience=>{globalSelectedAudiences.add(audience);});this.renderStateDetailsContent();renderGlobalAudienceFilter();refreshEntitlementStatesDisplay();}
closeStateDetailsModal(){const modal=document.getElementById('stateDetailsModal');if(modal){modal.style.display='none';document.body.style.overflow='auto';}
}
}
window.StateModalManager=StateModalManager;window.stateModalManager=new StateModalManager();
