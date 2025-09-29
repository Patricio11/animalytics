# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

- **Development**: `npm run dev` - Start Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Create production build
- **Production**: `npm start` - Start production server (requires build first)
- **Lint**: `npm run lint` - Run ESLint code quality checks with Next.js and TypeScript rules

## Architecture Overview

### Multi-Role Platform Structure
Animalytics is a comprehensive animal management platform designed for multiple user roles:
- **Breeders**: Animal management, breeding calculations, marketplace
- **Veterinarians**: Health records, appointments, medical reports
- **Administrators**: System management, user oversight, analytics
- **Event Organizers**: Competition management, registrations, results

### Next.js App Router with Role-Based Route Groups
The application uses Next.js 15 App Router with route groups organized by user role:
- `app/(breeder)/` - Breeder-specific pages and functionality (ACTIVE)
- `app/(admin)/` - Administrator dashboard and management
- `app/(vet)/` - Veterinary practice tools and records
- `app/(event-organizer)/` - Event management and organization
- `app/auth/` - Shared authentication pages

### Current Breeder Route Implementation
All breeder routes are fully implemented with complete page components:
- `/dashboard` - Main breeder dashboard with stats and overview
- `/animals` - Animal management and portfolio
- `/calculators` - Mating calculator with progesterone analysis
- `/activities` - Activity reports and mating history
- `/tasks` - Task management with priority filtering
- `/marketplace` - Breeding animal listings and search
- `/breeders` - Professional breeder network
- `/documents` - Document management with categorization
- `/settings` - Account settings and preferences

### Component Organization by Role
Components are systematically organized to support the multi-role architecture:
- `components/ui/` - Base UI components (Radix UI + custom styling)
- `components/shared/` - Components used across multiple roles
- `components/layout/` - Layout components (AppSidebar, navigation)
- `components/breeder/` - Breeder-specific components (AnimalCard, StatsCard, etc.)
- `components/admin/` - Administrator-specific components
- `components/vet/` - Veterinary-specific components
- `components/event-organizer/` - Event organizer components

### Permission System
Role-based access control is implemented through:
- `lib/constants/roles.ts` - Defines user roles and permissions
- `lib/permissions/index.ts` - Permission checking utilities
- `lib/constants/navigation.ts` - Role-specific navigation menus

### Design System Architecture
The application features a sophisticated design system migrated from BreedBook Pro React codebase:
- **BreedBook Pro Design System**: Complete migration of beautiful HSL color scheme with gradients
- **CSS Custom Properties**: Extensive theming via CSS variables in `globals.css` with BreedBook Pro colors
- **Gradient System**: `bg-gradient-brand`, `bg-gradient-subtle` for modern visual appeal
- **Shadow System**: `shadow-card`, `shadow-elevated` for depth and elevation effects
- **Hover Effects**: Consistent hover animations and state transitions
- **Radix UI Foundation**: All UI components built on Radix UI primitives with custom styling
- **Tailwind CSS v3.4.17**: Utility-first styling with BreedBook Pro design tokens
- **Chart Integration**: Recharts for data visualization with custom theming
- **PostCSS CommonJS**: Configuration uses CommonJS exports for compatibility

### Key Technical Patterns

#### Client Component Requirements
Components using React hooks must include `"use client"` directive:
- All components in `components/breeder/`, `components/shared/`, etc.
- Toast system (`hooks/use-toast.ts`, `components/ui/toaster.tsx`)
- Mobile detection (`hooks/use-mobile.ts`)

#### Design System Classes
- **Cards**: Use `hover-elevate` class for consistent hover animations
- **Colors**: Chart colors (`chart-1` through `chart-4`) for data visualization
- **Status Indicators**: Role-specific color schemes in `tailwind.config.ts`

#### Navigation Architecture
The application uses AppSidebar component with BreedBook Pro styling for the breeder role:

**Sidebar Configuration:**
- **Width**: 16rem (256px) for expanded state, 3.8rem (60.8px) for collapsed
- **Logo**: Animalytics brand logo with smart collapse behavior
- **Logo Collapse**: Scales 9x and repositions to show just the "A" letter as icon
- **Background**: `bg-surface` with `shadow-card` for depth
- **Active States**: `bg-gradient-brand text-white shadow-card` for current page
- **Hover States**: `text-muted-foreground hover:text-foreground hover:bg-accent`

**Navigation Structure:**
- **Main Navigation**: Dashboard, Animals, Calculator, Activities, Tasks, Marketplace
- **Secondary Navigation**: Breeders, Documents, Settings (separated with border)
- **Group Labels**: Uppercase, tracked spacing with `text-xs font-medium text-muted-foreground`
- **Collapsible**: Full Radix UI sidebar with icon mode and smooth transitions

**Technical Implementation:**
- **Client-Side Routing**: All navigation uses Next.js Link components for SPA behavior
- **No Page Refreshes**: Proper Next.js client-side navigation prevents PHP-like page reloads
- **Responsive**: Automatically collapses on tablet/mobile devices
- **Logo Animation**: `transition-all duration-200` for smooth collapse/expand

## Migration History

### BreedBook Pro to Animalytics Design Migration (Completed)
Successfully migrated the complete beautiful design system from BreedBook Pro React application to Animalytics:

**BreedBook Pro Design System Migration:**
- **Complete HSL Color Scheme**: Migrated entire BreedBook Pro color palette with gradients
- **CSS Variables**: Implemented extensive theming system with BreedBook Pro design tokens
- **Gradient System**: `bg-gradient-brand`, `bg-gradient-subtle` for modern visual appeal
- **Shadow System**: `shadow-card`, `shadow-elevated` for depth and professional appearance
- **Border System**: `border-primary/20` for subtle, consistent borders throughout
- **Hover Effects**: Consistent animations and state transitions matching BreedBook Pro
- **Typography**: Enhanced font weights, sizes, and spacing for professional appearance

**Beautiful Page Implementations (Completed):**
- **Landing Page**: Complete BreedBook Pro design with gradients, testimonials, and call-to-action sections
- **Authentication Pages**: Split-screen design with gradient branding panels (signin, signup, forgot-password)
- **Sidebar Navigation**: Professional styling with gradient active states and smart logo collapse behavior
- **Animals Page**: Enhanced with gradient icons, shadow cards, beautiful filter sections, and call-to-action areas
- **Calculators Page**: Professional form styling, gradient buttons, enhanced results with colored badges
- **Activities Page**: Started beautiful redesign with enhanced headers, filters, and card layouts
- **Dashboard Page**: Beautiful stats grid with shadow cards and professional layout

**BreedBook Pro Design Elements Applied:**
- **Background System**: `bg-surface-secondary` for page backgrounds, `bg-surface` for cards
- **Card Design**: All cards use `shadow-card bg-surface border-0` for professional appearance
- **Button Styling**: `bg-gradient-brand hover:opacity-90 shadow-card` for primary actions
- **Form Controls**: Enhanced inputs and selects with `bg-background border-primary/20 focus:border-primary`
- **Icons**: Gradient icon containers with `bg-gradient-brand` and white icons
- **Badges**: Colored badges with `bg-primary-blue-light text-primary-blue border-primary-blue/20`
- **Headers**: Professional page headers with gradient icons and improved typography

**Technical Improvements:**
- All pages use proper Next.js App Router structure with beautiful BreedBook Pro styling
- Client-side navigation eliminates page refreshes with enhanced visual feedback
- Responsive design maintained across all breakpoints with consistent styling
- Mock data with Unsplash images for professional visual consistency
- TypeScript strict typing throughout all components with enhanced prop interfaces

## Development Notes

### TypeScript Configuration
- Strict TypeScript configuration with proper component prop typing
- Radix UI component integration requires careful type management
- Permission system uses strongly-typed role and resource definitions
- Path mapping configured with `@/*` alias pointing to project root
- ESLint configured with Next.js and TypeScript rules via flat config

### Build Considerations
- Chart components may require TypeScript workarounds for Recharts compatibility
- Large dependency tree due to comprehensive Radix UI component set
- Custom hooks require client-side execution markers

### Styling Architecture
The design system uses a hybrid approach:
- CSS custom properties for theming and consistency
- Tailwind utilities for responsive design and spacing
- Component-level styling for complex interactions
- Chart theming integration for data visualization consistency
- PostCSS configuration uses CommonJS format for compatibility

## Project Status
- **Design System**: BreedBook Pro design migration completed with professional styling throughout
- **Current Focus**: Breeder role implementation with beautiful UI/UX (actively being enhanced)
- **Completed Pages**: Landing page, auth pages, sidebar, animals, calculators, activities (partial), dashboard
- **Remaining Pages**: Tasks, marketplace, breeders, documents, settings pages need BreedBook Pro styling
- **Next Phases**: Complete beautiful design for all breeder pages, then expand to other user roles
- **Architecture**: Ready for multi-role expansion with established BreedBook Pro design patterns

## Current Development Server
- **Development**: Application runs on `http://localhost:3002` (or available port)
- **Build Status**: All syntax errors resolved, app running smoothly
- **Sidebar**: 16rem width with perfect logo collapse behavior (9x scale, 395% translate)
- **Design**: Professional BreedBook Pro styling implemented across key pages