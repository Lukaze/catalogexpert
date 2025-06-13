class AppModalRenderer{generateDetailedAppContent(audienceMap,appId,dataLoader,constants){const entitlementInfo=this.getAppPreconfiguredEntitlementsGrouped(appId,dataLoader);const firstApp=audienceMap.values().next().value;const audienceVersionsHtml=this.createAudienceVersionsHtml(audienceMap);return `
<div class="modal-app-header">
${firstApp.largeImageUrl ? `<img src="${firstApp.largeImageUrl}" alt="${firstApp.name}" class="modal-app-icon" onerror="this.style.display='none'">` : ''}<div class="modal-app-basic-info">
<h4>${window.utils.escapeHtml(firstApp.name || 'Unknown App')}</h4>
<p class="app-id-modal">ID: ${appId}</p>
<p>Developer: ${window.utils.escapeHtml(firstApp.developerName || 'Unknown')}</p>
${firstApp.description ? `<p class="app-description-modal">${window.utils.escapeHtml(firstApp.description)}</p>` : ''}</div>
<div class="modal-app-stats">
<div class="modal-stat">
<div class="modal-stat-number">${audienceMap.size}</div>
<div class="modal-stat-label">Audience Groups</div>
</div>
<div class="modal-stat">
<div class="modal-stat-number">${Object.keys(entitlementInfo).length}</div>
<div class="modal-stat-label">Entitlements</div>
</div>
</div>
</div>
<!--Tab Navigation-->
<div class="modal-tabs">
<button class="modal-tab-button active" onclick="window.modalManager.switchModalTab(event,'overview')">
📊 Overview
</button>
<button class="modal-tab-button" onclick="window.modalManager.switchModalTab(event,'versions')">
🔄 Versions
</button>
<button class="modal-tab-button" onclick="window.modalManager.switchModalTab(event,'entitlements')">
🔐 Entitlements(${Object.keys(entitlementInfo).length})</button>
<button class="modal-tab-button" onclick="window.modalManager.switchModalTab(event,'definition')">
📋 Definition
</button>
<button class="modal-tab-button" onclick="window.modalManager.switchModalTab(event,'technical')">
⚙️ Technical
</button>
</div>
<!--Tab Content-->
<div class="modal-tab-content">
<!--Overview Tab-->
<div id="modal-tab-overview" class="modal-tab-pane active">
<div class="modal-overview-grid">
<div class="overview-card">
<h5>📱 App Properties</h5>
<div class="property-badges">
${firstApp.isCoreApp ? '<span class="property-badge core">Core App</span>' : ''}${firstApp.isTeamsOwned ? '<span class="property-badge teams">Teams Owned</span>' : ''}${firstApp.isPinnable ? '<span class="property-badge feature">Pinnable</span>' : ''}${firstApp.isPreinstallable ? '<span class="property-badge feature">Preinstallable</span>' : ''}${firstApp.isBlockable ? '<span class="property-badge warning">Blockable</span>' : ''}${firstApp.isFullTrust ? '<span class="property-badge trust">Full Trust</span>' : ''}${!firstApp.isCoreApp && !firstApp.isTeamsOwned && !firstApp.isPinnable && !firstApp.isPreinstallable && !firstApp.isBlockable && !firstApp.isFullTrust ? '<span class="property-badge default">Standard App</span>' : ''}</div>
</div>
<div class="overview-card">
<h5>🏷️ Categories & Industries</h5>
<div class="tag-container">
${firstApp.categories ? firstApp.categories.map(cat=> `<span class="tag category-tag">${cat}</span>`).join(''): '<span class="no-data">No categories</span>'}${firstApp.industries ? firstApp.industries.map(ind=> `<span class="tag industry-tag">${ind}</span>`).join(''): '<span class="no-data">No industries</span>'}</div>
</div>
${firstApp.developerUrl ? `
<div class="overview-card">
<h5>🔗 Developer Links</h5>
<a href="${firstApp.developerUrl}" target="_blank" class="developer-link">
Visit Developer Website
<span class="external-icon">↗</span>
</a>
</div>
` : ''}</div>
</div>
<!--Versions Tab-->
<div id="modal-tab-versions" class="modal-tab-pane">
<div class="versions-container">
<h5>📋 Audience Group Versions</h5>
<div class="versions-grid">
${this.createVersionsGrid(audienceMap)}</div>
</div>
</div>
<!--Entitlements Tab-->
<div id="modal-tab-entitlements" class="modal-tab-pane">
${this.renderPreconfiguredEntitlements(entitlementInfo)}</div>
<!--Definition Tab-->
<div id="modal-tab-definition" class="modal-tab-pane">
${window.definitionRenderer.renderAppDefinition(audienceMap,appId)}</div>
<!--Technical Tab-->
<div id="modal-tab-technical" class="modal-tab-pane">
<div class="technical-grid">
<div class="technical-card">
<h5>🔧 Technical Details</h5>
<div class="technical-items">
<div class="technical-item">
<span class="tech-label">Manifest Version:</span>
<span class="tech-value">${firstApp.manifestVersion || 'N/A'}</span>
</div>
<div class="technical-item">
<span class="tech-label">Last Updated:</span>
<span class="tech-value">${firstApp.lastUpdatedAt ? new Date(firstApp.lastUpdatedAt).toLocaleDateString(): 'N/A'}</span>
</div>
<div class="technical-item">
<span class="tech-label">Office Asset ID:</span>
<span class="tech-value">${firstApp.officeAssetId || 'N/A'}</span>
</div>
</div>
</div>
</div>
</div>
</div>
`;}createAudienceVersionsHtml(audienceMap){return Array.from(audienceMap.entries()).sort(([a],[b])=> a.localeCompare(b)).map(([audience,app])=>{const shorthand=window.utils.getAudienceGroupShorthand(audience);return `
<div class="detail-item">
<span class="detail-label">
<span class="audience-bubble" data-audience="${audience.toLowerCase()}">${shorthand}</span>:
</span>
<span class="detail-value">
v${app.version}${app.sourceType ? `<span class="tag" style="margin-left: 8px;font-size: 0.7rem;">${app.sourceType}</span>` : ''}</span>
</div>
`}).join('');}createVersionsGrid(audienceMap){return Array.from(audienceMap.entries()).sort(([a],[b])=> a.localeCompare(b)).map(([audience,app])=>{const shorthand=window.utils.getAudienceGroupShorthand(audience);return `
<div class="version-card">
<div class="version-header">
<h6>
<span class="audience-bubble" data-audience="${audience.toLowerCase()}">${shorthand}</span>
</h6>
<span class="version-number">v${app.version}</span>
</div>
${app.sourceType ? `<div class="version-source">${app.sourceType}</div>` : ''}</div>
`}).join('');}renderPreconfiguredEntitlements(entitlementInfo){if(Object.keys(entitlementInfo).length===0){return `
<div class="entitlements-empty">
<div class="empty-state">
<div class="empty-icon">🔐</div>
<h5>No Preconfigured Entitlements</h5>
<p>This app doesn't have any preconfigured entitlement states defined for any audience groups.</p>
</div>
</div>
`;}let html=`
<div class="entitlements-container">
<div class="entitlements-header">
<h5>🔐 Preconfigured Entitlements</h5>
<div class="entitlements-summary">
<span class="summary-item">
<strong>${Object.keys(entitlementInfo).length}</strong> audience groups
</span>
<span class="summary-item">
<strong>${Object.values(entitlementInfo).reduce((total,ents)=> total+ents.length,0)}</strong> total entitlements
</span>
</div>
</div>
<div class="entitlements-grid">
`;Object.entries(entitlementInfo).forEach(([audience,entitlements])=>{const shorthand=window.utils.getAudienceGroupShorthand(audience);html+=`
<div class="entitlement-audience-card">
<div class="audience-header">
<h6>
<span class="audience-bubble" data-audience="${audience.toLowerCase()}">${shorthand}</span>
</h6>
<span class="entitlement-count">${entitlements.length}entitlement${entitlements.length !==1 ? 's' : ''}</span>
</div>
<div class="entitlements-list">
`;entitlements.forEach(entitlement=>{const stateClass=window.modalManager.getStateClass(entitlement.state);const stateIcon=window.modalManager.getStateIcon(entitlement.state);html+=`
<div class="entitlement-card">
<div class="entitlement-main">
<div class="entitlement-scope-context">
<span class="entitlement-scope">${entitlement.scope}</span>
<span class="entitlement-context">${entitlement.context}</span>
</div>
<div class="entitlement-state-badge ${stateClass}">
<span class="state-icon">${stateIcon}</span>
<span class="state-text">${entitlement.state}</span>
</div>
</div>
</div>
`;});html+=`
</div>
</div>
`;});html+=`
</div>
</div>
`;return html;}getAppPreconfiguredEntitlementsGrouped(appId,dataLoader){const rawEntitlements=dataLoader.getAppPreconfiguredEntitlements(appId);const audienceEntitlements={};for(const[key,entitlement]of Object.entries(rawEntitlements)){const[audienceGroup,scope,context]=key.split('.');if(!audienceEntitlements[audienceGroup]){audienceEntitlements[audienceGroup]=[];}const entitlementWithContext={...entitlement,scope: scope,context: context};audienceEntitlements[audienceGroup].push(entitlementWithContext);}return audienceEntitlements;}}window.AppModalRenderer=AppModalRenderer;window.appModalRenderer=new AppModalRenderer();
