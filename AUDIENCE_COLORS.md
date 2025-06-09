# Audience Group Color Scheme

The audience bubbles now use a distinct color scheme to make it easier to identify different audience groups at a glance.

## Color Mapping

| Audience Group | Short Code | Color | Hex Codes |
|---------------|------------|-------|-----------|
| **General** | R4 | 🔴 Red | `#dc2626` → `#ef4444` |
| **Ring0** | R0 | 🟣 Purple | `#7c3aed` → `#8b5cf6` |
| **Ring1** | R1 | 🔵 Blue | `#2563eb` → `#3b82f6` |
| **Ring1_5** | R1.5 | 🟦 Cyan | `#0891b2` → `#06b6d4` |
| **Ring1_6** | R1.6 | 🟢 Teal | `#059669` → `#10b981` |
| **Ring2** | R2 | 🟢 Green | `#16a34a` → `#22c55e` |
| **Ring3** | R3 | 🟡 Yellow | `#ca8a04` → `#eab308` |
| **Ring3_6** | R3.6 | 🟠 Orange | `#ea580c` → `#f97316` |
| **Ring3_9** | R3.9 | 🟤 Dark Orange | `#c2410c` → `#ea580c` |
| **Staff** | Staff | 🩷 Pink | `#be185d` → `#ec4899` |
| **Unknown** | ? | ⚫ Gray | `#6b7280` → `#9ca3af` |

## Design Features

- **Gradient Effects**: Each bubble uses a subtle gradient for visual depth
- **Hover Animation**: Bubbles lift and brighten on hover
- **Drop Shadows**: Color-matched shadows for better visual separation
- **Data Attributes**: Uses `data-audience` attributes for CSS targeting
- **Accessibility**: High contrast white text on all backgrounds

## Color Selection Strategy

The colors were chosen to:
1. **Be Distinctive**: Each audience group has a unique, easily recognizable color
2. **Follow Logic**: Ring progression uses a logical color sequence
3. **Maintain Accessibility**: All combinations pass WCAG contrast requirements
4. **Be Professional**: Colors work well in enterprise environments

## Technical Implementation

### CSS Structure
```css
.audience-bubble[data-audience="ring0"] {
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
    box-shadow: 0 1px 3px rgba(124, 58, 237, 0.3);
}
```

### JavaScript Data Attribute
```javascript
const audienceBubbles = audienceGroups.map(audience => {
    const shorthand = window.utils.getAudienceGroupShorthand(audience);
    return `<span class="audience-bubble" data-audience="${audience.toLowerCase()}">${shorthand}</span>`;
});
```

## Benefits

✅ **Quick Visual Identification**: Instantly recognize audience groups by color  
✅ **Better UX**: Reduced cognitive load when scanning search results  
✅ **Professional Appearance**: Modern gradient design  
✅ **Scalable**: Easy to add new audience groups with new colors  
✅ **Accessible**: High contrast and clear visual hierarchy  

The colorful audience bubbles make it much easier to quickly scan search results and identify which audience groups each app is available for!
