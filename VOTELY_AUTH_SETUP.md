# Votely – Pi Sign-In setup

## Implemented
- Public browsing remains available without signing in.
- Manual Pi login button.
- Pi Browser login uses `Pi.init()` + `Pi.authenticate(["username"])`.
- Ordinary browsers use Pi Sign-In OAuth implicit flow and verify the returned `state`.
- Both login paths send the access token to the Next.js server route `/api/auth/pi`.
- The Next.js route signs a server-to-server HMAC request to the existing DirectAdmin route `/api/votely/sync-user`.
- Access token is stored in `localStorage` as requested. It is re-verified by the app on startup (with a short five-minute cache).
- Logout clears the locally stored token and user profile.
- User actions that require an account prompt Pi login.
- Removed App Studio auth/user-state backend usage. Local demo data is saved in browser storage, isolated by Pi UID.

## Vercel Environment Variables
Set these in Vercel (Production and Preview as needed):
- `NEXT_PUBLIC_PI_CLIENT_ID` = existing Pi OAuth Client ID
- `NEXT_PUBLIC_PI_REDIRECT_URI` = `https://votely-five.vercel.app/auth/pi/callback`
- `VOTELY_SERVICE_SECRET` = same secret configured in DirectAdmin (never expose with `NEXT_PUBLIC_`)
- `VOTELY_BACKEND_URL` = `https://chototpi.site/register-backend`

The first two values have safe production defaults in `lib/system-config.ts`, but setting them explicitly is recommended.

## Pi Developer Portal
Confirm this exact redirect URI is registered:
`https://votely-five.vercel.app/auth/pi/callback`

Pi Sign-In OAuth currently returns its token in the URL fragment. The callback checks `state` and removes the fragment from browser history after reading it.

## Important limitations
- The access token is deliberately stored in `localStorage` per the project owner's choice. This is convenient but JavaScript running through an XSS vulnerability could read it. Keep dependencies updated and avoid unsafe HTML/script injection.
- Pi access tokens are short-lived and have no refresh token; the user must sign in again after expiry.
- Polls, votes, comments, VT ledger, and wallet state are still browser-local demo state. The current DirectAdmin backend only exposes account sync and VT balance/history; it does not yet expose the full Poll/Vote/Comment APIs.
- Rewarded ads are not connected to a verified ad provider; the demo ad dialog no longer credits VT.
- Voting is free pending a final product decision. Creating a poll still uses the existing 1 VT UI rule, but its transaction is currently local/demo only and is not yet authoritative.
- SDKLite products/ads are not initialized by this login implementation; those features need a separate provider integration.
