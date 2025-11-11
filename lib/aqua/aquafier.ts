// For Next.js/React/Web applications, use the /web import
import Aquafier, { 
  type AquaTree, 
  type FileObject, 
  type Result, 
  type AquaOperationData, 
  type LogData,
  type InlineSignerOptions,
  type InlineWitnessOptions,
  isOk,
  isErr
} from 'aqua-js-sdk/web'
import { blobToArrayBuffer } from '@/lib/utils'

// Export types for use in components
export type { AquaTree, FileObject, Result, AquaOperationData, LogData }
export { isOk, isErr }

export function createAquafier() {
  return new Aquafier()
}

/**
 * Create a genesis revision (first chunk of audio)
 * enableContent=true embeds content IN the revision
 * This way verification works without needing external files
 */
export async function createGenesisRevision(
  aquafier: Aquafier,
  audioBlob: Blob,
  fileName: string
): Promise<Result<AquaOperationData, LogData[]>> {
  const fileContent = await blobToArrayBuffer(audioBlob)
  
  const fileObject: FileObject = {
    fileName,
    fileContent: new Uint8Array(fileContent),
    path: `/${fileName}`, // Virtual path for browser
  }
  
  // Params: fileObject, isForm, enableContent, enableScalar
  // enableContent=TRUE embeds the content (works without external files)
  return aquafier.createGenesisRevision(fileObject, false, true, false)
}

/**
 * Create a content revision (subsequent audio chunks)
 * enableScalar=false uses tree mode (Merkle root) to match genesis revision
 * 
 * NOTE: There's a bug in aqua-js-sdk where enableScalar is INVERTED for content revisions!
 * - enableScalar=true incorrectly uses Merkle tree hashing
 * - enableScalar=false incorrectly uses scalar hashing
 * This is backwards compared to all other revision types.
 * We use false here to match the genesis revision's tree mode.
 */
export async function createContentRevision(
  aquafier: Aquafier,
  aquaTree: AquaTree,
  audioBlob: Blob,
  fileName: string,
  prevHash: string
): Promise<Result<AquaOperationData, LogData[]>> {
  const fileContent = await blobToArrayBuffer(audioBlob)
  
  const fileObject: FileObject = {
    fileName,
    fileContent: new Uint8Array(fileContent),
    path: `/${fileName}`,
  }
  
  // enableScalar=FALSE - Due to SDK bug, this actually uses scalar mode (what we want)
  // This matches the genesis revision's mode
  return aquafier.createContentRevision(
    { aquaTree, revision: prevHash, fileObject: undefined },
    fileObject,
    false // Use FALSE to work around SDK bug and match genesis
  )
}

/**
 * Sign a revision with Privy wallet (inline signing)
 */
export async function signRevision(
  aquafier: Aquafier,
  aquaTree: AquaTree,
  signature: string,
  walletAddress: string,
  prevHash: string
): Promise<Result<AquaOperationData, LogData[]>> {
  const inlineSignerOptions: InlineSignerOptions = {
    walletAddress,
    signature,
  }
  
  // Create empty credentials (not used for inline signing)
  const credentials = {
    mnemonic: '',
    nostr_sk: '',
    did_key: '',
    alchemy_key: '',
    witness_eth_network: '',
    witness_method: '',
  }
  
  return aquafier.signAquaTree(
    { aquaTree, revision: prevHash, fileObject: undefined },
    'inline',
    credentials,
    false, // enableScalar
    undefined, // reactNativeOptions
    inlineSignerOptions
  )
}

/**
 * Witness a revision on Nostr network
 */
export async function witnessOnNostr(
  aquafier: Aquafier,
  aquaTree: AquaTree,
  prevHash: string,
  nostrPrivateKey: string,
  eventId: string,
  walletAddress: string
): Promise<Result<AquaOperationData, LogData[]>> {
  const inlineWitnessOptions: InlineWitnessOptions = {
    transaction_hash: eventId,
    wallet_address: walletAddress,
  }
  
  const credentials = {
    mnemonic: '',
    nostr_sk: nostrPrivateKey,
    did_key: '',
    alchemy_key: '',
    witness_eth_network: '',
    witness_method: 'inline',
  }
  
  return aquafier.witnessAquaTree(
    { aquaTree, revision: prevHash, fileObject: undefined },
    'nostr',
    'mainnet', // not used for nostr but required
    'inline',
    credentials,
    false, // enableScalar
    inlineWitnessOptions
  )
}

/**
 * Verify an entire Aqua Tree
 */
export async function verifyAquaTree(
  aquafier: Aquafier,
  aquaTree: AquaTree,
  fileObjects: FileObject[] = []
): Promise<Result<AquaOperationData, LogData[]>> {
  return aquafier.verifyAquaTree(aquaTree, fileObjects)
}
