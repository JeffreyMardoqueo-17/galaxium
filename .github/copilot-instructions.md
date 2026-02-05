# Galaxium ERP - AI Coding Instructions

## Project Overview
Galaxium is an Enterprise Resource Planning (ERP) system built with Next.js 16 (App Router), TypeScript, and a .NET backend API running on `http://localhost:5213/api`.

## Mindset & Approach

When working on Galaxium, adopt these professional perspectives:

### 🏗️ Software Architect
- **Scalability First**: Design features thinking about future growth - modular services, reusable components, clear separation of concerns
- **Maintainability**: Write code that others (or you in 6 months) can understand - clear naming, consistent patterns, proper TypeScript typing
- **System Thinking**: Consider how changes affect the entire system - authentication flow, data consistency, API contracts

### 👤 Product Owner / Client
- **Business Value**: Every feature should solve a real business problem for ERP users (inventory management, sales tracking, customer data)
- **User Workflows**: Think about complete user journeys - from login to completing a task (e.g., registering a sale, adding stock)
- **Data Integrity**: Protect business-critical data - validation, error handling, confirmations for destructive actions

### 🎨 UI/UX Designer
- **User Experience**: Intuitive interfaces - clear labels in Spanish, predictable navigation, immediate feedback on actions
- **Consistency**: Follow established patterns - HeroTable for lists, BaseModal for forms, consistent spacing/colors
- **Accessibility**: Semantic HTML, keyboard navigation, loading states, error messages that guide users to solutions
- **Responsive Design**: Mobile-first thinking, but optimized for desktop ERP workflows

### 💻 Senior Web Developer
- **Modern Best Practices**: Server/Client component optimization, proper data fetching patterns, efficient re-renders
- **Performance**: Debounced searches, pagination, lazy loading, minimal bundle size
- **Error Handling**: Graceful degradation, user-friendly Spanish messages, retry mechanisms where appropriate
- **Code Quality**: DRY principles, proper TypeScript usage, consistent formatting, meaningful comments only where needed

## Architecture & Key Patterns

### Route Structure
- **Protected routes**: Use `app/(protected)/` route group with shared layout including sidebar/navbar
- **Public routes**: `app/login/` for authentication
- **Middleware**: `middleware.ts` enforces cookie-based auth (`access_token`) on all routes except `/login`, `/_next`, and `/favicon.ico`

### Authentication Flow
- **Login**: Tokens stored in both `localStorage.getItem("access_token")` AND cookies
- **Logout**: Must clear localStorage + cookies + call backend `/api/User/logout`
- **Headers**: Always use `getAuthHeaders()` from `utils/getAddHeaders.ts` for authenticated API calls
- **Example**: See [services/auth.service.ts](services/auth.service.ts) for token management pattern

### Service Layer Pattern
All API interactions follow this structure (see [services/product.service.ts](services/product.service.ts)):

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5213/api";

export async function getProducts(): Promise<ProductResponse[]> {
  const res = await fetch(`${API_URL}/Product`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
}
```

**Key Rules**:
- Always use `getAuthHeaders()` for authenticated endpoints
- Handle errors with Spanish messages (e.g., "Error al obtener productos")
- Return typed responses using interfaces from `/types`

### Type Definitions
Follow naming conventions in `/types` (see [types/product.ts](types/product.ts)):
- `*CreateRequest` - for POST requests
- `*UpdateRequest` - for PUT/PATCH requests
- `*Response` - for API responses
- `*FilterRequest` - for query parameters (pagination, search)

### UI Components Architecture
- **Base Components**: [components/ui/modales/BaseModal.tsx](components/ui/modales/BaseModal.tsx) uses Radix UI primitives
- **Feature Components**: [components/features/products/ProductForm.tsx](components/features/products/ProductForm.tsx) combines base components
- **Table Component**: `HeroTable` from [components/ui/tables/index.ts](components/ui/tables/) for data grids
- **Icons**: Use `lucide-react` for sidebar ([config/sidebar.ts](config/sidebar.ts)), `react-icons` elsewhere

### State Management & Data Fetching
Pattern from [app/(protected)/product/page.tsx](app/(protected)/product/page.tsx):
- Use `useState` for local state (no global state library)
- Implement debouncing for filters (400ms timeout)
- Separate loading states: `loadingProducts`, `loadingCategories`
- Pagination via `ProductFilterRequest.page` and `ProductFilterRequest.pageSize`

### Styling & Theming
- **Framework**: Tailwind CSS 4 with HeroUI + Radix UI
- **Dark Mode**: `next-themes` provider in [app/layout.tsx](app/layout.tsx), default theme is "light"
- **Colors**: Use CSS variables like `bg-[var(--color-body)]` (see [app/(protected)/layout.tsx](app/(protected)/layout.tsx))
- **Fonts**: Geist Sans and Geist Mono (configured in root layout)

## Development Workflows

### Problem-Solving Approach
When implementing features or fixing bugs:
1. **Understand the Business Goal**: What ERP workflow are we supporting? (e.g., "Track product inventory", "Record customer sales")
2. **Design the Data Flow**: API → Service → Page → Component → User action → API
3. **Consider Edge Cases**: What if the API fails? What if the user has no data? What about permissions?
4. **Think About UX**: Loading states, error messages in Spanish, success confirmations, keyboard shortcuts
5. **Validate & Test**: Does it work without network? What happens with 1000 products? Can I break it by clicking fast?

### Running the Application
```bash
npm run dev  # Starts Next.js on http://localhost:3000
```
**Backend Required**: Ensure .NET API is running on `http://localhost:5213/api` before login

### Adding New CRUD Features
1. Define types in `/types/entity.ts` (CreateRequest, UpdateRequest, Response)
2. Create service in `/services/entity.service.ts` using `getAuthHeaders()` pattern
3. Add route in `/app/(protected)/entity/page.tsx` (auto-protected by middleware)
4. Create form component in `/components/features/entity/EntityForm.tsx`
5. Update sidebar in [config/sidebar.ts](config/sidebar.ts) with new menu item
6. Add route to middleware matcher if needed: [middleware.ts](middleware.ts)

### Modal Pattern
Always use `BaseModal` wrapper from [components/ui/modales/BaseModal.tsx](components/ui/modales/BaseModal.tsx):
```typescript
<BaseModal open={modalOpen} onOpenChange={setModalOpen} title="Crear Producto">
  <ProductForm onSuccess={() => { setModalOpen(false); loadProducts(); }} />
</BaseModal>
```

## Design Decisions & Rationale

### Why Dual Token Storage (localStorage + cookies)?
- **Cookies**: Enable server-side middleware authentication checks (secure, HTTP-only)
- **localStorage**: Allow client-side API calls without cookie complexity
- **Trade-off**: Slightly more complexity vs. flexible auth across server/client boundaries

### Why No Global State Library?
- **Context**: ERP features are largely isolated (products, customers, sales are separate workflows)
- **Simplicity**: `useState` in page components is sufficient for feature-scoped data
- **Performance**: Avoid unnecessary re-renders from global state changes
- **Future**: Consider Zustand/Jotai only if cross-feature state sharing becomes frequent

### Why Separate Loading States?
- **UX**: Users need to know what's loading - form can be ready while data loads
- **Resilience**: One failed request doesn't block the entire UI
- **Example**: `loadingCategories` can fail without blocking product list display

### Why 400ms Debounce?
- **UX Balance**: Feels instant to users but prevents excessive API calls while typing
- **Backend Load**: Reduces unnecessary requests to .NET API
- **Adjustable**: Increase to 600ms if backend is slow, decrease to 200ms for local dev

### Why HeroUI Only in Protected Layout?
- **Bundle Size**: Authentication pages don't need full component library
- **Load Time**: Login page loads faster without HeroUI overhead
- **Separation**: Clear boundary between public (minimal) and app (full features)

## Critical Gotchas

- **Auth Token Location**: Token must be in BOTH `localStorage` AND cookies for proper auth flow
- **API URL**: Hardcoded to `localhost:5213` - change `API_URL` in services for production
- **Middleware Matcher**: Update [middleware.ts](middleware.ts) `config.matcher` when adding new protected routes
- **HeroUI Provider**: Required in protected layout ([app/(protected)/layout.tsx](app/(protected)/layout.tsx)), NOT root layout
- **Spanish Locale**: All user-facing messages, errors, and labels should be in Spanish

## File Naming Conventions
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- Components: PascalCase (e.g., `ProductForm.tsx`)
- Services: kebab-case (e.g., `product.service.ts`)
- Types: kebab-case (e.g., `product.ts`)
- Config: kebab-case (e.g., `sidebar.ts`)
