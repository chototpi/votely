import Link from 'next/link'
import { StateNotice } from '@/components/votely/ui'
export default function NotFound() { return <div className="error-page"><StateNotice type="empty" title="We couldn’t find that poll" message="It may have moved, or the link may be out of date." /><Link className="create-button retry-button" href="/">Back to the feed</Link></div> }
