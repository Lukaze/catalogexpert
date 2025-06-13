class DefinitionRenderer{renderAppDefinition(audienceMap,appId){if(!audienceMap || audienceMap.size===0){return `
<div class="definition-empty">
<div class="empty-state">
<div class="empty-icon">📋</div>
<h5>No App Definition Available</h5>
<p>No app definition data found for this application.</p>
</div>
</div>
`;}const versionGroups=new Map();for(const[audience,app]of audienceMap.entries()){const version=app.version || 'N/A';if(!versionGroups.has(version)){versionGroups.set(version,{audiences:[],app: app});}versionGroups.get(version).audiences.push(audience);}const sortedVersions=Array.from(versionGroups.entries()).sort(([a],[b])=>{if(a==='N/A' && b==='N/A')return 0;if(a==='N/A')return 1;if(b==='N/A')return-1;const parseVersion=(v)=>{const parts=v.split('.').map(part=> parseInt(part,10)|| 0);return parts;};const versionA=parseVersion(a);const versionB=parseVersion(b);for(let i=0;i < Math.max(versionA.length,versionB.length);i++){const partA=versionA[i]|| 0;const partB=versionB[i]|| 0;if(partA !==partB){return partB-partA;}}return 0;});let html=`
<div class="definition-container">
<div class="definition-header">
<h5>📋 App Definition by Version</h5>
<div class="definition-summary">
<div class="summary-stats">
<span class="summary-item">
<strong>${sortedVersions.length}</strong> unique version${sortedVersions.length !==1 ? 's' : ''}</span>
<span class="summary-item">
<strong>${audienceMap.size}</strong> audience group${audienceMap.size !==1 ? 's' : ''}</span>
</div>
<div class="summary-hint">
💡 Click version headers to expand/collapse sections
</div>
</div>
</div>
<div class="definition-grid">
`;sortedVersions.forEach(([version,versionData],index)=>{const{audiences,app}=versionData;const collapseId=`definition-collapse-${index}`;const sortedAudiences=audiences.sort();const sourceTypes=new Set();for(const[audience,appData]of audienceMap.entries()){if(audiences.includes(audience)&& appData.sourceType){sourceTypes.add(appData.sourceType);}}let sourceBadgeHtml='';if(sourceTypes.size > 0){const sourceTypesArray=Array.from(sourceTypes);if(sourceTypesArray.length===1){sourceBadgeHtml=`<span class="source-badge">${sourceTypesArray[0]}</span>`;}else{sourceBadgeHtml=sourceTypesArray.map(type=>
`<span class="source-badge multiple">${type}</span>`).join('');}}html+=`
<div class="definition-version-card">
<div class="version-header collapsible" onclick="toggleDefinitionCollapse('${collapseId}')">
<h6>
<span class="collapse-indicator" id="${collapseId}-indicator">▶</span>
<span class="version-display">v${version}</span>
<div class="audience-bubbles-group">
${sortedAudiences.map(audience=>{const shorthand=window.utils.getAudienceGroupShorthand(audience);return `<span class="audience-bubble" data-audience="${audience.toLowerCase()}">${shorthand}</span>`;}).join('')}</div>
</h6>
${sourceBadgeHtml}</div>
<div class="definition-content collapsed" id="${collapseId}">
${this.renderAppProperties(app,appId,versionData,audienceMap)}</div>
</div>
`;});html+=`
</div>
</div>
`;return html;}renderAppProperties(app,appId,versionData=null,audienceMap=null){let versionSummaryHtml='';if(versionData && versionData.audiences.length > 1){const uniqueSourceTypes=[...new Set(versionData.audiences.map(audience=>{if(audienceMap && audienceMap.has(audience)){return audienceMap.get(audience).sourceType;}return null;}).filter(Boolean))];versionSummaryHtml=`
<div class="property-category version-summary">
<h6 class="category-header">Version Information</h6>
<div class="category-properties">
<div class="definition-property">
<span class="property-label">Version:</span>
<span class="property-value version">v${app.version}</span>
</div>
<div class="definition-property">
<span class="property-label">Audience Groups:</span>
<span class="property-value">${versionData.audiences.map(audience=>{const shorthand=window.utils.getAudienceGroupShorthand(audience);return `<span class="property-tag audience-tag" data-audience="${audience.toLowerCase()}">${shorthand}</span>`;}).join('')}</span>
</div>
${uniqueSourceTypes.length > 0 ? `
<div class="definition-property">
<span class="property-label">Source Types:</span>
<span class="property-value">${uniqueSourceTypes.map(type=>
`<span class="property-badge source-type">${type}</span>`).join('')}</span>
</div>
` : ''}</div>
</div>
`;}const propertyCategories={'Core App Properties':[{key: 'id',label: 'App ID',type: 'code'},{key: 'permissions',label: 'Permissions',type: 'array'},{key: 'etag',label: 'ETag',type: 'code'},{key: 'officeAssetId',label: 'Office Asset ID',type: 'code'},{key: 'externalId',label: 'External ID',type: 'code'},{key: 'manifestVersion',label: 'Manifest Version',type: 'version'},{key: 'version',label: 'Version',type: 'version'},{key: 'supportedPlatforms',label: 'Supported Platforms',type: 'array'},{key: 'name',label: 'Name',type: 'text'},{key: 'shortDescription',label: 'Short Description',type: 'description'},{key: 'longDescription',label: 'Long Description',type: 'description'},{key: 'smallImageUrl',label: 'Small Image URL(44px)',type: 'url'},{key: 'largeImageUrl',label: 'Large Image URL(88px)',type: 'url'},{key: 'accentColor',label: 'Accent Color',type: 'color'},{key: 'screenshotUrls',label: 'Screenshot URLs',type: 'array'},{key: 'videoUrl',label: 'Video URL',type: 'url'},{key: 'categories',label: 'Categories',type: 'array'},{key: 'disabledScopes',label: 'Disabled Scopes',type: 'array'}],'Developer Information':[{key: 'developerName',label: 'Developer Name',type: 'text'},{key: 'developerUrl',label: 'Developer URL',type: 'url'},{key: 'privacyUrl',label: 'Privacy URL',type: 'url'},{key: 'termsOfUseUrl',label: 'Terms of Use URL',type: 'url'},{key: 'thirdPartyNoticesUrl',label: 'Third Party Notices URL',type: 'url'}],'Security & Permissions':[{key: 'validDomains',label: 'Valid Domains',type: 'array'},{key: 'devicePermissions',label: 'Device Permissions',type: 'array'},{key: 'authorization',label: 'Authorization',type: 'object'},{key: 'webApplicationInfo',label: 'Web Application Info',type: 'object'},{key: 'securityComplianceInfo',label: 'Security Compliance Info',type: 'object'},{key: 'sensitivityLabel',label: 'Sensitivity Label',type: 'text'}],'App Capabilities':[{key: 'bots',label: 'Bots',type: 'object'},{key: 'customBots',label: 'Custom Bots',type: 'object'},{key: 'galleryTabs',label: 'Gallery Tabs',type: 'object'},{key: 'staticTabs',label: 'Static Tabs',type: 'object'},{key: 'inputExtensions',label: 'Input Extensions',type: 'object'},{key: 'connectors',label: 'Connectors',type: 'object'},{key: 'mobileModules',label: 'Mobile Modules',type: 'object'},{key: 'hostedCapabilities',label: 'Hosted Capabilities',type: 'object'},{key: 'meetingExtensionDefinition',label: 'Meeting Extension Definition',type: 'object'},{key: 'extensionItems',label: 'Extension Items',type: 'object'},{key: 'dashboardCards',label: 'Dashboard Cards',type: 'object'},{key: 'plugins',label: 'Plugins',type: 'object'},{key: 'copilotGpts',label: 'Copilot GPTs',type: 'object'},{key: 'customEngineCopilots',label: 'Custom Engine Copilots',type: 'object'},{key: 'copilotActions',label: 'Copilot Actions',type: 'object'}],'Display & UI':[{key: 'isFullScreen',label: 'Is Full Screen',type: 'boolean'},{key: 'showLoadingIndicator',label: 'Show Loading Indicator',type: 'boolean'},{key: 'color32x32ImageUrl',label: 'Color Icon URL(32px)',type: 'url'},{key: 'abbreviatedName',label: 'Abbreviated Name',type: 'text'},{key: 'backgroundLoadConfiguration',label: 'Background Load Configuration',type: 'object'}],'Tenant & Identity':[{key: 'tenantId',label: 'Tenant ID',type: 'code'},{key: 'creatorId',label: 'Creator ID',type: 'code'},{key: 'restrictedTenantTypes',label: 'Restricted Tenant Types',type: 'array'},{key: 'supportedTenantRegions',label: 'Supported Tenant Regions',type: 'array'}],'Localization':[{key: 'supportedLanguages',label: 'Supported Languages',type: 'array'},{key: 'languageTag',label: 'Language Tag',type: 'text'}],'Business & Marketplace':[{key: 'subscriptionOffer',label: 'Subscription Offer',type: 'object'},{key: 'freePlanItem',label: 'Free Plan Item',type: 'object'},{key: 'appCatalogExtension',label: 'App Catalog Extension',type: 'object'},{key: 'storeExtensionAttributes',label: 'Store Extension Attributes',type: 'object'},{key: 'mpnId',label: 'Microsoft Partner Network ID',type: 'code'},{key: 'templatedAppId',label: 'Templated App ID',type: 'code'},{key: 'industries',label: 'Industries',type: 'array'},{key: 'keywords',label: 'Keywords',type: 'array'},{key: 'publisherDocsUrl',label: 'Publisher Docs URL',type: 'url'}],'Configuration':[{key: 'configurableProperties',label: 'Configurable Properties',type: 'object'},{key: 'defaultInstallScope',label: 'Default Install Scope',type: 'text'},{key: 'defaultGroupCapability',label: 'Default Group Capability',type: 'text'},{key: 'scopeConstraints',label: 'Scope Constraints',type: 'object'},{key: 'supportedChannelTypes',label: 'Supported Channel Types',type: 'array'},{key: 'supportedHubs',label: 'Supported Hubs',type: 'array'},{key: 'supportsChannelFeatures',label: 'Supports Channel Features',type: 'text'}],'Status & Metadata':[{key: 'deletedDateTimeUtc',label: 'Deleted Date(UTC)',type: 'date'},{key: 'lastUpdatedAt',label: 'Last Updated At',type: 'date'},{key: 'appAvailabilityStatus',label: 'App Availability Status',type: 'badge'},{key: 'publishingPolicy',label: 'Publishing Policy',type: 'object'},{key: 'appPackageInfo',label: 'App Package Info',type: 'object'},{key: 'elementRelationshipSet',label: 'Element Relationship Set',type: 'object'},{key: 'apiDependencies',label: 'API Dependencies',type: 'array'},{key: 'appMetadata',label: 'App Metadata',type: 'object'}],'Office Add-ins':[{key: 'officeAddInElementItem',label: 'Office Add-in Element Item',type: 'object'},{key: 'exchangeAddInElementItem',label: 'Exchange Add-in Element Item',type: 'object'},{key: 'supportedElementTypes',label: 'Supported Element Types',type: 'array'}],'App Enhancement Features':[{key: 'isFullTrust',label: 'Is Full Trust',type: 'boolean'},{key: 'isTenantConfigurable',label: 'Is Tenant Configurable',type: 'boolean'},{key: 'applicableLicenseCategories',label: 'Applicable License Categories',type: 'array'},{key: 'validTrouterPaths',label: 'Valid Trouter Paths',type: 'array'},{key: 'activities',label: 'Activities',type: 'array'},{key: 'graphConnector',label: 'Graph Connector',type: 'object'},{key: 'sharedAppResource',label: 'Shared App Resource',type: 'object'},{key: 'intuneInfo',label: 'Intune Info',type: 'object'},{key: 'contactInfo',label: 'Contact Info',type: 'object'},{key: 'blockedConfigurations',label: 'Blocked Configurations',type: 'array'}],'MetaOS Features':[{key: 'isMetaOSApp',label: 'Is MetaOS App',type: 'boolean'},{key: 'titleId',label: 'Title ID',type: 'code'},{key: 'manifestId',label: 'Manifest ID',type: 'code'}],'Copilot & AI Features':[{key: 'copilotEnabled',label: 'Copilot Enabled',type: 'boolean'},{key: 'isCopilotPluginSupported',label: 'Is Copilot Plugin Supported',type: 'boolean'}],'Security & Compliance':[{key: 'isCoreApp',label: 'Is Core App',type: 'boolean'},{key: 'isPinnable',label: 'Is Pinnable',type: 'boolean'},{key: 'isBlockable',label: 'Is Blockable',type: 'boolean'},{key: 'isPreinstallable',label: 'Is Preinstallable',type: 'boolean'},{key: 'isTeamsOwned',label: 'Is Teams Owned',type: 'boolean'},{key: 'defaultBlockUntilAdminAction',label: 'Default Block Until Admin Action',type: 'boolean'},{key: 'isAppIOSAcquirable',label: 'Is App iOS Acquirable',type: 'boolean'},{key: 'requiredServicePlanIdSets',label: 'Required Service Plan ID Sets',type: 'array'},{key: 'isUninstallable',label: 'Is Uninstallable',type: 'boolean'}],'Additional Properties':[{key: 'description',label: 'Description',type: 'description'}]};let html='<div class="definition-properties-categorized">';html+=versionSummaryHtml;const displayedProperties=new Set();Object.entries(propertyCategories).forEach(([categoryName,properties])=>{const categoryProperties=properties.filter(prop=>{const value=this.getNestedProperty(app,prop.key)?? app[prop.key];const hasValue=value !==undefined && value !==null && value !=='';if(hasValue){displayedProperties.add(prop.key);}return hasValue;});if(categoryProperties.length > 0){html+=`<div class="property-category">`;html+=`<h6 class="category-header">${categoryName}</h6>`;html+=`<div class="category-properties">`;categoryProperties.forEach(prop=>{const value=this.getNestedProperty(app,prop.key)?? app[prop.key];html+=`<div class="definition-property">`;html+=`<span class="property-label">${prop.label}:</span>`;html+=`<span class="property-value ${prop.type}">${this.formatPropertyValue(value,prop.type)}</span>`;html+=`</div>`;});html+=`</div></div>`;}});const remainingProperties=Object.keys(app).filter(key=>
!displayedProperties.has(key)&&
app[key]!==undefined &&
app[key]!==null &&
app[key]!=='' &&
key !=='localizedDefinitions' &&
key !=='sourceType' &&
key !=='audienceGroup');if(remainingProperties.length > 0){html+=`<div class="property-category">`;html+=`<h6 class="category-header">Other Properties</h6>`;html+=`<div class="category-properties">`;remainingProperties.forEach(key=>{html+=`<div class="definition-property">`;html+=`<span class="property-label">${this.formatPropertyName(key)}:</span>`;html+=`<span class="property-value other">${this.formatPropertyValue(app[key],'other')}</span>`;html+=`</div>`;});html+=`</div></div>`;}html+='</div>';return html;}formatPropertyValue(value,type){if(value===null || value===undefined || value===''){return '<span class="property-empty">N/A</span>';}switch(type){case 'url':
return `<a href="${window.utils.escapeHtml(value)}" target="_blank" class="property-link">${window.utils.escapeHtml(value)}</a>`;case 'boolean':
return `<span class="property-boolean ${value ? 'true' : 'false'}">${value ? 'Yes' : 'No'}</span>`;case 'code':
return `<code class="property-code">${window.utils.escapeHtml(value)}</code>`;case 'date':
if(value){const date=new Date(value);return `<span class="property-date">${date.toLocaleDateString()}${date.toLocaleTimeString()}</span>`;}return '<span class="property-empty">N/A</span>';case 'version':
return `<span class="property-version">v${window.utils.escapeHtml(value)}</span>`;case 'badge':
return `<span class="property-badge">${window.utils.escapeHtml(value)}</span>`;case 'text':
return value ? `<span class="property-text">${window.utils.escapeHtml(value)}</span>` : '<span class="property-empty">N/A</span>';case 'color':
if(value){return `<span class="property-color">
<span class="color-swatch" style="background-color: ${window.utils.escapeHtml(value)}"></span>
${window.utils.escapeHtml(value)}</span>`;}return '<span class="property-empty">N/A</span>';case 'array':
if(Array.isArray(value)&& value.length > 0){return value.map(item=> `<span class="property-tag">${window.utils.escapeHtml(String(item))}</span>`).join('');}return '<span class="property-empty">None</span>';case 'description':
return value ? `<span class="property-description">${window.utils.escapeHtml(value)}</span>` : '<span class="property-empty">N/A</span>';case 'object':
if(value && typeof value==='object'){const uniqueId='obj-'+Math.random().toString(36).substr(2,9);return `<details class="property-object-details">
<summary class="property-object-summary">View Object(${Object.keys(value).length}properties)</summary>
<pre class="property-json">${JSON.stringify(value,null,2)}</pre>
</details>`;}return '<span class="property-empty">N/A</span>';case 'other':
if(typeof value==='object' && value !==null){if(Array.isArray(value)){if(value.length===0){return '<span class="property-empty">Empty array</span>';}if(typeof value[0]==='object'){const uniqueId='arr-'+Math.random().toString(36).substr(2,9);return `<details class="property-object-details">
<summary class="property-object-summary">View Array(${value.length}items)</summary>
<pre class="property-json">${JSON.stringify(value,null,2)}</pre>
</details>`;}return value.map(item=> `<span class="property-tag">${window.utils.escapeHtml(String(item))}</span>`).join('');}const uniqueId='obj-'+Math.random().toString(36).substr(2,9);return `<details class="property-object-details">
<summary class="property-object-summary">View Object(${Object.keys(value).length}properties)</summary>
<pre class="property-json">${JSON.stringify(value,null,2)}</pre>
</details>`;}return window.utils.escapeHtml(String(value));default:
if(typeof value==='object' && value !==null){if(Array.isArray(value)){if(value.length===0){return '<span class="property-empty">Empty array</span>';}return value.map(item=> `<span class="property-tag">${window.utils.escapeHtml(String(item))}</span>`).join('');}const uniqueId='obj-'+Math.random().toString(36).substr(2,9);return `<details class="property-object-details">
<summary class="property-object-summary">View Object(${Object.keys(value).length}properties)</summary>
<pre class="property-json">${JSON.stringify(value,null,2)}</pre>
</details>`;}return window.utils.escapeHtml(String(value));}}getNestedProperty(obj,path){return path.split('.').reduce((current,prop)=> current && current[prop],obj);}formatPropertyName(key){return key.replace(/([A-Z])/g,' $1').replace(/^./,str=> str.toUpperCase());}}function toggleDefinitionCollapse(collapseId){const content=document.getElementById(collapseId);const indicator=document.getElementById(collapseId+'-indicator');if(content && indicator){const isCollapsed=content.classList.contains('collapsed');if(isCollapsed){content.classList.remove('collapsed');indicator.textContent='▼';}else{content.classList.add('collapsed');indicator.textContent='▶';}}}window.toggleDefinitionCollapse=toggleDefinitionCollapse;window.DefinitionRenderer=DefinitionRenderer;window.definitionRenderer=new DefinitionRenderer();
