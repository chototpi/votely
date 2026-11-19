# Votely — Every Voice Matters

Starter project for the Votely global social voting platform.

## Included in Step 1

- Next.js App Router
- TypeScript
- Tailwind CSS
- Responsive Votely home page
- Starter component structure
- Placeholder navigation and poll cards

Pi Sign-In and blockchain voting are intentionally not connected yet. They will be added in later steps after the frontend foundation is running.

## Requirements

- Node.js 20.9 or newer (recommended for Next.js 15)
- npm

## Run locally

1. Extract `votely.zip`.
2. Open the extracted `votely` folder in VS Code or Cursor.
3. Open Terminal in that folder.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open http://localhost:3000

## Important

The polls and statistics currently shown are demo content only. They are not real votes and are not connected to Pi Blockchain.

Do not deploy this starter as a production voting application until authentication, smart-contract verification, replay protection, privacy, and transaction confirmation have been implemented and tested.
