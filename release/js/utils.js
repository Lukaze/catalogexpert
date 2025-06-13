class Utils{static escapeHtml(text){if(typeof text !=='string')return text;const div=document.createElement('div');div.textContent=text;return div.innerHTML;}
static formatDate(dateString){if(!dateString)return 'N/A';try{return new Date(dateString).toLocaleDateString();} catch(error){return 'Invalid Date';}
}
static formatUrl(url){if(!url)return 'N/A';return `<a href="${url}" target="_blank">${url}</a>`;}
static createAppIconHtml(iconUrl){if(iconUrl){return `<img src="${iconUrl}" alt="App icon" onerror="this.parentElement.innerHTML='<div class=\\'card-icon-placeholder\\'>${iconUrl.split('/').pop().charAt(0).toUpperCase()}</div>'">`;} else{return `<div class="card-icon-placeholder">?</div>`;}
}
static createSmallAppIconHtml(iconUrl){return iconUrl ? `<img src="${iconUrl}" alt="" class="small-icon" onerror="this.style.display='none'">` : '';}
static getAppDisplayName(app,appId){return Utils.escapeHtml(app.name || appId);}
static createAppItemHtml(app,appId,iconUrl){const iconHtml=Utils.createSmallAppIconHtml(iconUrl);const displayName=Utils.getAppDisplayName(app,appId);return `${iconHtml}${displayName}`;}
static createAudienceVersionsHtml(audienceMap){return Array.from(audienceMap.entries()).map(([audience,app])=>{const shorthand=Utils.getAudienceGroupShorthand(audience);return `
<div class="detail-item">
<span class="detail-label">${shorthand}:</span>
<span class="detail-value">
v${app.version}
${app.sourceType ? `<span class="tag" style="margin-left: 8px;font-size: 0.7rem;">${app.sourceType}</span>` : ''}
</span>
</div>
`;}).join('');}
static getAudienceGroupShorthand(audienceGroup){const shorthandMap={'general': 'R4','ring0': 'R0','ring1': 'R1','ring1_5': 'R1.5','ring1_6': 'R1.6','ring2': 'R2','ring3': 'R3','ring3_6': 'R3.6','ring3_9': 'R3.9','staff': 'Staff'
};return shorthandMap[audienceGroup.toLowerCase()]|| audienceGroup;}
static get CONSTANTS(){return{UNKNOWN_APP: 'Unknown App',UNKNOWN_DEVELOPER: 'Unknown',VERSION_NA: 'N/A',CLICK_TO_VIEW: 'Click to view details →',LOADING_MESSAGE: 'Loading...',NO_RESULTS: 'No results found',CORE_APP_BADGE: 'Core App',TEAMS_OWNED_BADGE: 'Teams Owned'
};}
static get AUDIENCE_GROUPS(){return['general','ring0','ring1','ring1_5','ring1_6','ring2','ring3','ring3_6','ring3_9'];}
}
window.Utils=Utils;window.utils=Utils;
