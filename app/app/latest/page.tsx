import type { Metadata } from 'next'
import { FeedPage } from '@/components/votely/feed-page'
export const metadata: Metadata = { title: 'Latest polls' }
export default function LatestPage() { return <FeedPage mode="latest" /> }
