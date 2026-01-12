# Wedding Vendor Chronicles - Component Breakdown

**Last Updated:** November 13, 2025
**Total Components:** 139 in src/components + 36 in app/ = **175 Total Components**
**Framework:** React 18.3.1 + Next.js 15.0.3 + TypeScript 5.5.3

---

## Table of Contents

1. [Next.js App Components (App Router)](#nextjs-app-components)
2. [Legacy React Components (src/components)](#legacy-react-components)
3. [UI Components Library (shadcn/ui)](#ui-components-library)
4. [Component Categories](#component-categories)
5. [Page Components (Legacy)](#page-components-legacy)
6. [Component Dependencies](#component-dependencies)

---

## Next.js App Components (App Router)

### Location: `app/`

These are the new Next.js 15 components using the App Router architecture. All components follow the Server Component pattern with 'use client' directives for interactive sections.

#### Pages (19 Routes)

| File | Route | Type | Purpose |
|------|-------|------|---------|
| `app/page.tsx` | `/` | Server | Home page entry point |
| `app/layout.tsx` | - | Layout | Root layout with providers |
| `app/auth/page.tsx` | `/auth` | Server | Authentication page |
| `app/auth/callback/page.tsx` | `/auth/callback` | Server | OAuth callback handler |
| `app/auth/test/page.tsx` | `/auth/test` | Server | Auth testing page |
| `app/portal/page.tsx` | `/portal` | Server | User dashboard |
| `app/vendor-dashboard/page.tsx` | `/vendor-dashboard` | Server | Vendor management |
| `app/category/[category]/page.tsx` | `/category/[category]` | Dynamic | Category browsing |
| `app/search/[category]/[state]/[city]/page.tsx` | `/search/...` | Dynamic | Multi-level search |
| `app/states/page.tsx` | `/states` | Server | All states listing |
| `app/states/[state]/page.tsx` | `/states/[state]` | Dynamic | State detail page |
| `app/states/[state]/[city]/page.tsx` | `/states/[state]/[city]` | Dynamic | City detail page |
| `app/vendor/[id]/page.tsx` | `/vendor/[id]` | Dynamic | Vendor detail page |
| `app/match-me/page.tsx` | `/match-me` | Server | Cultural matching quiz |
| `app/match-me/results/page.tsx` | `/match-me/results` | Server | Quiz results |
| `app/favorites/page.tsx` | `/favorites` | Server | Saved vendors |
| `app/list-business/page.tsx` | `/list-business` | Server | Business listing form |
| `app/admin/page.tsx` | `/admin` | Server | Admin dashboard |
| `app/privacy/page.tsx` | `/privacy` | Server | Privacy policy |
| `app/terms/page.tsx` | `/terms` | Server | Terms of service |
| `app/posthog-test/page.tsx` | `/posthog-test` | Server | Analytics testing |

#### Shared Client Components (app/_components/)

| Component | File | Purpose | Used By |
|-----------|------|---------|---------|
| **HomePage** | `app/_components/HomePage.tsx` | Main homepage with hero, search, categories | `/` |
| **ClientMainNav** | `app/_components/ClientMainNav.tsx` | Navigation bar with auth state | All pages (layout) |
| **ClientFooter** | `app/_components/ClientFooter.tsx` | Footer with links and social | All pages (layout) |
| **SearchContainerClient** | `app/_components/SearchContainerClient.tsx` | Main search interface with filters | Home, search pages |

#### Feature-Specific Client Components

| Component | File | Purpose | Page |
|-----------|------|---------|------|
| **MatchMeClient** | `app/match-me/MatchMeClient.tsx` | Cultural matching quiz interface | `/match-me` |
| **MatchResultsClient** | `app/match-me/results/MatchResultsClient.tsx` | Quiz results with vendor matches | `/match-me/results` |
| **ListBusinessClient** | `app/list-business/ListBusinessClient.tsx` | Business listing form | `/list-business` |
| **FavoritesClient** | `app/favorites/FavoritesClient.tsx` | Favorites management | `/favorites` |
| **AdminPanelClient** | `app/admin/AdminPanelClient.tsx` | Admin dashboard interface | `/admin` |
| **StatesPageClient** | `app/states/_components/StatesPageClient.tsx` | States grid display | `/states` |
| **StateDetailClient** | `app/states/[state]/StateDetailClient.tsx` | State detail view | `/states/[state]` |
| **CityDetailClient** | `app/states/[state]/[city]/CityDetailClient.tsx` | City detail view | `/states/[state]/[city]` |
| **VendorDetailClient** | `app/vendor/[id]/VendorDetailClient.tsx` | Vendor profile view | `/vendor/[id]` |

#### Providers

| Component | File | Purpose |
|-----------|------|---------|
| **PostHogProvider** | `app/providers/PostHogProvider.tsx` | Analytics provider wrapper |

---

## Legacy React Components (src/components)

### Location: `src/components/`

These are React components from the Vite/React Router era. Many are still used by Next.js pages during the migration.

### Component Count by Category

| Category | Count | Purpose |
|----------|-------|---------|
| **UI Components** | 51 | shadcn/ui design system |
| **Search Components** | 21 | Vendor search and filtering |
| **Home Components** | 3 | Homepage sections |
| **Portal Components** | 14 | User dashboard and planning |
| **Admin Components** | 1 | Admin interface |
| **Auth Components** | 2 | Authentication forms |
| **Vendor Components** | 6 | Vendor-specific features |
| **Cultural Components** | 2 | Cultural matching |
| **Hashtag Components** | 4 | Hashtag generator |
| **Timeline Components** | 4 | Wedding timeline |
| **SEO Components** | 3 | SEO and metadata |
| **Error Boundaries** | 4 | Error handling |
| **Subscription Components** | 1 | Payment/subscriptions |
| **Utility Components** | 23 | Misc reusable components |
| **TOTAL** | **139** | |

---

## UI Components Library (shadcn/ui)

### Location: `src/components/ui/`

**Total:** 51 components
**Library:** shadcn/ui (Radix UI primitives + Tailwind CSS)

#### Form & Input Components (13)

| Component | File | Purpose | Radix Primitive |
|-----------|------|---------|-----------------|
| **Button** | `button.tsx` | Clickable buttons with variants | - |
| **Input** | `input.tsx` | Text input fields | - |
| **Textarea** | `textarea.tsx` | Multi-line text input | - |
| **Checkbox** | `checkbox.tsx` | Checkbox input | @radix-ui/checkbox |
| **Radio Group** | `radio-group.tsx` | Radio button groups | @radix-ui/radio-group |
| **Switch** | `switch.tsx` | Toggle switch | @radix-ui/switch |
| **Select** | `select.tsx` | Dropdown select | @radix-ui/select |
| **Form** | `form.tsx` | Form context wrapper | react-hook-form |
| **Label** | `label.tsx` | Form labels | @radix-ui/label |
| **Slider** | `slider.tsx` | Range slider | @radix-ui/slider |
| **Calendar** | `calendar.tsx` | Date picker calendar | react-day-picker |
| **Input OTP** | `input-otp.tsx` | OTP/verification code input | input-otp |
| **Command** | `command.tsx` | Command palette/search | cmdk |

#### Layout & Navigation Components (10)

| Component | File | Purpose | Radix Primitive |
|-----------|------|---------|-----------------|
| **Card** | `card.tsx` | Content cards | - |
| **Separator** | `separator.tsx` | Visual dividers | @radix-ui/separator |
| **Accordion** | `accordion.tsx` | Expandable sections | @radix-ui/accordion |
| **Tabs** | `tabs.tsx` | Tab navigation | @radix-ui/tabs |
| **Table** | `table.tsx` | Data tables | - |
| **Breadcrumb** | `breadcrumb.tsx` | Navigation breadcrumbs | - |
| **Navigation Menu** | `navigation-menu.tsx` | Main navigation | @radix-ui/navigation-menu |
| **Menubar** | `menubar.tsx` | Application menu bar | @radix-ui/menubar |
| **Sidebar** | `sidebar.tsx` | Sidebar navigation | - |
| **Pagination** | `pagination.tsx` | Page navigation | - |

#### Overlay & Modal Components (9)

| Component | File | Purpose | Radix Primitive |
|-----------|------|---------|-----------------|
| **Dialog** | `dialog.tsx` | Modal dialogs | @radix-ui/dialog |
| **Alert Dialog** | `alert-dialog.tsx` | Confirmation dialogs | @radix-ui/alert-dialog |
| **Sheet** | `sheet.tsx` | Slide-out panels | @radix-ui/dialog |
| **Drawer** | `drawer.tsx` | Bottom/side drawers | vaul |
| **Popover** | `popover.tsx` | Floating popovers | @radix-ui/popover |
| **Dropdown Menu** | `dropdown-menu.tsx` | Dropdown menus | @radix-ui/dropdown-menu |
| **Context Menu** | `context-menu.tsx` | Right-click menus | @radix-ui/context-menu |
| **Tooltip** | `tooltip.tsx` | Hover tooltips | @radix-ui/tooltip |
| **Hover Card** | `hover-card.tsx` | Hover preview cards | @radix-ui/hover-card |

#### Feedback & Display Components (11)

| Component | File | Purpose | Radix Primitive |
|-----------|------|---------|-----------------|
| **Toast** | `toast.tsx` | Toast notifications | @radix-ui/toast |
| **Toaster** | `toaster.tsx` | Toast container | @radix-ui/toast |
| **Sonner** | `sonner.tsx` | Alternative toast (Sonner) | sonner |
| **Alert** | `alert.tsx` | Alert messages | - |
| **Badge** | `badge.tsx` | Status badges | - |
| **Avatar** | `avatar.tsx` | User avatars | @radix-ui/avatar |
| **Progress** | `progress.tsx` | Progress bars | @radix-ui/progress |
| **Skeleton** | `skeleton.tsx` | Loading skeletons | - |
| **Scroll Area** | `scroll-area.tsx` | Custom scrollbars | @radix-ui/scroll-area |
| **Chart** | `chart.tsx` | Chart components | recharts |
| **Carousel** | `carousel.tsx` | Image/content carousel | embla-carousel |

#### Utility Components (8)

| Component | File | Purpose | Radix Primitive |
|-----------|------|---------|-----------------|
| **Aspect Ratio** | `aspect-ratio.tsx` | Maintain aspect ratio | @radix-ui/aspect-ratio |
| **Collapsible** | `collapsible.tsx` | Collapsible sections | @radix-ui/collapsible |
| **Resizable** | `resizable.tsx` | Resizable panels | react-resizable-panels |
| **Toggle** | `toggle.tsx` | Toggle buttons | @radix-ui/toggle |
| **Toggle Group** | `toggle-group.tsx` | Toggle button groups | @radix-ui/toggle-group |
| **Image Optimized** | `image-optimized.tsx` | Lazy-loaded images | - |
| **List Business Button** | `list-business-button.tsx` | CTA button | - |
| **use-toast** | `use-toast.ts` | Toast hook | - |

---

## Component Categories

### 1. Search Components (21 components)

**Location:** `src/components/search/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **SearchContainer** | `SearchContainer.tsx` | Main search wrapper | Container |
| **SearchForm** | `SearchForm.tsx` | Search input form | Form |
| **SearchButton** | `SearchButton.tsx` | Search submit button | UI |
| **SearchHeader** | `SearchHeader.tsx` | Search page header | Layout |
| **SearchResults** | `SearchResults.tsx` | Results display grid | Display |
| **SearchSkeleton** | `SearchSkeleton.tsx` | Loading state | Loading |
| **VendorCard** | `VendorCard.tsx` | Individual vendor card | Display |
| **InstagramVendorCard** | `InstagramVendorCard.tsx` | Instagram vendor card | Display |
| **VendorContactInfo** | `VendorContactInfo.tsx` | Contact information | Display |
| **RatingDisplay** | `RatingDisplay.tsx` | Star ratings | Display |
| **LocationSelects** | `LocationSelects.tsx` | Location dropdowns | Form |
| **TempLocationSelects** | `TempLocationSelects.tsx` | Temporary location picker | Form |
| **CategorySelect** | `CategorySelect.tsx` | Category dropdown | Form |
| **StateCard** | `StateCard.tsx` | State preview card | Display |
| **CityCard** | `CityCard.tsx` | City preview card | Display |
| **StateGrid** | `StateGrid.tsx` | State grid layout | Layout |
| **EnhancedStateGrid** | `EnhancedStateGrid.tsx` | Enhanced state grid | Layout |
| **CityGrid** | `CityGrid.tsx` | City grid layout | Layout |
| **LocationHeader** | `LocationHeader.tsx` | Location page header | Layout |
| **StateWideResults** | `StateWideResults.tsx` | State-wide search results | Display |
| **LoadMoreButton** | `LoadMoreButton.tsx` | Pagination button | UI |
| **VendorSearchModal** | `VendorSearchModal.tsx` | Search modal overlay | Modal |
| **MobileTabContainer** | `MobileTabContainer.tsx` | Mobile tab navigation | Layout |
| **ComingSoonBanner** | `ComingSoonBanner.tsx` | Coming soon message | Display |
| **LoadingState** | `LoadingState.tsx` | Loading indicator | Loading |

**Tests:**
- `__tests__/VendorCard.test.tsx` - Unit tests for VendorCard

---

### 2. Home Components (3 components)

**Location:** `src/components/home/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **HeroSection** | `HeroSection.tsx` | Homepage hero with CTA | Section |
| **SearchSection** | `SearchSection.tsx` | Homepage search bar | Section |
| **CategoriesGrid** | `CategoriesGrid.tsx` | Category cards grid | Display |

---

### 3. Portal Components (14 components)

**Location:** `src/components/portal/`

#### Main Portal Components

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **WeddingTimeline** | `WeddingTimeline.tsx` | Timeline calendar view | Feature |
| **PlanBoard** | `PlanBoard.tsx` | Kanban planning board | Feature |

#### Timeline Components (src/components/portal/timeline/)

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **TimelineEvent** | `timeline/TimelineEvent.tsx` | Individual timeline item | Display |
| **AddEventForm** | `timeline/AddEventForm.tsx` | Add timeline event form | Form |

#### Timeline Wizard Components (src/components/portal/timeline/TimelineWizard/)

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **TimelineWizard** | `TimelineWizard/index.tsx` | Multi-step wizard | Container |
| **WizardSteps** | `TimelineWizard/WizardSteps.tsx` | Step indicators | UI |
| **WizardContext** | `TimelineWizard/WizardContext.tsx` | Wizard state context | Context |
| **TimelineGenerator** | `TimelineWizard/TimelineGenerator.ts` | Timeline generation logic | Utility |
| **WeddingDateStep** | `TimelineWizard/steps/WeddingDateStep.tsx` | Date selection step | Form |
| **WeddingDetailsStep** | `TimelineWizard/steps/WeddingDetailsStep.tsx` | Details input step | Form |
| **VendorSelectionStep** | `TimelineWizard/steps/VendorSelectionStep.tsx` | Vendor selection step | Form |
| **TimelineReviewStep** | `TimelineWizard/steps/TimelineReviewStep.tsx` | Review and confirm step | Display |

#### PlanBoard Components (src/components/portal/planboard/)

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **Column** | `planboard/Column.tsx` | Kanban column | Layout |
| **Item** | `planboard/Item.tsx` | Draggable item card | Display |
| **AddColumnForm** | `planboard/AddColumnForm.tsx` | Add column form | Form |
| **AddItemForm** | `planboard/AddItemForm.tsx` | Add item form | Form |
| **EssentialVendorsGuide** | `planboard/EssentialVendorsGuide.tsx` | Vendor guide panel | Display |

---

### 4. Admin Components (1 component)

**Location:** `src/components/admin/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **LocationManagement** | `LocationManagement.tsx` | Manage locations (cities/states) | Feature |

---

### 5. Auth Components (2 components)

**Location:** `src/components/auth/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **UserAuthForm** | `UserAuthForm.tsx` | User login/signup form | Form |
| **VendorAuthForm** | `VendorAuthForm.tsx` | Vendor login/signup form | Form |

---

### 6. Vendor Components (6 components)

**Location:** `src/components/vendor/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **CulturalProfileManager** | `CulturalProfileManager.tsx` | Manage cultural profile | Form |
| **VerificationBadges** | `VerificationBadges.tsx` | Display verification badges | Display |
| **BusinessClaimFlow** | `BusinessClaimFlow.tsx` | Claim business workflow | Feature |
| **StickyVendorCTA** | `StickyVendorCTA.tsx` | Floating CTA button | UI |
| **MultiInquiryModal** | `MultiInquiryModal.tsx` | Multi-vendor inquiry form | Modal |
| **AvailabilityModal** | `AvailabilityModal.tsx` | Check vendor availability | Modal |

---

### 7. Cultural Components (2 components)

**Location:** `src/components/cultural/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **MatchBadge** | `MatchBadge.tsx` | Cultural match score badge | Display |
| **MatchExplanation** | `MatchExplanation.tsx` | Explain match reasoning | Display |

---

### 8. Hashtag Components (4 components)

**Location:** `src/components/hashtag/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **HashtagBreadcrumbs** | `HashtagBreadcrumbs.tsx` | Navigation breadcrumbs | SEO |
| **HashtagFAQ** | `HashtagFAQ.tsx` | FAQ section | SEO |
| **HashtagSchemaMarkup** | `HashtagSchemaMarkup.tsx` | JSON-LD schema | SEO |
| **LocationContent** | `LocationContent.tsx` | Location-specific content | SEO |

---

### 9. Timeline Components (4 components)

**Location:** `src/components/timeline/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **TimelineBreadcrumbs** | `TimelineBreadcrumbs.tsx` | Navigation breadcrumbs | SEO |
| **TimelineFAQ** | `TimelineFAQ.tsx` | FAQ section | SEO |
| **TimelineSchemaMarkup** | `TimelineSchemaMarkup.tsx` | JSON-LD schema | SEO |
| **LocationContent** | `LocationContent.tsx` | Location-specific content | SEO |

---

### 10. SEO Components (3 components)

**Location:** `src/components/SEO/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **Breadcrumbs** | `SEO/Breadcrumbs.tsx` | General breadcrumbs | SEO |
| **CategoryFAQ** | `SEO/CategoryFAQ.tsx` | Category FAQ | SEO |
| **index.ts** | `SEO/index.ts` | SEO exports | Utility |

---

### 11. Error Boundary Components (4 components)

**Location:** `src/components/ErrorBoundaries/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **AuthErrorBoundary** | `AuthErrorBoundary.tsx` | Catch auth errors | Error Handler |
| **SearchErrorBoundary** | `SearchErrorBoundary.tsx` | Catch search errors | Error Handler |
| **VendorErrorBoundary** | `VendorErrorBoundary.tsx` | Catch vendor errors | Error Handler |
| **index.ts** | `index.ts` | Error boundary exports | Utility |

---

### 12. Subscription Components (1 component)

**Location:** `src/components/subscription/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **SubscriptionPlans** | `SubscriptionPlans.tsx` | Pricing/subscription plans | Feature |

---

### 13. Utility & Misc Components (23 components)

**Location:** `src/components/`

| Component | File | Purpose | Type |
|-----------|------|---------|------|
| **SEO** | `SEO.tsx` | SEO metadata wrapper | SEO |
| **SEOHead** | `SEOHead.tsx` | Head metadata manager | SEO |
| **SchemaMarkup** | `SchemaMarkup.tsx` | Generic JSON-LD schema | SEO |
| **MainNav** | `MainNav.tsx` | Main navigation (legacy) | Layout |
| **Footer** | `Footer.tsx` | Footer (legacy) | Layout |
| **ProtectedRoute** | `ProtectedRoute.tsx` | Auth route guard | Utility |
| **ErrorBoundary** | `ErrorBoundary.tsx` | Generic error boundary | Error Handler |
| **SocialShare** | `SocialShare.tsx` | Social sharing buttons | Feature |
| **CookieConsent** | `CookieConsent.tsx` | Cookie consent banner | Compliance |
| **TermsPopup** | `TermsPopup.tsx` | Terms acceptance popup | Compliance |
| **CityLandingPage** | `CityLandingPage.tsx` | City landing template | Template |
| **EnhancedFAQ** | `EnhancedFAQ.tsx` | Enhanced FAQ component | Display |
| **DynamicIntro** | `DynamicIntro.tsx` | Dynamic intro section | Display |
| **PerformanceMonitor** | `PerformanceMonitor.tsx` | Performance tracking | Analytics |

---

## Page Components (Legacy)

### Location: `src/pages/`

**Total:** 28 page components (React Router)

These are the legacy page-level components. Most have been migrated to Next.js App Router.

#### User-Facing Pages

| Component | File | Route (Old) | Migrated To | Status |
|-----------|------|-------------|-------------|--------|
| **Index** | `Index.tsx` | `/` | `app/page.tsx` | ✅ Migrated |
| **Auth** | `Auth.tsx` | `/auth` | `app/auth/page.tsx` | ✅ Migrated |
| **AuthCallback** | `AuthCallback.tsx` | `/auth/callback` | `app/auth/callback/page.tsx` | ✅ Migrated |
| **UserPortal** | `UserPortal.tsx` | `/portal` | `app/portal/page.tsx` | ✅ Migrated |
| **Search** | `Search.tsx` | `/search` | Integrated into SearchContainer | ✅ Migrated |
| **CategorySearch** | `CategorySearch.tsx` | `/search/:category/:state/:city` | `app/search/[...]/page.tsx` | ✅ Migrated |
| **States** | `States.tsx` | `/states` | `app/states/page.tsx` | ✅ Migrated |
| **StateDetail** | `StateDetail.tsx` | `/states/:state` | `app/states/[state]/page.tsx` | ✅ Migrated |
| **CityDetail** | `CityDetail.tsx` | `/states/:state/:city` | `app/states/[state]/[city]/page.tsx` | ✅ Migrated |
| **VendorDetail** | `VendorDetail.tsx` | `/vendor/:id` | `app/vendor/[id]/page.tsx` | ✅ Migrated |
| **Favorites** | `Favorites.tsx` | `/favorites` | `app/favorites/page.tsx` | ✅ Migrated |
| **Privacy** | `Privacy.tsx` | `/privacy` | `app/privacy/page.tsx` | ✅ Migrated |
| **Terms** | `Terms.tsx` | `/terms` | `app/terms/page.tsx` | ✅ Migrated |
| **Loading** | `Loading.tsx` | - | Next.js loading.tsx | ✅ Migrated |
| **NotFound** | `NotFound.tsx` | `*` | Next.js not-found.tsx | ✅ Migrated |

#### Vendor Pages

| Component | File | Route (Old) | Migrated To | Status |
|-----------|------|-------------|-------------|--------|
| **VendorDashboard** | `VendorDashboard.tsx` | `/vendor-dashboard` | `app/vendor-dashboard/page.tsx` | ✅ Migrated |
| **VendorDashboardPage** | `VendorDashboardPage.tsx` | - | Merged into VendorDashboard | ✅ Migrated |
| **ListBusiness** | `ListBusiness.tsx` | `/list-business` | `app/list-business/page.tsx` | ✅ Migrated |

#### Admin Pages

| Component | File | Route (Old) | Migrated To | Status |
|-----------|------|-------------|-------------|--------|
| **AdminPanel** | `AdminPanel.tsx` | `/admin` | `app/admin/page.tsx` | ✅ Migrated |
| **AdminApprovalDashboard** | `AdminApprovalDashboard.tsx` | `/admin/approvals` | Integrated into AdminPanel | ✅ Migrated |

#### Feature Pages

| Component | File | Route (Old) | Migrated To | Status |
|-----------|------|-------------|-------------|--------|
| **CulturalMatchingQuiz** | `CulturalMatchingQuiz.tsx` | `/match-me` | `app/match-me/page.tsx` | ✅ Migrated |
| **CulturalMatchResults** | `CulturalMatchResults.tsx` | `/match-me/results` | `app/match-me/results/page.tsx` | ✅ Migrated |
| **WeddingHashtagGenerator** | `WeddingHashtagGenerator.tsx` | `/hashtag-generator` | Standalone feature | ⏳ Pending |
| **FreeTimelineGenerator** | `FreeTimelineGenerator.tsx` | `/timeline-generator` | Standalone feature | ⏳ Pending |
| **Blog** | `Blog.tsx` | `/blog` | Not planned | ⏳ Pending |
| **DemoPortal** | `DemoPortal.tsx` | `/demo` | Not planned | ⏳ Pending |

#### Testing Pages

| Component | File | Route (Old) | Migrated To | Status |
|-----------|------|-------------|-------------|--------|
| **TestAuth** | `TestAuth.tsx` | `/test-auth` | `app/auth/test/page.tsx` | ✅ Migrated |
| **TestSubscriptions** | `TestSubscriptions.tsx` | `/test-subscriptions` | Not planned | ⏳ Pending |

**Migration Status:**
- ✅ **Migrated:** 19 pages
- ⏳ **Pending:** 9 pages (standalone features, tests, or deprecated)

---

## Component Dependencies

### Key Libraries Used

#### UI Framework
- **React 18.3.1** - Core UI library
- **React DOM 18.3.1** - DOM rendering
- **Next.js 15.0.3** - App framework

#### Component Libraries
- **@radix-ui/** - 20+ headless UI primitives
- **shadcn/ui** - Pre-styled components
- **Lucide React 0.462.0** - Icon library

#### Form Management
- **React Hook Form 7.53.0** - Form state
- **@hookform/resolvers 3.9.0** - Validation
- **Zod 3.23.8** - Schema validation

#### UI Enhancements
- **Embla Carousel 8.3.0** - Carousel
- **Recharts 2.12.7** - Charts
- **@dnd-kit/** - Drag and drop
- **Vaul 0.9.3** - Drawer
- **Sonner 1.5.0** - Toasts
- **input-otp 1.2.4** - OTP inputs
- **cmdk** - Command palette
- **react-day-picker** - Date picker

#### Utilities
- **clsx** - Class name utility
- **tailwind-merge** - Tailwind class merging
- **class-variance-authority** - Component variants
- **date-fns 3.6.0** - Date formatting

---

## Component Architecture Patterns

### Next.js App Router Pattern

```tsx
// Server Component (Default)
// app/page.tsx
export default async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} />
}

// Client Component (Interactive)
// app/_components/ClientComponent.tsx
'use client'
export function ClientComponent({ data }) {
  const [state, setState] = useState()
  return <div>...</div>
}
```

### Form Pattern (React Hook Form + Zod)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  field: z.string().min(1)
})

export function FormComponent() {
  const form = useForm({
    resolver: zodResolver(schema)
  })

  return <Form>...</Form>
}
```

### Error Boundary Pattern

```tsx
import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

### Protected Route Pattern

```tsx
export function ProtectedRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/auth" />
  }

  return children
}
```

---

## Component File Naming Conventions

### Next.js Components
- **Pages:** `page.tsx` (always lowercase)
- **Layouts:** `layout.tsx` (always lowercase)
- **Client Components:** `ComponentNameClient.tsx` (PascalCase + Client suffix)
- **Server Components:** `ComponentName.tsx` (PascalCase)

### React Components
- **Components:** `ComponentName.tsx` (PascalCase)
- **UI Components:** `component-name.tsx` (kebab-case for shadcn/ui)
- **Hooks:** `useHookName.ts` (camelCase with use prefix)
- **Utilities:** `utility-name.ts` (kebab-case)
- **Tests:** `ComponentName.test.tsx` (matching component name + .test)

---

## Component Testing

### Test Files
- **Location:** `src/components/search/__tests__/`
- **Framework:** Vitest + Testing Library
- **Pattern:** Component co-location

### Example Test Structure
```typescript
// VendorCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VendorCard } from '../VendorCard'

describe('VendorCard', () => {
  it('renders vendor information', () => {
    render(<VendorCard {...mockVendor} />)
    expect(screen.getByText('Vendor Name')).toBeInTheDocument()
  })
})
```

---

## Component Size & Complexity

### Largest Components (by lines of code)

| Component | File | Lines | Complexity |
|-----------|------|-------|------------|
| **CulturalMatchingQuiz** | `src/pages/CulturalMatchingQuiz.tsx` | ~650 | High |
| **WeddingHashtagGenerator** | `src/pages/WeddingHashtagGenerator.tsx` | ~680 | High |
| **AdminPanel** | `src/pages/AdminPanel.tsx` | ~620 | High |
| **VendorDashboard** | `src/pages/VendorDashboard.tsx` | ~330 | Medium |
| **CulturalMatchResults** | `src/pages/CulturalMatchResults.tsx` | ~360 | Medium |

### Smallest Components (utility/presentational)

| Component | File | Lines | Complexity |
|-----------|------|-------|------------|
| **Badge** | `src/components/ui/badge.tsx` | ~40 | Low |
| **Separator** | `src/components/ui/separator.tsx` | ~25 | Low |
| **Label** | `src/components/ui/label.tsx` | ~30 | Low |
| **RatingDisplay** | `src/components/search/RatingDisplay.tsx` | ~50 | Low |
| **MatchBadge** | `src/components/cultural/MatchBadge.tsx` | ~60 | Low |

---

## Component Reusability

### Highly Reused Components (10+ usages)

1. **Button** - Used across all forms, CTAs, navigation
2. **Card** - Vendor cards, info cards, dashboard cards
3. **Dialog** - Modals throughout application
4. **Form** - All form implementations
5. **Input** - Text inputs everywhere
6. **Badge** - Status indicators, categories, tags
7. **Skeleton** - Loading states across pages

### Single-Use Components

1. **HashtagSchemaMarkup** - Only hashtag generator
2. **TimelineWizard** - Only timeline feature
3. **AdminApprovalDashboard** - Admin only
4. **SubscriptionPlans** - Pricing page only
5. **LocationManagement** - Admin only

---

## Recommended Component Refactoring

### Opportunities for Consolidation

1. **Location Components**
   - `HashtagBreadcrumbs` + `TimelineBreadcrumbs` + `SEO/Breadcrumbs` → Unified `Breadcrumbs`
   - `HashtagFAQ` + `TimelineFAQ` + `CategoryFAQ` → Generic `FAQ`
   - Multiple `LocationContent` components → Single configurable component

2. **Error Boundaries**
   - Consolidate `AuthErrorBoundary`, `SearchErrorBoundary`, `VendorErrorBoundary` → Generic `ErrorBoundary` with types

3. **Navigation**
   - Merge `MainNav` (legacy) + `ClientMainNav` (Next.js) → Single navigation component

4. **Footer**
   - Merge `Footer` (legacy) + `ClientFooter` (Next.js) → Single footer component

### Candidates for Splitting

1. **CulturalMatchingQuiz** (650 lines) → Split into:
   - `QuizContainer`
   - `QuizQuestion`
   - `QuizProgress`
   - `QuizResults`

2. **WeddingHashtagGenerator** (680 lines) → Split into:
   - `HashtagGeneratorForm`
   - `HashtagResults`
   - `HashtagExamples`

3. **AdminPanel** (620 lines) → Split into:
   - `AdminDashboard`
   - `VendorApprovals`
   - `UserManagement`

---

## Component Performance Optimization

### Components Using React.memo
- Most UI components from shadcn/ui
- `VendorCard` (re-renders frequently in lists)
- `SearchResults` (large lists)

### Components Needing Optimization
1. **CategoriesGrid** - Could virtualize for many categories
2. **StateGrid** - Could implement windowing
3. **SearchResults** - Infinite scroll or pagination needed
4. **Timeline** - Could virtualize long timelines

### Lazy Loading Candidates
1. **AdminPanel** - Heavy component, admin-only
2. **WeddingHashtagGenerator** - Feature page
3. **FreeTimelineGenerator** - Feature page
4. **Chart** - Only used in admin/analytics
5. **Carousel** - Only used in specific pages

---

## Summary Statistics

### Component Counts

| Category | Count |
|----------|-------|
| **Next.js Pages** | 21 |
| **Next.js Client Components** | 12 |
| **Next.js Providers** | 1 |
| **Legacy Page Components** | 28 |
| **UI Components (shadcn/ui)** | 51 |
| **Search Components** | 21 |
| **Portal Components** | 14 |
| **SEO Components** | 11 |
| **Other Reusable Components** | 16 |
| **TOTAL COMPONENTS** | **175** |

### Migration Progress

| Status | Pages | Percentage |
|--------|-------|------------|
| ✅ **Fully Migrated** | 19 | 68% |
| ⏳ **Pending** | 9 | 32% |
| **TOTAL** | 28 | 100% |

### File Distribution

| Directory | Files | Purpose |
|-----------|-------|---------|
| `app/` | 36 | Next.js pages and components |
| `src/components/ui/` | 51 | UI component library |
| `src/components/search/` | 21 | Search functionality |
| `src/components/portal/` | 14 | User dashboard |
| `src/components/` (other) | 53 | Misc components |
| `src/pages/` | 28 | Legacy pages |
| **TOTAL** | **203** | All component files |

---

## Quick Reference

### Finding Components

**By Feature:**
- Search → `src/components/search/`
- User Dashboard → `src/components/portal/`
- Admin → `src/components/admin/`, `app/admin/`
- Auth → `src/components/auth/`, `app/auth/`
- Vendor → `src/components/vendor/`, `app/vendor/`

**By Type:**
- UI Components → `src/components/ui/`
- Client Components → `app/_components/`
- Page Components → `app/*/page.tsx`
- SEO Components → `src/components/SEO/`, `src/components/hashtag/`, `src/components/timeline/`

**By Technology:**
- Server Components → `app/**/*.tsx` (without 'use client')
- Client Components → `app/**/*Client.tsx` or components with 'use client'
- Form Components → Components using `react-hook-form`
- Real-time Components → Components using Supabase subscriptions

---

**End of Component Breakdown**

For more details on specific components, refer to the source files or component documentation.
