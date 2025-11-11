import { Header } from '@/components/Header'
import { AudioRecorder } from '@/components/AudioRecorder'

export default function Home() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            ECHO
          </h1>
          <p className="text-gray-400 text-lg">
            Record tamper-proof audio with cryptographic verification
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Powered by Aqua Protocol & Nostr
          </p>
        </div>
        <AudioRecorder />
      </main>
    </>
  )
}
