# Production Deployment Errors - Fixes

## Current Errors

### 1. Server Action Not Found (UnrecognizedActionError)
```
Uncaught UnrecognizedActionError: Server Action "40e4a8b13199babf5ade797f5e8289509d946b0c30" was not found on the server.
```

**Cause:** Build ID mismatch between deployed build and browser cache.

**Fix:**

1. **Clear Vercel Build Cache:**
   - Go to Vercel Dashboard → Your Project → Settings
   - Scroll to "Build & Development Settings"
   - Click "Clear Build Cache"

2. **Trigger Fresh Deployment:**
   ```bash
   # Make a trivial change and push
   git commit --allow-empty -m "Trigger fresh deployment"
   git push origin main
   ```

3. **Hard Refresh Browser:**
   - Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear all site data: DevTools → Application → Storage → Clear site data

4. **Verify Server Actions are exported:**
   All Server Actions must be exported from `src/actions/index.ts`
   ✅ Already configured correctly

### 2. Favicon 404 Error
```
Failed to load resource: favicon.ico 404 Not Found
```

**Cause:** We replaced favicon.ico with SVG icons, but browsers still request .ico by default.

**Status:** This is a harmless warning. Next.js automatically serves the SVG icon at `/icon.svg` and browsers will use it. The 404 for favicon.ico can be ignored or fixed by creating a fallback.

**Optional Fix (if you want to eliminate the 404):**

Create a basic ICO file from the SVG (requires external tool or just accept the 404):
- Modern browsers will use `/icon.svg` automatically
- The 404 doesn't affect functionality
- Can be safely ignored

### 3. Password Input Autocomplete Warning
```
[DOM] Input elements should have autocomplete attributes (suggested: "new-password")
```

**Status:** ✅ Fixed - Added `autoComplete="current-password"` to password input

## Deployment Checklist for Production

When deploying to production, always follow these steps:

### Before Deployment

- [ ] Run `pnpm build` locally to verify build succeeds
- [ ] Test all features in local production build (`pnpm start`)
- [ ] Commit all changes to git
- [ ] Push to GitHub

### Vercel Configuration

- [ ] All environment variables set correctly
- [ ] `BETTER_AUTH_URL=https://tx-sentinel.vercel.app` (no localhost!)
- [ ] OAuth callback URLs updated in Google/GitHub consoles
- [ ] Database migrations applied

### After Deployment

- [ ] Clear Vercel build cache if errors occur
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Test in incognito window
- [ ] Verify authentication works
- [ ] Test agent Q&A functionality

## Server Action Error - Deep Dive

Server Actions in Next.js are assigned unique IDs during build. The error occurs when:

1. **Browser has old JavaScript** with old action IDs
2. **Server has new build** with different action IDs
3. **Action ID mismatch** causes "not found" error

**Prevention:**

1. Always clear browser cache after deployment
2. Use version headers (Next.js does this automatically)
3. Clear Vercel build cache if errors persist
4. Ensure all Server Actions are properly exported

**Current Server Actions:**
```typescript
// src/actions/index.ts
export { 
  submitQuestion, 
  getAgentRun, 
  listAgentRuns, 
  deleteAgentRun, 
  deleteAllAgentRuns 
} from "./agent"

export { 
  verifySessionPassword, 
  checkSessionAuth 
} from "./session-auth"
```

All actions are properly exported ✅

## Quick Fix for Production Issues

If you encounter errors on production:

1. **Clear Everything:**
   ```bash
   # In Vercel Dashboard
   Settings → Clear Build Cache
   
   # In Browser
   Hard Refresh (Ctrl+Shift+R)
   OR
   DevTools → Application → Clear site data
   ```

2. **Force Redeploy:**
   ```bash
   git commit --allow-empty -m "Force fresh deployment"
   git push origin main
   ```

3. **Wait for Fresh Build:**
   - Watch Vercel deployment logs
   - Ensure build completes successfully
   - Verify new deployment is active

4. **Test in Incognito:**
   - Open incognito/private window
   - Visit https://tx-sentinel.vercel.app
   - Test authentication and functionality

## Known Issues & Workarounds

### Issue: Old JavaScript Cached in Browser
**Symptom:** Server Action not found error  
**Fix:** Hard refresh or clear site data

### Issue: Build Cache in Vercel
**Symptom:** Old build keeps deploying  
**Fix:** Clear Vercel build cache

### Issue: OAuth 403 Forbidden
**Symptom:** Can't sign in with Google/GitHub  
**Fix:** See OAUTH_PRODUCTION_FIX.md

### Issue: Favicon 404
**Symptom:** Console warning about favicon.ico  
**Impact:** None - this is harmless  
**Fix:** Ignore or create fallback ICO file

## Environment Variable Troubleshooting

If features don't work after deployment:

```bash
# Check in Vercel Dashboard → Settings → Environment Variables

# Required variables:
DATABASE_URL=postgresql://...
DATABASE_SCHEMA=ai_agent
AUTH_SECRET=<32+ characters>
BETTER_AUTH_URL=https://tx-sentinel.vercel.app
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Optional:
REQUIRE_SESSION_PASSWORD=true
SESSION_PASSWORD=your-password
```

**After changing any environment variable:**
1. Click "Save"
2. Redeploy the application
3. Clear browser cache
4. Test functionality

---

## Summary

✅ **Fixed:** Password input autocomplete warning  
⚠️ **Warning:** Favicon 404 is harmless, can be ignored  
🔧 **Action Required:** Clear Vercel build cache and browser cache for Server Action error

**Most Important Fix:**
1. Clear Vercel build cache
2. Force fresh deployment
3. Hard refresh browser

This should resolve all production errors.
