'use client'

import { useEffect } from 'react'
import { StateNotice } from '@/components/votely/ui'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Votely page error:', error) }, [error])
  return <div className="error-page"><StateNotice type="error" title="That didn’t load as expected" message="Please try again. If the issue continues, come back in a little while." /><button className="create-button retry-button" onClick={() => reset()}>Try again</button></div>
}
