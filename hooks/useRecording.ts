'use client'

import { useState, useRef, useCallback } from 'react'
import { AquaChunkData } from '@/lib/aqua/types'

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const [chunks, setChunks] = useState<AquaChunkData[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunkIndexRef = useRef(0)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setChunks([])
      chunkIndexRef.current = 0

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      })
      
      streamRef.current = stream

      // Use webm format with opus codec (widely supported)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const chunkData: AquaChunkData = {
            chunkIndex: chunkIndexRef.current,
            audioBlob: event.data,
            fileName: `chunk_${chunkIndexRef.current}.webm`,
            timestamp: Date.now(),
          }

          setChunks((prev) => [...prev, chunkData])
          chunkIndexRef.current++
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setError('Recording error occurred')
        stopRecording()
      }

      // Record in 2-second chunks
      mediaRecorder.start(2000)
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('Failed to access microphone. Please grant permission.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsRecording(false)
  }, [])

  const resetRecording = useCallback(() => {
    setChunks([])
    setError(null)
    chunkIndexRef.current = 0
  }, [])

  return {
    isRecording,
    chunks,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  }
}
