import type { Metadata } from 'next'
import { FeedPage } from '@/components/votely/feed-page'
export const metadata: Metadata = { title: 'Trending polls' }
export default function TrendingPage() { return <FeedPage mode="trending" /> }
