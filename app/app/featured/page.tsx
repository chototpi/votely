import type { Metadata } from 'next'
import { FeedPage } from '@/components/votely/feed-page'
export const metadata: Metadata = { title: 'Featured polls' }
export default function FeaturedPage() { return <FeedPage mode="featured" /> }
