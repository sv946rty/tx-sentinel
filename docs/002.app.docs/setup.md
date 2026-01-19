Setup Required

1. Create a real .env file with your credentials:

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:6543/postgres
DATABASE_SCHEMA=ai_agent

# Authentication (min 32 characters)
AUTH_SECRET=generate-a-secure-random-string-at-least-32-chars

# Google OAuth (https://console.developers.google.com/)
GOOGLE_CLIENT_ID=your-real-google-client-id
GOOGLE_CLIENT_SECRET=your-real-google-client-secret

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=your-real-github-client-id
GITHUB_CLIENT_SECRET=your-real-github-client-secret

# OpenAI
OPENAI_API_KEY=sk-your-real-openai-api-key

2. Run database migrations
You'll need to create the database schema and tables in Supabase. Would you like me to:

1. Generate the Drizzle migration files
2. Show you the manual SQL to run in Supabase SQL Editor
3, Both

3. Configure OAuth callback URLs
For local testing:

Google: Add http://localhost:3000/api/auth/callback/google to authorized redirect URIs
GitHub: Set callback URL to http://localhost:3000/api/auth/callback/github

4. Test locally

pnpm dev
Then visit http://localhost:3000

Which credentials do you already have set up? I can help you through the remaining setup steps.