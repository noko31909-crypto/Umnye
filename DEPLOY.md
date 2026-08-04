# Deploying Jaqyn AI on Vercel

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A MySQL-compatible database (see options below)

## Step 1: Set Up a Database

The app requires a MySQL database. Choose one of these free options:

### Option A: TiDB Cloud (Recommended - Already Compatible)
1. Go to [https://tidbcloud.com](https://tidbcloud.com)
2. Create a free cluster
3. Get your connection string (format: `mysql://user:password@host:4000/database?ssl={"rejectUnauthorized":true}`)

### Option B: PlanetScale
1. Go to [https://planetscale.com](https://planetscale.com)
2. Create a free database
3. Get your connection string (use the "Prisma" connection string format)

### Option C: Supabase
1. Go to [https://supabase.com](https://supabase.com)
2. Create a free project
3. Go to Settings → Database → Connection string
4. Use the "Connection string" in psql mode

## Step 2: Create Database Tables

Run the following SQL on your database to create the required tables:

```sql
-- Users table (authentication)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `openId` varchar(64) NOT NULL UNIQUE,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') DEFAULT 'user' NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  `lastSignedIn` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Businesses table
CREATE TABLE IF NOT EXISTS `businesses` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `industry` varchar(128),
  `targetAudience` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Customers table
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `businessId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(320),
  `phone` varchar(64),
  `segment` varchar(128),
  `status` enum('active','inactive','prospect') DEFAULT 'active',
  `notes` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS `campaigns` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `businessId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(128),
  `status` enum('draft','active','paused','completed') DEFAULT 'draft',
  `description` text,
  `budget` decimal(12,2),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
```

## Step 3: Deploy to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `noko31909-crypto/Umnye`
4. Configure the following **Environment Variables**:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Your MySQL connection string | `mysql://user:pass@host:4000/db?ssl=...` |
| `JWT_SECRET` | Secret key for session tokens (any random string) | `my-super-secret-key-123` |
| `OAUTH_SERVER_URL` | Manus OAuth server URL | `https://api.manus.im` |
| `VITE_APP_ID` | Manus OAuth app ID | (get from Manus settings) |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL | `https://manus.im` |
| `OWNER_OPEN_ID` | Your Manus user ID | (get from Manus settings) |
| `OWNER_NAME` | Your display name | `John Doe` |
| `VITE_APP_TITLE` | App title | `Jaqyn AI` |

> **Note:** The Manus OAuth variables (`VITE_APP_ID`, `OWNER_OPEN_ID`, etc.) are specific to the Manus platform. If you want to use a different authentication system (like Clerk, NextAuth, or your own), you'll need to modify the auth flow.

### Alternative: Skip OAuth / Use Demo Mode

If you don't want to use Manus OAuth, you can use the demo login by setting up a simple bypass. The app has a "Demo Login" button that creates a session without real OAuth.

## Step 4: Verify Deployment

After deployment, visit your Vercel URL and check:
- Landing page loads correctly
- Login page works
- Dashboard is accessible after login
- All pages render without errors

## Troubleshooting

### Build Fails
- Make sure `pnpm install` works in your local environment
- Check that all dependencies in `package.json` are available

### Database Connection Fails
- Verify your `DATABASE_URL` is correct
- Make sure your database allows connections from Vercel's IP ranges
- Check SSL configuration in your connection string

### OAuth Issues
- The current auth uses Manus OAuth. If you're not using Manus, consider replacing the auth with your own system.
- For testing, the "Demo Login" button bypasses OAuth entirely.
