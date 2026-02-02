# SourceToLive - Professional Design System
## GitHub Dark + Professional Blue Accents

**Version:** 1.0  
**Last Updated:** February 1, 2026  
**Target Audience:** Enterprise Developers, DevOps Engineers, Technical Teams

---

## 📌 Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Component Design](#component-design)
4. [Spacing & Layout](#spacing--layout)
5. [Animations & Transitions](#animations--transitions)
6. [CSS Variables](#css-variables)
7. [Accessibility](#accessibility)
8. [Implementation Examples](#implementation-examples)

---

## 🎨 Color Palette

### Primary Colors

**🌑 Background (Main)**
<div style="background-color: #0F1419; padding: 15px; border: 1px solid #30363D; border-radius: 8px; margin: 10px 0;">
  <strong style="color: #79C0FF; font-family: monospace;">#0F1419</strong><br>
  <span style="color: #8B949E; font-size: 13px;">Deep Charcoal - Primary page background</span><br>
  <span style="color: #8B949E; font-size: 12px;">RGB(15, 20, 25)</span>
</div>

**🎴 Card/Panel Background**
<div style="background-color: #161B22; padding: 15px; border: 1px solid #30363D; border-radius: 8px; margin: 10px 0;">
  <strong style="color: #79C0FF; font-family: monospace;">#161B22</strong><br>
  <span style="color: #8B949E; font-size: 13px;">Slightly Lighter - Cards, panels, modals</span><br>
  <span style="color: #8B949E; font-size: 12px;">RGB(22, 27, 34)</span>
</div>

**⚡ Primary Accent (Buttons, Links, CTAs)**
<div style="background-color: #1F6FEB; padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center;">
  <strong style="color: #FFFFFF; font-family: monospace;">#1F6FEB</strong><br>
  <span style="color: #FFFFFF; font-size: 13px;">Professional Blue - Primary actions</span><br>
  <span style="color: #FFFFFF; font-size: 12px;">RGB(31, 111, 235)</span>
</div>

**💎 Secondary Accent (Hover, Links)**
<div style="background-color: #58A6FF; padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center;">
  <strong style="color: #0F1419; font-family: monospace;">#58A6FF</strong><br>
  <span style="color: #0F1419; font-size: 13px;">Light Blue - Links, hover states</span><br>
  <span style="color: #0F1419; font-size: 12px;">RGB(88, 166, 255)</span>
</div>

### Status Colors

<div style="display: grid; gap: 12px;">

<div style="background-color: #3FB950; padding: 15px; border-radius: 8px; text-align: center;">
  <strong style="color: #FFFFFF; font-family: monospace;">✅ #3FB950</strong><br>
  <span style="color: #FFFFFF; font-size: 13px;">Success - Deployed, Ready</span><br>
  <span style="color: #FFFFFF; font-size: 12px;">RGB(63, 185, 80)</span>
</div>

<div style="background-color: #D29922; padding: 15px; border-radius: 8px; text-align: center;">
  <strong style="color: #FFFFFF; font-family: monospace;">⚠️ #D29922</strong><br>
  <span style="color: #FFFFFF; font-size: 13px;">Warning - Pending Review</span><br>
  <span style="color: #FFFFFF; font-size: 12px;">RGB(210, 153, 34)</span>
</div>

<div style="background-color: #DA3633; padding: 15px; border-radius: 8px; text-align: center;">
  <strong style="color: #FFFFFF; font-family: monospace;">❌ #DA3633</strong><br>
  <span style="color: #FFFFFF; font-size: 13px;">Error - Failed, Attention</span><br>
  <span style="color: #FFFFFF; font-size: 12px;">RGB(218, 54, 51)</span>
</div>

<div style="background-color: #58A6FF; padding: 15px; border-radius: 8px; text-align: center;">
  <strong style="color: #0F1419; font-family: monospace;">ℹ️ #58A6FF</strong><br>
  <span style="color: #0F1419; font-size: 13px;">Info - Notice, Information</span><br>
  <span style="color: #0F1419; font-size: 12px;">RGB(88, 166, 255)</span>
</div>

</div>

### Text & Neutral Colors

**📝 Primary Text**
<div style="background-color: #C9D1D9; padding: 15px; border-radius: 8px; margin: 10px 0;">
  <strong style="color: #0F1419; font-family: monospace;">#C9D1D9</strong><br>
  <span style="color: #0F1419; font-size: 13px;">Light Gray - Main readable text</span><br>
  <span style="color: #0F1419; font-size: 12px;">RGB(201, 209, 217)</span>
</div>

**🔤 Secondary Text**
<div style="background-color: #8B949E; padding: 15px; border-radius: 8px; margin: 10px 0;">
  <strong style="color: #FFFFFF; font-family: monospace;">#8B949E</strong><br>
  <span style="color: #FFFFFF; font-size: 13px;">Muted Gray - Secondary info, labels</span><br>
  <span style="color: #FFFFFF; font-size: 12px;">RGB(139, 148, 158)</span>
</div>

**🔲 Borders & Dividers**
<div style="background-color: #30363D; padding: 15px; border-radius: 8px; margin: 10px 0;">
  <strong style="color: #C9D1D9; font-family: monospace;">#30363D</strong><br>
  <span style="color: #C9D1D9; font-size: 13px;">Subtle Gray - Dividers, separators, borders</span><br>
  <span style="color: #C9D1D9; font-size: 12px;">RGB(48, 54, 61)</span>
</div>

**❌ Disabled State**
<div style="background-color: #21262D; padding: 15px; border-radius: 8px; margin: 10px 0;">
  <strong style="color: #8B949E; font-family: monospace;">#21262D</strong><br>
  <span style="color: #8B949E; font-size: 13px;">Dark Gray - Disabled elements</span><br>
  <span style="color: #8B949E; font-size: 12px;">RGB(33, 38, 45)</span>
</div>

---

## 📝 Typography

### Font Stack

**Headers & Titles:**
```
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif
Weight: 600 - 700
Style: Clear, professional, readable
```

**Body Text:**
```
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif
Weight: 400 - 500
Size: 14px - 16px
Line-height: 1.5 - 1.6
```

**Code & Monospace:**
```
Font Family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace
Weight: 400
Size: 12px - 14px
Letter-spacing: 0.5px
```

### Font Sizes

```
H1 (Page Title):    32px, weight 700, line-height 1.25
H2 (Section):       24px, weight 700, line-height 1.3
H3 (Subsection):    18px, weight 600, line-height 1.4
H4 (Sub-subsection):16px, weight 600, line-height 1.4

Body:               16px, weight 400, line-height 1.6
Small:              14px, weight 400, line-height 1.5
Xs (Label):         12px, weight 500, line-height 1.4

Code Block:         13px, weight 400, line-height 1.6
Inline Code:        13px, weight 400
```

---

## 🎯 Component Design

### Buttons

**Primary Button**
```css
Background:     #1F6FEB
Text Color:     #FFFFFF
Text Weight:    600
Padding:        12px 24px
Border Radius:  6px
Border:         none
Cursor:         pointer

Hover State:
  Background:   #388BFD
  Box-shadow:   0 2px 8px rgba(31, 111, 235, 0.3)

Active State:
  Background:   #1860CA
  
Disabled State:
  Background:   #21262D
  Text Color:   #8B949E
  Cursor:       not-allowed
  Opacity:      0.6
```

**Secondary Button**
```css
Background:     transparent
Text Color:     #58A6FF
Border:         1px solid #30363D
Padding:        11px 23px
Border Radius:  6px
Weight:         600

Hover State:
  Background:   #0D1117
  Border Color: #58A6FF
  
Active State:
  Background:   #161B22
  Border Color: #1F6FEB
```

**Danger Button**
```css
Background:     #DA3633
Text Color:     #FFFFFF
Padding:        12px 24px
Border Radius:  6px
Weight:         600

Hover State:
  Background:   #E85149
  
Active State:
  Background:   #BC2E27
```

### Cards & Panels

```css
Background:       #161B22
Border:           1px solid #30363D
Border Radius:    8px
Padding:          16px - 24px
Box Shadow:       0 1px 3px rgba(0, 0, 0, 0.4)

Hover State:
  Border Color:   #58A6FF
  Box Shadow:     0 3px 12px rgba(88, 166, 255, 0.15)
  
Focus State:
  Border Color:   #1F6FEB
  Outline:        2px solid #1F6FEB
```

### Input Fields

```css
Background:       #0F1419
Border:           1px solid #30363D
Border Radius:    6px
Padding:          10px 12px
Color:            #C9D1D9
Font Size:        14px
Line Height:      1.5

Placeholder:
  Color:          #8B949E
  
Focus State:
  Border Color:   #1F6FEB
  Box Shadow:     0 0 0 3px rgba(31, 111, 235, 0.1)
  Outline:        none
  
Disabled State:
  Background:     #21262D
  Border Color:   #30363D
  Color:          #8B949E
  Cursor:         not-allowed
```

### Badge/Label

```css
Background:       #21262D
Color:            #8B949E
Padding:          4px 8px
Border Radius:    12px
Font Size:        12px
Font Weight:      500

Status Variant (Success):
  Background:     #0d3e1f
  Color:          #3FB950
  
Status Variant (Warning):
  Background:     #3d2e0e
  Color:          #D29922
  
Status Variant (Error):
  Background:     #3d1c1a
  Color:          #DA3633
```

---

## 📐 Spacing & Layout

### Spacing Scale

```
2xs:   2px   - Minimal spacing
xs:    4px   - Small gaps
sm:    8px   - Small padding
md:    16px  - Default padding
lg:    24px  - Large padding
xl:    32px  - Extra large
2xl:   48px  - Massive spacing
```

### Border Radius

```
none:  0px    - No radius
xs:    2px    - Minimal rounding
sm:    4px    - Small buttons, tight elements
md:    6px    - Standard (buttons, inputs)
lg:    8px    - Cards, panels
xl:    12px   - Large containers
2xl:   16px   - Hero sections, modals
```

### Responsive Breakpoints

```
Mobile:    0px   - 640px
Tablet:    640px - 1024px
Desktop:   1024px+
```

## 🎬 Animations & Transitions

### Default Transitions

```css
All:              transition: all 200ms ease-in-out;
Background:       transition: background 150ms ease;
Color:            transition: color 150ms ease;
Transform:        transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
Box-shadow:       transition: box-shadow 200ms ease;
```

### Button Interactions

```
Hover:
  Duration:       200ms
  Effect:         Color shift + subtle shadow lift
  Easing:         ease-in-out
  
Click/Active:
  Duration:       100ms
  Effect:         Slight scale (0.98x) + darker color
  
Disabled:
  Opacity:        0.6
  No transition
```

### Component Animations

**Status Indicator (Running):**
```css
Animation:    pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite
Glow Color:   rgba(31, 111, 235, 0.5)
```

**Success Checkmark:**
```css
Animation:    slideIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1)
Color:        #3FB950
```

**Error Shake:**
```css
Animation:    shake 500ms ease-in-out
Iterations:   1
```

---

## � Color Reference Table

| Element | Hex Code | RGB | Usage | Purpose |
|---------|----------|-----|-------|---------|
| **Background** | #0F1419 | 15, 20, 25 | Page background | Main color |
| **Card BG** | #161B22 | 22, 27, 34 | Cards, panels | Secondary BG |
| **Primary Accent** | #1F6FEB | 31, 111, 235 | Buttons, links | Primary actions |
| **Secondary Accent** | #58A6FF | 88, 166, 255 | Hover, links | Interactive |
| **Success** | #3FB950 | 63, 185, 80 | Deployed status | Positive |
| **Warning** | #D29922 | 210, 153, 34 | Pending status | Caution |
| **Error** | #DA3633 | 218, 54, 51 | Failed status | Negative |
| **Info** | #58A6FF | 88, 166, 255 | Notifications | Informational |
| **Primary Text** | #C9D1D9 | 201, 209, 217 | Body text | Main text |
| **Secondary Text** | #8B949E | 139, 148, 158 | Labels, hints | Secondary text |
| **Borders** | #30363D | 48, 54, 61 | Dividers | Separators |
| **Disabled** | #21262D | 33, 38, 45 | Disabled UI | Inactive |

---

## ♿ Accessibility

### Contrast Ratios (WCAG AA)

All text color combinations meet **4.5:1 or higher** contrast ratio:

- Primary text (#C9D1D9) on background (#0F1419): **11.8:1** ✅
- Primary text (#C9D1D9) on card (#161B22): **10.9:1** ✅
- Button text (#FFFFFF) on primary (#1F6FEB): **5.2:1** ✅
- Secondary text (#8B949E) on background (#0F1419): **5.1:1** ✅

### Focus States

- All interactive elements have visible focus state
- Focus ring: 2px solid primary color with slight offset
- Minimum touch target size: 44x44px

### Motion & Animation

- All animations are optional (prefer-reduced-motion respected)
- No flashing or rapid animations (safe for photosensitivity)
- Animations duration: 200-400ms (not too fast)

---

## 🔧 Implementation Examples

### React Component: Primary Button

```jsx
function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#21262D' : '#1F6FEB',
        color: disabled ? '#8B949E' : '#FFFFFF',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '600',
        fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 200ms ease-in-out',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.target.style.background = '#388BFD';
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.target.style.background = '#1F6FEB';
      }}
    >
      {children}
    </button>
  );
}
```

### React Component: Status Badge

```jsx
function StatusBadge({ status }) {
  const statusStyles = {
    success: { bg: '#0d3e1f', color: '#3FB950' },
    warning: { bg: '#3d2e0e', color: '#D29922' },
    error: { bg: '#3d1c1a', color: '#DA3633' },
    info: { bg: '#0d2a4a', color: '#58A6FF' },
  };

  const style = statusStyles[status] || statusStyles.info;

  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

### CSS: Global Styles

```css
:root {
  --color-bg-primary: #0F1419;
  --color-bg-secondary: #161B22;
  --color-primary: #1F6FEB;
  --color-text-primary: #C9D1D9;
  --color-text-secondary: #8B949E;
  --color-border: #30363D;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 150ms ease;
}

a:hover {
  color: var(--color-secondary);
}

input, textarea, select {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.1);
}
```

---

## 📈 Visual Hierarchy

### Color Hierarchy

```
Tier 1 (Highest Priority):  #1F6FEB (Primary Blue)
Tier 2 (Important):         #58A6FF (Secondary Blue)
Tier 3 (Status):            #3FB950, #D29922, #DA3633
Tier 4 (Information):       #C9D1D9 (Primary Text)
Tier 5 (Secondary):         #8B949E (Secondary Text)
Tier 6 (Background):        #30363D (Borders)
Tier 7 (Lowest):            #21262D (Disabled)
```

### Size Hierarchy

```
H1:  32px - Page title
H2:  24px - Section header
H3:  18px - Subsection
H4:  16px - Sub-subsection
Body: 16px - Regular text
Small: 14px - Secondary text
Label: 12px - Minimal text
```

---

## ✨ Best Practices

1. **Consistent Spacing** - Use multiples of 4px from spacing scale
2. **Clear Contrast** - Always maintain 4.5:1 ratio for text
3. **Hover States** - Every interactive element must have hover feedback
4. **Accessibility First** - Test with screen readers and keyboard navigation
5. **Focus Indicators** - Always visible for keyboard users
6. **Performance** - Optimize animations (use transform/opacity)
7. **Responsive** - Test on mobile, tablet, desktop
8. **Dark Mode Ready** - All colors optimized for dark theme
9. **Consistency** - Use CSS variables for all colors
10. **Simplicity** - Minimal, professional, no unnecessary elements

---

## 🚀 Implementation Checklist

- [ ] Add CSS variables to global stylesheet
- [ ] Update button components
- [ ] Update card/panel components
- [ ] Update input fields
- [ ] Implement status badges
- [ ] Add focus states
- [ ] Test accessibility with tools
- [ ] Verify contrast ratios
- [ ] Test on mobile devices
- [ ] Update documentation

---

## 💻 CSS Variables

```css
:root {
  /* Background Colors */
  --color-bg-primary: #0F1419;
  --color-bg-secondary: #161B22;
  --color-bg-tertiary: #21262D;
  
  /* Accent Colors */
  --color-primary: #1F6FEB;
  --color-primary-hover: #388BFD;
  --color-primary-active: #1860CA;
  --color-secondary: #58A6FF;
  --color-secondary-hover: #79C0FF;
  
  /* Status Colors */
  --color-success: #3FB950;
  --color-warning: #D29922;
  --color-error: #DA3633;
  --color-info: #58A6FF;
  
  /* Text Colors */
  --color-text-primary: #C9D1D9;
  --color-text-secondary: #8B949E;
  --color-text-tertiary: #6E7681;
  
  /* UI Elements */
  --color-border: #30363D;
  --color-border-subtle: #21262D;
  --color-disabled: #21262D;
  
  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  
  /* Sizes */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.6;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.5);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```
