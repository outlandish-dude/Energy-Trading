# VoltShare Design System & Style Guide

## 📚 Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Components](#components)
4. [Spacing & Layout](#spacing--layout)
5. [Animations](#animations)
6. [Icons](#icons)
7. [Best Practices](#best-practices)

---

## 🎨 Color Palette

### Primary Colors
| Use Case | Color | Hex | Tailwind | Purpose |
|----------|-------|-----|----------|---------|
| Primary Action | Cyan | `#0ea5e9` | `cyan-500` | Main buttons, focus states |
| Secondary | Blue | `#0284c7` | `blue-600` | Headers, accents |
| Accent | Teal | `#06b6d4` | `cyan-600` | Interactive elements |

### Status Colors
| Status | Color | Hex | Tailwind | Usage |
|--------|-------|-----|----------|--------|
| Success | Green | `#10b981` | `green-500` | Positive actions, success states |
| Warning | Amber | `#f59e0b` | `amber-500` | Caution, in-progress |
| Danger | Red | `#ef4444` | `red-500` | Destructive, error states |
| Info | Sky | `#0284c7` | `sky-500` | Information, help text |

### Neutral Colors
| Use Case | Color | Hex | Tailwind |
|----------|-------|-----|----------|
| Background | Dark Navy | `#0f172a` | `slate-900` |
| Surface | Dark Blue | `#0c1f3a` | `blue-950` |
| Border | Gray | `#e5e7eb` | `gray-200` @ 10% opacity |
| Text | Light Gray | `#f3f4f6` | `gray-100` |
| Label | Medium Gray | `#9ca3af` | `gray-400` |

### Gradient Sets
```css
/* Primary Gradient */
linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)

/* Accent Gradient */
linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #0a5568 100%)

/* Danger Gradient */
linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)

/* Success Gradient */
linear-gradient(135deg, #065f46 0%, #047857 100%)
```

---

## 📝 Typography

### Font Stack
```
Primary: "Poppins", "Inter", sans-serif
Code: "Monaco", "monospace"
```

### Type Scale
| Level | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|-----------------|--------|
| H1 | 32px | 700 | 1.2 | -0.5px | Main page title |
| H2 | 24px | 700 | 1.3 | -0.25px | Section headers |
| H3 | 20px | 600 | 1.4 | 0px | Component titles |
| Body | 14px | 400 | 1.6 | 0px | Regular text |
| Label | 12px | 600 | 1.5 | 0.5px | Form labels, badges |
| Caption | 10px | 500 | 1.4 | 0.25px | Helper text, timestamps |

### Text Colors
```
Heading: #f3f4f6 (white)
Body: #d1d5db (gray-300)
Secondary: #9ca3af (gray-400)
Muted: #6b7280 (gray-500)
```

---

## 🧩 Components

### Button Component

#### Button Variants
```tsx
// Primary (Main CTA)
<motion.button className="btn btn-primary">
  <Icon size={16} />
  Action
</motion.button>

// Secondary (Default)
<motion.button className="btn btn-secondary">
  <Icon size={16} />
  Option
</motion.button>

// Success
<motion.button className="btn btn-success">
  <CheckIcon size={16} />
  Confirm
</motion.button>

// Danger
<motion.button className="btn btn-danger">
  <AlertIcon size={16} />
  Delete
</motion.button>

// Warning
<motion.button className="btn btn-warning">
  <WarningIcon size={16} />
  Caution
</motion.button>
```

#### Button Sizes
- `.btn-sm`: 12px padding, small text
- `.btn` (default): 16px padding, normal text
- `.btn-lg`: 24px padding, large text

#### Button States
```css
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-300;
  &:hover {
    @apply scale-105 shadow-lg;
  }
  &:active {
    @apply scale-95;
  }
  &:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
}
```

### Card Component

```tsx
// Basic Card
<div className="card">
  <h3 className="section-title">Title</h3>
  <p>Content</p>
</div>

// Stat Card (with StatCard component)
<StatCard
  label="Balance"
  value="₹2,500"
  color="blue"
  trend={{ value: 5, isPositive: true }}
/>

// Info Card
<InfoCard
  title="Title"
  description="Optional description"
  icon={IconComponent}
  highlighted={true}
/>
```

### Badge Component

```tsx
<Badge label="Active" variant="success" />
<Badge label="Pending" variant="warning" />
<Badge label="Error" variant="danger" />
<Badge label="Info" variant="info" />
```

### Progress Bar

```tsx
<ProgressBar
  value={75}
  max={100}
  label="Battery"
  color="cyan"
  animated={true}
/>
```

---

## 📏 Spacing & Layout

### Spacing Scale
```
2px  (1 unit)
4px  (2 units)
6px  (3 units)
8px  (4 units)
12px (6 units)
16px (8 units)
20px (10 units)
24px (12 units)
32px (16 units)
```

### Container
- Max width: 1200px (7xl)
- Padding: 24px on desktop, 16px on mobile
- Centered with mx-auto

### Grid Layout
```tsx
// Main layout
<div className="grid gap-6 xl:grid-cols-[1.8fr,1fr]">
  {/* Primary (larger) column */}
  {/* Sidebar (smaller) column */}
</div>

// Responsive adjustments
- Mobile: Single column
- Tablet: 2 columns with 1:1 ratio
- Desktop: 1.8:1 ratio
```

### Section Spacing
- Between sections: 24px gap
- Between cards: 16px gap
- Internal padding: 16px
- Compact cards: 12px

---

## ✨ Animations

### Entrance Animations
```tsx
// Page entrance
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}

// Slide up
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// Slide from left
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.5 }}

// Staggered children
transition={{ delayChildren: 0.1, staggerChildren: 0.05 }}
```

### Hover States
```tsx
whileHover={{ scale: 1.02, y: -2 }}
whileTap={{ scale: 0.95 }}
transition={{ duration: 0.2 }}
```

### Custom Animations
```css
/* Pulse */
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse-soft { animation: pulse-soft 3s infinite; }

/* Float */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
.animate-float { animation: float 3s ease-in-out infinite; }

/* Shimmer */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
.animate-shimmer { animation: shimmer 2s infinite; }
```

### Transition Defaults
- Duration: 300ms
- Easing: ease-in-out
- Duration on hover: 200ms

---

## 🎯 Icons

### Icon Library
Using `lucide-react` for all icons

### Icon Sizes
- Small: 14px (text inline)
- Default: 16px (buttons)
- Medium: 18px (section headers)
- Large: 24px (hero sections)
- XLarge: 32px+ (decorative)

### Icon Usage Examples
```tsx
import { Zap, TrendingUp, MapPin, Users, Truck, AlertCircle } from "lucide-react";

// In buttons
<button>
  <Zap size={16} />
  Find Charging
</button>

// In headers
<h3 className="flex items-center gap-2">
  <MapPin size={18} className="text-cyan-400" />
  Live Network Map
</h3>

// In cards
<div className="p-3 bg-blue-500/20 rounded-lg">
  <Zap size={24} className="text-white" />
</div>
```

### Icon Colors
- Primary icons: `text-cyan-400`
- Success icons: `text-green-400`
- Danger icons: `text-red-400`
- Warning icons: `text-amber-400`
- Info icons: `text-blue-400`
- Primary category: `text-purple-400`

---

## 📱 Responsive Design

### Breakpoints
```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: 1024px - 1280px
Large Desktop: > 1280px
```

### Responsive Classes
```tsx
// Text size
<h1 className="text-xl md:text-2xl lg:text-3xl">Title</h1>

// Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Padding
<div className="p-4 md:p-6 lg:p-8">

// Display
<div className="hidden md:block">Only on medium+</div>
```

---

## 🎨 Best Practices

### ✅ DO's
- Use consistent spacing (multiples of 2px)
- Keep animations under 500ms (should feel instant)
- Use semantic color meanings
- Add icon to buttons when possible
- Always include loading states
- Use glass morphism for overlays
- Maintain contrast ratios >= 4.5:1

### ❌ DON'Ts
- Don't use more than 2-3 animations on one element
- Don't animate opacity on hover for action items
- Don't use pure black/white (#000000, #ffffff)
- Don't add unnecessary animation delays
- Don't violate color semantics
- Don't use sans-serif for body text > 20px
- Don't nest shadows excessively

### Component Composition
```tsx
// ✅ Good: Reusable, consistent
<StatCard
  label="Users"
  value="42"
  color="blue"
  trend={{ value: 12, isPositive: true }}
/>

// ❌ Bad: One-off styling
<div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
  <p className="text-xs text-blue-400">Users</p>
  <p className="text-2xl font-bold">42</p>
</div>
```

### Accessibility
- Use semantic HTML (buttons, sections, headers)
- Include `alt` text for all meaningful images
- Ensure keyboard navigation works
- Maintain focus visible states
- Use proper contrast ratios
- Test with screen readers

---

## 📦 Export & Import Conventions

### Component Imports
```tsx
// UI Components
import { StatCard, InfoCard } from "@/components/ui/Cards";
import { Badge, ProgressBar, StatusIndicator } from "@/components/ui/Badge";
import { Header } from "@/components/ui/Header";
import { VoltShareLogo, BrandName } from "@/components/ui/Logo";

// Feature Components
import { IndiaMap } from "@/components/IndiaMap";
import { AdminPanel } from "@/components/AdminPanel";
import { BlockchainExplorer } from "@/components/BlockchainExplorer";
```

### Type Definitions
```tsx
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color?: "cyan" | "blue" | "green" | "amber" | "red";
}
```

---

## 🚀 Performance Tips

1. **Use CSS Grid for layouts** - More efficient than flex
2. **Lazy load images** - Use `loading="lazy"`
3. **Memoize components** - Use `React.memo()` for expensive renders
4. **Optimize animations** - Use `transform` and `opacity` only
5. **Bundle icons smartly** - Only import used icons
6. **Debounce scroll listeners** - For better performance

---

## 📞 Support & Questions

For design system questions:
1. Check this style guide
2. Review component implementation in `src/components/ui/`
3. Refer to Tailwind documentation
4. Check Framer Motion animation examples

---

**Last Updated**: March 3, 2026  
**Version**: 1.0  
**System**: VoltShare Design System v2.0
