import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'

/**
 * Derives a deterministic Nostr keypair from a Privy wallet signature
 * This creates a cryptographic association between the Privy wallet and Nostr identity
 * WITHOUT storing the Nostr private key anywhere
 */
export async function deriveNostrKeysFromSignature(signature: string): Promise<{
  privateKey: Uint8Array
  publicKey: string
  npub: string
  nsec: string
}> {
  // Remove 0x prefix if present
  const cleanSignature = signature.startsWith('0x') ? signature.slice(2) : signature
  
  // Hash the signature to create a deterministic seed
  const signatureBytes = hexToBytes(cleanSignature)
  const seed = sha256(signatureBytes)
  
  // Use the seed as the Nostr private key
  const privateKey = seed.slice(0, 32) // Ensure 32 bytes
  
  // Derive public key from private key
  const publicKey = getPublicKey(privateKey)
  
  // Encode in bech32 format
  const npub = nip19.npubEncode(publicKey)
  const nsec = nip19.nsecEncode(privateKey)
  
  return {
    privateKey,
    publicKey,
    npub,
    nsec
  }
}

/**
 * Generate a deterministic message for Privy to sign
 * This message should be unique to the session to prevent replay attacks
 */
export function generateNostrDerivationMessage(): string {
  const timestamp = Date.now()
  return `ECHO - Derive Nostr Identity\nTimestamp: ${timestamp}\n\nThis signature will be used to deterministically generate a Nostr keypair for witnessing audio recordings.`
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}
