# Jaqyn AI - Development TODO

## Phase 1: Migration
- [x] Migrate all pages (Dashboard, CampaignStudio, Customers, Analytics, Tools, BusinessProfile, AdminUI)
- [x] Migrate all AI components (AICopilotPanel, AIInsightsCard, AICopywriter, AICustomerInsights, AIAnalyticsDiagnostics)
- [x] Migrate database schema, relations, and migrations
- [x] Migrate server db.ts, routers.ts, storage.ts
- [x] Migrate shared/ai.ts types and utilities

## Phase 2: AI Infrastructure
- [x] Apply database migrations via webdev_execute_sql
- [x] Add tRPC ai router with invokeLLM integration
- [x] Add prompt templates for dashboard, campaign, churn, analytics
- [x] Add ai.chat, ai.dashboardInsight, ai.campaignCopy, ai.churnPrediction, ai.analyticsInsight, ai.toolsRecommendation procedures

## Phase 3: DashboardLayout + AICopilotPanel
- [x] Update DashboardLayout with full sidebar navigation (Dashboard, Campaigns, Customers, Analytics, Tools, Settings, Admin)
- [x] Rebuild AICopilotPanel with real LLM chat via tRPC ai.chat
- [x] Add typing animation and quick action chips (Analyze Quiet Hours, Generate Offer, Predict Traffic, Customer Health)
- [x] Mount AICopilotPanel globally in App.tsx

## Phase 4: Feature Pages AI Integration
- [x] Dashboard: Replace static AIInsightsCard with dynamic AI Insights Engine (weather/segment triggers)
- [x] CampaignStudio: Wire AICopywriter to ai.campaignCopy with tone selector (Friendly, Professional, Urgent, Casual)
- [x] Customers: Wire AICustomerInsights to ai.churnPrediction with Low/Medium/High risk + probability
- [x] Analytics: Wire AIAnalyticsDiagnostics to ai.analyticsInsight with next-step suggestions
- [x] Tools: Add AI recommendations panel with missing integration alerts and priority ranking

## Phase 5: Polish & Final
- [x] Loading states: skeleton loaders, "Jaqyn AI is analyzing..." indicators
- [x] Typing animation for AI responses
- [x] Error handling and fallback messages
- [x] Wire App.tsx with all routes
- [x] Update index.css for Jaqyn AI design system
- [x] Write vitest tests for ai router
- [x] Final checkpoint
