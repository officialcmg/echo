# ECHO Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Privy account (free at https://dashboard.privy.io)
- Email for testing

## Step-by-Step Setup

### 1. Configure Privy

1. Go to https://dashboard.privy.io
2. Create a new app or use existing
3. **Important Settings**:
   - **Login Methods**: Enable ONLY "Email" (disable all others)
   - **Embedded Wallets**: Enable "Create on login"
   - **Wallet UIs**: Can disable globally or use our code config
   - **Allowed Domains**: Add `localhost:3000` for development

4. Copy your **App ID**

### 2. Set Environment Variables

Create `.env.local` file in the root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Privy App ID:

```env
NEXT_PUBLIC_PRIVY_APP_ID=clpxxx... # Your Privy App ID here
NEXT_PUBLIC_NOSTR_RELAYS=wss://relay.damus.io,wss://relay.snort.social,wss://nos.lol
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Testing the App

### Recording Flow

1. **Login**:
   - Click "Login" button
   - Enter your email
   - Check email for OTP code
   - Enter OTP

2. **Initialize**:
   - App will ask you to sign a message to derive Nostr keys
   - This happens ONCE per session
   - Click "Sign" in the Privy modal

3. **Record**:
   - Click "Start Recording"
   - Speak into your microphone
   - Watch chunks being processed in real-time
   - Every 10 chunks (20 seconds), a Nostr witness is created
   - Click "Stop Recording" when done

4. **Download**:
   - Click "Download" button
   - You'll get TWO files:
     - `echo-recording-XXXXX.webm` - the audio
     - `echo-recording-XXXXX.aqua.json` - the proof

### Verification Flow

1. Go to `/verify` page or click "Verify" in header

2. **Upload Files**:
   - Upload the `.webm` audio file
   - Upload the `.aqua.json` proof file

3. **Verify**:
   - Click "Verify Recording"
   - See results:
     - ✓ Green = All good! Recording is authentic
     - ✗ Red = Tampered or invalid

4. **View Details**:
   - Total chunks
   - Duration
   - Signer wallet address
   - Nostr identity
   - Witness events

## Troubleshooting

### "Failed to access microphone"
- Grant microphone permission in browser
- Check browser supports MediaRecorder API
- Try different browser (Chrome/Edge recommended)

### "NEXT_PUBLIC_PRIVY_APP_ID is not set"
- Make sure `.env.local` exists
- Restart dev server after adding env vars

### "Failed to derive Nostr keys"
- Make sure you signed the initial message
- Check console for errors
- Try logging out and back in

### Verification fails
- Make sure you uploaded the CORRECT pair of files
- Check that files weren't modified after download
- Verify the .aqua.json is valid JSON

## Architecture Notes

### Silent Signing
We use `showWalletUIs: false` in the Privy config and for individual `signMessage` calls:

```typescript
// In providers.tsx
embeddedWallets: {
  showWalletUIs: false, // Global setting
}

// In AudioRecorder.tsx
await signMessage({ message }, {
  uiOptions: { showWalletUIs: false } // Per-call setting
})
```

### Chunking Strategy
- MediaRecorder creates 2-second blobs
- Each blob → Aqua file revision
- First chunk = Genesis revision
- Subsequent chunks = Content revisions
- Each revision auto-links to previous via `prev_verification_hash`

### Witnessing Strategy
- Witness every 10 chunks (20 seconds of audio)
- Post to 3 Nostr relays for redundancy
- Include chunk index and verification hash in Nostr event
- Events are publicly verifiable on Nostr network

### Nostr Key Derivation
```typescript
// User signs a message with Privy wallet
const sig = await signMessage({ message })

// Hash signature to create deterministic seed
const seed = sha256(signature)

// Use seed as Nostr private key
const nostrPrivateKey = seed.slice(0, 32)

// Result: Same Privy signature = Same Nostr keys
// No storage needed, regenerate each session!
```

## Next Steps

1. **Add Privy App ID** to `.env.local`
2. **Start dev server**: `npm run dev`
3. **Test recording flow** end-to-end
4. **Test verification** with downloaded files
5. **Check Nostr events** on https://nostr.band

## Production Deployment

1. Deploy to Vercel/Netlify
2. Add production domain to Privy Dashboard
3. Update `NEXT_PUBLIC_PRIVY_APP_ID` in deployment env vars
4. Test on mobile devices

## Future Enhancements

- [ ] Store Privy→Nostr mapping on Base
- [ ] IPFS integration for permanent storage
- [ ] Real-time streaming with live witnessing
- [ ] Support more audio formats
- [ ] Batch verification of multiple files

---

**Need help?** Check the main README.md or open an issue!
