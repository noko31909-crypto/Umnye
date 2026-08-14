# SERPIN MVP TODO

## Database & Schema
- [x] Update drizzle/schema.ts with products, suppliers, orders, order_items, sales_history, business_profile tables
- [x] Generate and apply migrations
- [x] Seed mock data (products, suppliers, sales history, orders)

## Pages
- [x] Landing page (brief intro + login CTA)
- [x] Login/Register with business profile selection
- [x] Dashboard — metrics cards, AI recommendations, quick actions
- [x] Inventory — product table with stock levels, min stock, days remaining, status
- [x] Auto Order — clickable flow (create → confirm → sent)
- [x] Suppliers — supplier cards with price, delivery time, reliability
- [x] Supplier Comparison — compare suppliers for a product, AI picks best
- [x] Demand Forecast — sales chart + prediction, AI stock recommendation
- [x] Orders/Deliveries — order list with status tracking
- [x] AI Recommendations — dynamic recommendations panel
- [x] Business Profile — type, locations, product categories
- [x] Admin Panel — manage products, suppliers, auto-order rules, analytics

## Features
- [x] Auth system (Manus OAuth + demo mode)
- [x] Auto-order logic (trigger when stock ≤ min level)
- [x] Supplier comparison algorithm
- [x] Demand forecasting (simple moving average + trend)
- [x] AI recommendation engine (dynamic based on mock data)
- [x] Order status workflow (Confirmed → Collecting → In transit → Delivered)

## UI/UX
- [x] Clean professional business SaaS design
- [x] Responsive layout with sidebar navigation
- [x] Dark/light theme support
- [x] Mock data for demo purposes
