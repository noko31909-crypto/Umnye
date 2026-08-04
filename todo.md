# Jaqyn AI - Development TODO

## Source Migration
- [x] Copy source code from jaqyn-ai-main archive into project directory
- [x] Ensure all client pages, components, hooks, and contexts are in place
- [x] Ensure all server routers and AI router are in place
- [x] Ensure shared types and constants are in place
- [x] Ensure drizzle schema and migrations are in place

## Dependencies
- [x] Install pnpm dependencies (including zustand)
- [x] Install zustand and zustand-persist-devtools
- [x] Verify all dependencies resolve correctly

## Database
- [x] Apply SQL migrations via webdev_execute_sql

## Server
- [x] Wire AI router in routers.ts
- [x] Verify tRPC procedures for all AI features

## Frontend
- [x] Wire all routes in App.tsx with DashboardLayout
- [x] Verify Dashboard page with AI Insights Engine
- [x] Verify Campaign Studio page with AI Copywriter
- [x] Verify Customers page with AI Customer Insights
- [x] Verify Analytics page with AI Diagnostics
- [x] Verify Tools page with AI Recommendations
- [x] Verify Global AI Copilot Panel
- [x] Verify Settings and Business Profile pages
- [x] Verify Admin UI page with RBAC
- [x] Verify protected routes for all dashboard pages

## Testing
- [x] Run vitest tests (25/25 passed)
- [x] Fix all TypeScript and runtime errors (0 errors)

## Polish
- [x] Final checkpoint and publish
## Vercel Deployment
- [ ] Configure vercel.json for serverless deployment
- [ ] Create Vercel API routes (api/trpc/[trpc].ts)
- [ ] Adapt server code for Vercel serverless functions
- [ ] Add .env.example with required environment variables
- [ ] Add .gitignore to exclude node_modules and sensitive files
- [ ] Remove Manus-specific vite plugins and replace with Vercel-compatible alternatives
- [ ] Push to GitHub for Vercel connection
- [ ] Create deployment instructions
