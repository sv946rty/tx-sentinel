# Vercel Deployment Checklist

This document provides a comprehensive checklist for deploying the AI Agent app to Vercel.

## ⚠️ CRITICAL: 403 Forbidden Error Fix

If you're getting `403 Forbidden` error on production, see **[Troubleshooting Section](#authentication-fails)** below.

**Quick Fix:**
1. Update `BETTER_AUTH_URL` in Vercel to `https://tx-sentinel.vercel.app`
2. Add production URLs to Google/GitHub OAuth consoles
3. Redeploy

## ✅ Pre-Deployment Verification

### 1. Build Configuration

- ✅ **package.json** - Build scripts configured correctly
  - `build`: `next build` ✓
  - `start`: `next start` ✓
  - `dev`: `next dev` ✓

- ✅ **next.config.ts** - Next.js configuration valid
  - React Compiler enabled ✓
  - No blocking configuration issues ✓

- ✅ **Build Test** - Production build passes
  ```bash
  pnpm build
  ```
  Status: ✅ PASSED (with expected dynamic server usage warning)

### 2. Environment Variables Required

**CRITICAL:** These environment variables MUST be configured in Vercel dashboard:

#### Database Configuration
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:6543/postgres
DATABASE_SCHEMA=ai_agent
```

#### Authentication (Better Auth)
```bash
AUTH_SECRET=your-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=https://tx-sentinel.vercel.app
```

**⚠️ IMPORTANT:** `BETTER_AUTH_URL` must be:
- Your actual Vercel domain: `https://tx-sentinel.vercel.app`
- NO trailing slash
- HTTPS (not HTTP)

#### OAuth Providers
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### OpenAI
```bash
OPENAI_API_KEY=sk-your-openai-api-key
```

#### Session Password Protection (Optional)
```bash
REQUIRE_SESSION_PASSWORD=true
SESSION_PASSWORD=your-secure-password-here
```

**Note:** For production deployment, set `REQUIRE_SESSION_PASSWORD=true` to prevent abuse.

### 3. OAuth Callback URLs

**⚠️ CRITICAL:** After deploying to Vercel, update OAuth redirect URIs in BOTH providers:

#### Google OAuth Console (https://console.developers.google.com/)

**Authorized JavaScript origins:**
- `http://localhost:3000` (for local dev)
- `https://tx-sentinel.vercel.app` (for production)

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google` (for local dev)
- `https://tx-sentinel.vercel.app/api/auth/callback/google` (for production)

#### GitHub OAuth Settings (https://github.com/settings/developers)

**Authorization callback URL:**
- For local dev: `http://localhost:3000/api/auth/callback/github`
- For production: `https://tx-sentinel.vercel.app/api/auth/callback/github`

**Note:** GitHub allows only one callback URL per OAuth app. Consider creating separate OAuth apps for development and production.

### 4. Database Setup

Ensure Supabase PostgreSQL database is configured:

1. ✅ Schema created: `ai_agent`
2. ✅ Migrations applied via `pnpm db:migrate`
3. ✅ Tables exist:
   - `ai_agent.users`
   - `ai_agent.sessions`
   - `ai_agent.accounts`
   - `ai_agent.verifications`
   - `ai_agent.agent_runs`

### 5. TypeScript Compilation

- ✅ No type errors in production build
- ✅ All imports resolved correctly
- ✅ Schema exports properly configured

## 🚀 Deployment Steps

### Step 1: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `https://github.com/sv946rty/tx-sentinel`
4. Select the repository and click "Import"

### Step 2: Configure Project Settings

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (default)

**Build Command:** `pnpm build` (auto-detected)

**Output Directory:** `.next` (auto-detected)

**Install Command:** `pnpm install` (auto-detected)

### Step 3: Add Environment Variables

In the Vercel project settings, add ALL environment variables listed in section 2 above.

**CRITICAL VARIABLES (must be set before first deployment):**
- `DATABASE_URL`
- `DATABASE_SCHEMA`
- `AUTH_SECRET`
- `BETTER_AUTH_URL=https://tx-sentinel.vercel.app` ⚠️ **Use production URL**
- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

**Optional but recommended for production:**
- `REQUIRE_SESSION_PASSWORD=true`
- `SESSION_PASSWORD=your-password`

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

### Step 5: Post-Deployment Configuration

1. **Verify BETTER_AUTH_URL**
   - Your Vercel deployment URL is: `https://tx-sentinel.vercel.app`
   - Confirm `BETTER_AUTH_URL` is set to `https://tx-sentinel.vercel.app` (no trailing slash)
   - If you changed it, redeploy the application

2. **Update OAuth Redirect URIs**
   - Google: Add `https://tx-sentinel.vercel.app/api/auth/callback/google`
   - GitHub: Add `https://tx-sentinel.vercel.app/api/auth/callback/github`

3. **Test Authentication Flow**
   - Visit https://tx-sentinel.vercel.app
   - Test Google OAuth sign-in
   - Test GitHub OAuth sign-in
   - Verify session persistence

4. **Test Session Password Protection**
   - If `REQUIRE_SESSION_PASSWORD=true`, verify password prompt appears
   - Test password verification
   - Verify session authentication persists until logout

## 🔍 Verification Checklist

After deployment, verify these functionalities:

- [ ] Home page loads correctly
- [ ] Sign in with Google works (no 403 errors)
- [ ] Sign in with GitHub works
- [ ] User session persists across page refreshes
- [ ] Session password dialog appears (if enabled)
- [ ] Session password authentication works
- [ ] Agent can process questions and stream responses
- [ ] Memory/history is stored and retrieved correctly
- [ ] Reasoning timeline displays correctly
- [ ] Dark mode works
- [ ] Mobile responsive design works
- [ ] Sign out works and clears session
- [ ] After sign out and sign in, password prompt appears again (if enabled)

## 🛠️ Troubleshooting

### Build Fails with Type Errors

**Issue:** TypeScript compilation errors during build

**Solution:** Ensure all dependencies are installed and `pnpm build` passes locally first.

### Authentication Fails

**Issue:** `403 Forbidden` error or OAuth redirect errors

**Common Causes:**
1. `BETTER_AUTH_URL` not set or incorrect
2. `BETTER_AUTH_URL` points to localhost instead of production URL
3. OAuth callback URLs not updated in provider consoles
4. `AUTH_SECRET` not set or too short (< 32 characters)

**Solution:**

1. **Update BETTER_AUTH_URL in Vercel:**
   ```bash
   BETTER_AUTH_URL=https://tx-sentinel.vercel.app
   ```
   ⚠️ Must match your actual Vercel domain, NO trailing slash, HTTPS only

2. **Redeploy after changing environment variables:**
   - Vercel Dashboard → Deployments → "..." menu → Redeploy

3. **Update OAuth callback URLs:**
   - Google Console: Add `https://tx-sentinel.vercel.app/api/auth/callback/google`
   - GitHub Settings: Add `https://tx-sentinel.vercel.app/api/auth/callback/github`

4. **Verify AUTH_SECRET is at least 32 characters**

5. **Clear browser cache and test in incognito window**

### Database Connection Fails

**Issue:** Database queries fail or timeout

**Common Causes:**
1. `DATABASE_URL` incorrect or missing
2. Database schema not created
3. Migrations not applied

**Solution:**
1. Verify `DATABASE_URL` is correct Supabase connection string
2. Run SQL script to create `ai_agent` schema in Supabase
3. Run `pnpm db:migrate` to apply migrations

### Session Password Not Working

**Issue:** Password dialog doesn't appear or authentication fails

**Common Causes:**
1. `REQUIRE_SESSION_PASSWORD` not set to `"true"` (string)
2. `SESSION_PASSWORD` not configured
3. Database session table missing `sessionPasswordAuthenticated` column

**Solution:**
1. Set `REQUIRE_SESSION_PASSWORD=true` in Vercel environment variables
2. Set `SESSION_PASSWORD` to your desired password
3. Ensure latest migration is applied (includes `sessionPasswordAuthenticated` column)

### OpenAI API Errors

**Issue:** Agent fails to respond or throws API errors

**Common Causes:**
1. `OPENAI_API_KEY` missing or invalid
2. API key has insufficient credits
3. Rate limiting

**Solution:**
1. Verify `OPENAI_API_KEY` is valid and starts with `sk-`
2. Check OpenAI account balance and usage limits
3. Implement session password protection to prevent abuse

## 📊 Monitoring

### Recommended Monitoring

1. **Vercel Analytics**
   - Enable Vercel Analytics in project settings
   - Monitor page performance and user engagement

2. **OpenAI Usage**
   - Monitor API usage in OpenAI dashboard
   - Set up usage alerts
   - Consider implementing rate limiting for production

3. **Database Monitoring**
   - Monitor Supabase database connections and queries
   - Set up connection pooling if needed
   - Review slow queries

4. **Vercel Function Logs**
   - Monitor for Better Auth errors
   - Check for OAuth flow issues
   - Review API endpoint errors

## 🔒 Security Recommendations

1. **Environment Variables**
   - Never commit `.env` file to git (already in `.gitignore`)
   - Use Vercel's encrypted environment variable storage
   - Rotate secrets periodically

2. **Session Password Protection**
   - **CRITICAL:** Enable for production deployments
   - Use a strong password (minimum 16 characters)
   - Share password only with authorized users

3. **OAuth Credentials**
   - Use separate OAuth apps for staging and production
   - Restrict redirect URIs to your domains only
   - Review OAuth scopes regularly

4. **Database Access**
   - Use connection pooling (already configured)
   - Never expose `DATABASE_URL` to client
   - Use custom schema (`ai_agent`), never `public`

## 📝 Additional Notes

- Build time: ~8-9 seconds (Turbopack enabled)
- Expected warning: "Dynamic server usage" (this is normal for SSR with auth)
- Node.js version: 20+ (Vercel default)
- Package manager: pnpm (configured in repository)

## ✅ Final Checklist

Before going live:

- [ ] All environment variables configured in Vercel
- [ ] BETTER_AUTH_URL set to `https://tx-sentinel.vercel.app`
- [ ] Database schema and migrations applied
- [ ] OAuth callback URLs updated in Google Console
- [ ] OAuth callback URLs updated in GitHub Settings
- [ ] Test authentication in production (no 403 errors)
- [ ] Session password protection enabled
- [ ] Test all authentication flows
- [ ] Test agent Q&A functionality
- [ ] Monitor initial OpenAI API usage
- [ ] Set up usage alerts
- [ ] Review Vercel deployment logs

---

**Deployment Status:** Ready for Vercel deployment ✅

**Production URL:** https://tx-sentinel.vercel.app

**Last Updated:** 2026-01-19
