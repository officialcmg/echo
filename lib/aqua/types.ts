export interface AquaChunkData {
  chunkIndex: number
  audioBlob: Blob
  fileName: string
  timestamp: number
  verificationHash?: string
}

export interface RecordingSession {
  chunks: AquaChunkData[]
  aquaTree: any // Aqua SDK type
  startTime: number
  endTime?: number
  nostrWitnesses: NostrWitness[]
}

export interface NostrWitness {
  chunkIndex: number
  eventId: string
  timestamp: number
  relays: string[]
}

export interface ExportData {
  audio: Blob
  aquaTree: any
  metadata: {
    totalChunks: number
    duration: number
    privyWallet: string
    nostrPubkey: string
    witnesses: NostrWitness[]
  }
}
