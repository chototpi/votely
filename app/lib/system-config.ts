export const PI_NETWORK_CONFIG = {
  SDK_URL: "https://sdk.minepi.com/pi-sdk.js",
  SANDBOX: false,
  CLIENT_ID: process.env.NEXT_PUBLIC_PI_CLIENT_ID ?? "-DVJnlKWdEt7PBAYWzsKee0g614YsEzCZp4rIUxoVto",
  REDIRECT_URI: process.env.NEXT_PUBLIC_PI_REDIRECT_URI ?? "https://votely-five.vercel.app/auth/pi/callback",
} as const;
