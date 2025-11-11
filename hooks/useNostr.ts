'use client'

import { useState, useCallback } from 'react'
import { SimplePool, Event, finalizeEvent } from 'nostr-tools'

const RELAYS = (process.env.NEXT_PUBLIC_NOSTR_RELAYS || '').split(',').filter(Boolean)

export function useNostr() {
  const [pool] = useState(() => new SimplePool())
  const [publishedEvents, setPublishedEvents] = useState<Event[]>([])

  const publishWitness = useCallback(
    async (
      privateKey: Uint8Array,
      content: string,
      tags: string[][] = []
    ): Promise<{ eventId: string; relays: string[] }> => {
      const event = finalizeEvent(
        {
          kind: 1, // Regular note
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ['t', 'aqua-witness'],
            ['t', 'echo-recording'],
            ...tags,
          ],
          content,
        },
        privateKey
      )

      const publishedTo = await Promise.all(pool.publish(RELAYS, event))
      
      setPublishedEvents((prev) => [...prev, event])

      return {
        eventId: event.id,
        relays: publishedTo,
      }
    },
    [pool]
  )

  const getEvent = useCallback(
    async (eventId: string): Promise<Event | null> => {
      const event = await pool.get(RELAYS, { ids: [eventId] })
      return event
    },
    [pool]
  )

  return {
    publishWitness,
    getEvent,
    publishedEvents,
    relays: RELAYS,
  }
}
