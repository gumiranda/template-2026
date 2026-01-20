# Restaurantix SaaS Implementation Guide

## Overview

Restaurantix is now fully implemented as a multi-tenant restaurant ordering system where customers can scan QR codes to view menus, place orders, and manage bills. Waiters receive real-time notifications and manage orders through a dedicated dashboard.

## Features Implemented

### 1. Database & Backend

#### New Database Tables
- **restaurants**: Restaurant information (name, address, owner)
- **tables**: Table details per restaurant with QR codes
- **menuCategories**: Menu categories per restaurant
- **menuItems**: Menu items with pricing and descriptions
- **sessions**: Anonymous customer sessions (4-hour expiration)
- **carts**: General cart for each table (entire bill)
- **cartItems**: Items in general cart
- **sessionCartItems**: Items in session cart (sent to waiter)
- **orders**: Customer orders linked to tables
- **orderItems**: Individual items in orders

#### Backend Modules
- `packages/backend/convex/restaurants.ts` - Restaurant CRUD
- `packages/backend/convex/tables.ts` - Table management with QR code generation
- `packages/backend/convex/menu.ts` - Menu and category management
- `packages/backend/convex/sessions.ts` - Anonymous session management
- `packages/backend/convex/orders.ts` - Order processing with status updates
- `packages/backend/convex/carts.ts` - Dual cart management (session + general)

#### New Role: WAITER
Added `WAITER` role to the system alongside existing SUPERADMIN, CEO, and USER roles.

### 2. Customer Interface (Anonymous Access)

#### URL Structure
- Route: `/table/[restaurantId]/[tableId]`
- No authentication required
- Access via QR code scan

#### Components Created
- `apps/web/app/(public)/layout.tsx` - Public layout without auth
- `apps/web/app/(public)/table/[restaurantId]/[tableId]/page.tsx` - Table landing page
- `apps/web/components/restaurant/menu-display.tsx` - Menu with categories
- `apps/web/components/restaurant/menu-item-card.tsx` - Individual item display
- `apps/web/components/restaurant/cart-drawer.tsx` - Dual cart with actions

#### Features
- **Menu Browsing**: Browse items by category
- **Dual Cart System**:
  - Session Cart: Items sent to waiter via "Chamar Garçom"
  - General Cart: Items for final bill via "Fechar Conta"
- **Anonymous Sessions**: 4-hour sessions managed via localStorage
- **Real-time Updates**: Cart and order status sync in real-time

### 3. Waiter/Restaurant Dashboard

#### URL Structure
- Base Route: `/restaurant`

#### Pages Created
- `/restaurant` - Dashboard overview with metrics
- `/restaurant/orders` - Order management with status filters
- `/restaurant/tables` - Table status and cart management
- `/restaurant/menu` - Menu management (CRUD)
- `/restaurant/settings` - Restaurant information editing
- `/restaurant/qr-codes` - QR code generation and printing

#### Features
- **Order Management**: View, confirm, prepare, serve orders
- **Table Overview**: See cart totals and status per table
- **Bill Closing**: "Close Bill" clears general cart
- **Menu Management**: Create/edit categories and items
- **QR Codes**: Generate and print table QR codes

### 4. Admin Dashboard Updates

#### New Pages
- `/admin/restaurants` - Restaurant management (SUPERADMIN only)

#### Features
- **Create Restaurants**: Add new restaurants with owner assignment
- **Edit Restaurants**: Update restaurant information
- **Delete Restaurants**: Remove restaurants from system
- **Assign CEOs**: Link CEOs/Owners to restaurants

## How It Works

### Customer Flow

1. **Scan QR Code**
   - Customer scans QR code at table
   - Redirected to `/table/[restaurantId]/[tableId]`
   - Anonymous session created (stored in localStorage)

2. **Browse Menu**
   - View menu organized by categories
   - See item images, descriptions, and prices
   - Add items to cart

3. **Place Orders**
   - **Add to Session Cart**: Click "+ button" - sends order to waiter
   - **Add to General Cart**: Click "Add to bill button" - adds to final bill
   - Multiple items can be added before calling waiter

4. **Call Waiter**
   - Click "Chamar Garçom" in cart drawer
   - Session cart items become an order
   - Waiter receives notification
   - Session cart cleared after sending

5. **Close Bill**
   - Click "Fechar Conta" when done
   - Requests bill from waiter
   - General cart cleared after payment

### Waiter Flow

1. **View Dashboard**
   - Access `/restaurant`
   - See pending orders, total orders, revenue
   - Monitor restaurant activity

2. **Manage Orders**
   - Go to `/restaurant/orders`
   - Filter by status (Pending, Confirmed, Preparing, Ready)
   - Update status through workflow:
     - Confirm → Preparing → Ready → Served
   - Real-time notifications for new orders

3. **Manage Tables**
   - Go to `/restaurant/tables`
   - See cart totals per table
   - Close bills when requested
   - Clear general cart after payment

4. **Manage Menu**
   - Go to `/restaurant/menu`
   - Create/edit categories
   - Create/edit menu items
   - Set prices and descriptions

5. **Generate QR Codes**
   - Go to `/restaurant/qr-codes`
   - View all table QR codes
   - Download or print QR codes
   - Display on restaurant tables

### Admin Flow (SUPERADMIN)

1. **Create Restaurant**
   - Go to `/admin/restaurants`
   - Click "New Restaurant"
   - Enter name, address, phone, description
   - Select owner (CEO)
   - Restaurant created

2. **Manage Users**
   - Go to `/admin/users`
   - Assign WAITER role to staff
   - Waiters can then access restaurant dashboard
   - Assign CEOs to manage restaurants

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/web
pnpm install
```

This installs `uuid` package for session management.

### 2. Deploy Database Schema

```bash
cd packages/backend
npx convex dev --once
```

This creates all new tables and indexes in Convex.

### 3. Create First Restaurant

1. Login as SUPERADMIN (first user should be superadmin via `/bootstrap`)
2. Go to `/admin/restaurants`
3. Click "New Restaurant"
4. Fill in restaurant details
5. Select yourself or another user as Owner (CEO)
6. Click "Create"

### 4. Create Menu

1. Go to `/restaurant/menu`
2. Select your restaurant
3. Create categories (e.g., "Entradas", "Pratos Principais", "Bebidas")
4. Add menu items to each category
5. Set prices and descriptions

### 5. Create Tables

1. Go to `/restaurant/qr-codes`
2. You'll need to create tables first (can add table creation page later)
3. For now, create tables via Convex dashboard or add to menu page

### 6. Generate QR Codes

1. Go to `/restaurant/qr-codes`
2. Select your restaurant
3. Download or print QR codes
4. Place QR codes on each table

### 7. Assign Staff

1. Go to `/admin/users`
2. Create users or edit existing ones
3. Assign WAITER role to restaurant staff
4. Waiters can now access `/restaurant` routes

## Role Permissions

| Role | Dashboard Access | Restaurant Management | Order Management |
|-------|-----------------|---------------------|-------------------|
| SUPERADMIN | `/dashboard` | `/admin/restaurants` | `/restaurant` |
| CEO | `/dashboard` | `/restaurant/settings` | `/restaurant` |
| WAITER | None | `/restaurant/menu` | `/restaurant` |
| USER | None | None | None |

## Technical Details

### Session Management
- Sessions stored in `localStorage` key: `restaurant_session_id`
- 4-hour expiration (configurable in `sessions.ts`)
- Session linked to restaurant and table
- Multiple sessions per table allowed

### Dual Cart System
- **Session Cart**: Temporary, cleared after "Chamar Garçom"
- **General Cart**: Persistent across sessions, cleared after "Fechar Conta"
- Both carts visible in cart drawer
- Real-time synchronization via Convex subscriptions

### Order Status Flow
```
pending → confirmed → preparing → ready → served → completed
```

### Multi-Tenancy
- Each restaurant has separate data
- Tables scoped to restaurant
- Menu items scoped to restaurant
- Orders scoped to restaurant
- Waiters only see their assigned restaurant data

## File Structure Summary

### Backend
```
packages/backend/convex/
├── schema.ts (updated with new tables)
├── restaurants.ts (NEW)
├── tables.ts (NEW)
├── menu.ts (NEW)
├── sessions.ts (NEW)
├── orders.ts (NEW)
├── carts.ts (NEW)
├── lib/
│   ├── types.ts (added WAITER role, OrderStatus)
│   └── auth.ts (added isRestaurantStaff helper)
└── permissions.ts (updated with WAITER role)
```

### Frontend
```
apps/web/
├── app/
│   ├── (public)/ (NEW)
│   │   ├── layout.tsx
│   │   └── table/
│   │       └── [restaurantId]/
│   │           └── [tableId]/
│   │               └── page.tsx
│   ├── (restaurant)/ (NEW)
│   │   ├── layout.tsx
│   │   ├── page.tsx (dashboard)
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   ├── tables/
│   │   │   └── page.tsx
│   │   ├── menu/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── qr-codes/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   └── restaurants/ (NEW)
│   │   │       └── page.tsx
│   │   └── layout.tsx (updated)
│   └── middleware.ts (updated)
├── components/
│   └── restaurant/ (NEW)
│       ├── menu-display.tsx
│       ├── menu-item-card.tsx
│       ├── cart-drawer.tsx
│       ├── order-status-badge.tsx
│       └── qr-code-generator.tsx
├── hooks/
│   └── use-restaurant-session.ts (NEW)
├── types/
│   ├── restaurant.ts (NEW)
│   └── index.ts
└── lib/
    └── constants.ts (added WAITER role)
```

## Next Steps / Future Enhancements

1. **Table Management UI**: Create `/restaurant/tables/create` for adding tables
2. **Menu Item Images**: Add image upload functionality
3. **Payment Integration**: Integrate Stripe for payments
4. **Kitchen Display**: Separate view for kitchen staff
5. **Analytics**: Add revenue analytics per restaurant
6. **Customer Reviews**: Allow customers to rate items
7. **Order History**: Keep order history for customers
8. **Split Bills**: Allow bill splitting
9. **Promotions**: Add discount codes and promotions
10. **Multi-language**: Add i18n support

## Testing Checklist

- [ ] Create restaurant as SUPERADMIN
- [ ] Add menu categories and items
- [ ] Generate QR code for table
- [ ] Scan QR code as customer
- [ ] Add items to session cart
- [ ] Call waiter
- [ ] View order as waiter
- [ ] Update order status
- [ ] Add items to general cart
- [ ] Close bill
- [ ] Test session expiration
- [ ] Test multiple customers at same table
- [ ] Assign waiter role to user
- [ ] Verify waiter can access restaurant dashboard
- [ ] Test real-time updates

## Deployment

To deploy to production:

```bash
# Deploy backend schema
cd packages/backend
CONVEX_DEPLOY_KEY="prod:your-key" npx convex deploy --env-file .env.prod

# Build and deploy frontend
cd apps/web
pnpm build
# Deploy to Vercel, Netlify, etc.
```

## Support

For issues or questions:
1. Check Convex dashboard for database state
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure Convex schema is deployed
