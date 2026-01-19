# Fix 403 Forbidden Error on Vercel Production

## Issue
`POST https://tx-sentinel.vercel.app/api/auth/sign-in/social 403 (Forbidden)`

This happens when Better Auth configuration doesn't match your production domain.

## Required Fixes

### 1. Update Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**CRITICAL: Update BETTER_AUTH_URL**
```
BETTER_AUTH_URL=https://tx-sentinel.vercel.app
```

Currently it's probably still set to `http://localhost:3000` which causes the 403 error.

**After updating, you MUST redeploy:**
- Vercel → Deployments → Click "..." menu → Redeploy

### 2. Update Google OAuth Console

Go to [Google Cloud Console](https://console.developers.google.com/)

**Add Production URLs:**

**Authorized JavaScript origins:**
- `http://localhost:3000` (keep for local dev)
- `https://tx-sentinel.vercel.app` (add for production)

**Authorized redirect URIs:**
- `http://localhost:3000/api/auth/callback/google` (keep for local dev)
- `https://tx-sentinel.vercel.app/api/auth/callback/google` (add for production)

### 3. Update GitHub OAuth Settings

Go to [GitHub Developer Settings](https://github.com/settings/developers)

**Authorization callback URL:**
- Update to: `https://tx-sentinel.vercel.app/api/auth/callback/github`
- Or add as a new URL if you want to keep localhost for dev

### 4. Verify Environment Variables in Vercel

Make sure ALL these are set:

```
DATABASE_URL=postgresql://...
DATABASE_SCHEMA=ai_agent
AUTH_SECRET=your-32-char-secret
BETTER_AUTH_URL=https://tx-sentinel.vercel.app  ← MUST match your domain
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
REQUIRE_SESSION_PASSWORD=true  ← Recommended for production
SESSION_PASSWORD=your-password
```

## Testing Steps

After making the changes:

1. **Redeploy on Vercel**
   - Go to Vercel Dashboard
   - Click Deployments
   - Click "..." menu on latest deployment
   - Click "Redeploy"

2. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or use Incognito window

3. **Test Sign In**
   - Visit https://tx-sentinel.vercel.app
   - Click "Sign in with Google"
   - Should redirect to Google
   - Should redirect back successfully

## Common Mistakes

❌ **BETTER_AUTH_URL has trailing slash**
```
BETTER_AUTH_URL=https://tx-sentinel.vercel.app/  ← WRONG
```

✅ **Correct format (no trailing slash)**
```
BETTER_AUTH_URL=https://tx-sentinel.vercel.app  ← CORRECT
```

❌ **Using HTTP instead of HTTPS**
```
BETTER_AUTH_URL=http://tx-sentinel.vercel.app  ← WRONG (Vercel uses HTTPS)
```

✅ **Correct protocol**
```
BETTER_AUTH_URL=https://tx-sentinel.vercel.app  ← CORRECT
```

❌ **Forgot to redeploy after changing env vars**
- Environment variable changes don't apply until you redeploy

## Alternative: Use Vercel Preview URLs

If you're using Vercel preview deployments, you can use:

```
BETTER_AUTH_URL=https://${VERCEL_URL}
```

But for production branch (main), it's better to use the actual domain:
```
BETTER_AUTH_URL=https://tx-sentinel.vercel.app
```

## Debug Mode (Optional)

If issues persist, temporarily enable debug mode in src/lib/auth/index.ts:

```typescript
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.BETTER_AUTH_URL],
  
  advanced: {
    debug: true,  // Add this
  },
  
  // ... rest of config
})
```

Then check Vercel Function Logs:
- Vercel Dashboard → Your Project → Logs
- Look for Better Auth debug output

---

## Quick Checklist

- [ ] Update BETTER_AUTH_URL in Vercel to `https://tx-sentinel.vercel.app`
- [ ] Add production URLs to Google OAuth Console
- [ ] Add production callback to GitHub OAuth Settings
- [ ] Verify all environment variables are set in Vercel
- [ ] Redeploy the application
- [ ] Clear browser cache
- [ ] Test sign in flow

After completing these steps, the 403 error should be resolved.
