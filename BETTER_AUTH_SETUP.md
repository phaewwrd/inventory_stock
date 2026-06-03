# Better Auth Setup - Quick Reference

## ✅ Installed Components

1. **Dependencies**: `better-auth`, `better-sqlite3`
2. **Database**: SQLite (`auth.db`)
3. **Environment Variables**: `.env` with `BETTER_AUTH_SECRET`
4. **Session Duration**: 30 days (with remember me functionality)

## 📁 Files Created

### Authentication Core
- [lib/auth.ts](lib/auth.ts) - Server-side auth configuration with 30-day session support
- [lib/auth-client.ts](lib/auth-client.ts) - Client-side React hooks
- [app/api/auth/[...all]/route.ts](app/api/auth/[...all]/route.ts) - API route handler
- [.env](.env) - Environment variables (keep secret!)
- [.env.example](.env.example) - Example env file

### Pages
- [app/page.tsx](app/page.tsx) - Home page with auth redirect
- [app/login/page.tsx](app/login/page.tsx) - Sign-in page (StockMS design)
- [app/signup/page.tsx](app/signup/page.tsx) - Sign-up page
- [app/forgot-password/page.tsx](app/forgot-password/page.tsx) - Password reset page
- [app/dashboard/page.tsx](app/dashboard/page.tsx) - Protected dashboard page

## 🎨 Sign-In Page Features

The login page includes:
- ✅ Email and password authentication
- ✅ "Remember me for 30 days" checkbox
- ✅ Password visibility toggle
- ✅ Forgot password link
- ✅ Company SSO button (placeholder)
- ✅ Responsive design matching StockMS branding
- ✅ Left panel with branding and statistics
- ✅ Error handling and loading states

## 🚀 Usage Examples
  rememberMe: true, // Session will last 30 days

### Sign Up a User

```tsx
import { signUp } from "@/lib/auth-client";

await signUp.email({
  email: "user@example.com",
  password: "securePassword123",
  name: "John Doe",
});
```

### Sign In

```tsx
import { signIn } from "@/lib/auth-client";

await signIn.email({
  email: "user@example.com",
  password: "securePassword123",
});
```

### Check Session

```tsx
"use client";
import { useSession } from "@/lib/auth-client";

export default function Profile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Sign Out

```tsx
import { signOut } from "@/lib/auth-client";

await signOut();
```

## 🔧 Adding Social Providers

To add OAuth providers, uncomment and configure in [lib/auth.ts](lib/auth.ts):

```typescript
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
}
```

Then add the credentials to your `.env` file.
🧪 Testing Your Setup

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Visit the app**: Open http://localhost:3000
   - You'll be redirected to `/login`

3. **Create an account**:
   - Click "Sign up" or go to http://localhost:3000/signup
   - Enter your name, email, and password
   - You'll be redirected to the dashboard

4. **Test sign-in**:
   - Visit `/login`
   - Enter your credentials
   - Check "Remember me for 30 days" to keep your session
   - Click "Sign in"

5. **Access protected routes**:
   - Dashboard at `/dashboard` (requires authentication)
   - Sign out from the dashboard header

## 🔒 Session Configuration

The auth system is configured with:
- **Session duration**: 30 days (2,592,000 seconds)
- **Session update interval**: 24 hours
- **Remember me**: Supported via `rememberMe` parameter
- **Database**: SQLite with tables for users, sessions, accounts, and verification

## 
## 📚 Documentation

Full documentation: https://better-auth.com/docs
