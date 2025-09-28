# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

- **Development**: `npm run dev` - Start Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Create production build
- **Production**: `npm start` - Start production server (requires build first)
- **Lint**: `npm run lint` - Run ESLint code quality checks (currently incomplete in package.json)

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
The application features a sophisticated design system migrated from AnimalyzerPro React codebase:
- **CSS Custom Properties**: Extensive theming via CSS variables in `globals.css`
- **Hover-Elevate System**: Consistent hover animations using `--elevate-1` and `--elevate-2`
- **Radix UI Foundation**: All UI components built on Radix UI primitives
- **Tailwind CSS v3.4.17**: Utility-first styling with custom design tokens (downgraded from v4 for compatibility)
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
The application uses AppSidebar component with fixed navigation menus for the breeder role:
- **Main Navigation**: Dashboard, Animals, Calculator, Activities, Tasks, Marketplace
- **Secondary Navigation**: Breeders, Documents, Settings
- **Client-Side Routing**: All navigation uses Next.js Link components for SPA behavior
- **No Page Refreshes**: Proper Next.js client-side navigation prevents PHP-like page reloads

## Migration History

### AnimalyzerPro to Animalytics Migration (Completed)
Successfully migrated the complete design system and all page components from the AnimalyzerPro React application:

**Design System Migration:**
- Copied comprehensive CSS design system with hover-elevate animations
- Migrated 45+ UI components from AnimalyzerPro to Animalytics
- Downgraded Tailwind from v4 to v3.4.17 for compatibility
- Fixed PostCSS configuration from ES6 to CommonJS exports
- Maintained all color schemes, typography, and spacing systems

**Page Component Migration:**
- Animals management page with filtering and search
- Mating calculator with progesterone analysis and breeding results
- Activity reports with tabbed interface and mating history
- Task management system with priority-based filtering
- Marketplace with featured listings and advanced search
- Breeder network with verification badges and contact system
- Document management with categorization and file operations
- Settings page with profile, notifications, privacy, and data management

**Technical Improvements:**
- All pages use proper Next.js App Router structure
- Client-side navigation eliminates page refreshes
- Responsive design maintained across all breakpoints
- Mock data with Unsplash images for consistent visuals
- TypeScript strict typing throughout all components

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
- **Current Focus**: Breeder role implementation (fully completed)
- **Next Phases**: Admin, Veterinarian, and Event Organizer role implementations
- **Architecture**: Ready for multi-role expansion with established patterns