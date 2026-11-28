import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, MapPin, MessageCircle, Sparkles } from 'lucide-react'
import { demoPolls } from '@/lib/votely-demo'
import { Avatar, PageHeading, PollCard } from '@/components/votely/ui'

export const metadata: Metadata = { title: 'Community profile' }

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const poll = demoPolls.find(item => item.author.username === username) ?? demoPolls[0]
  const author = poll.author
  return <div className="profile-page"><Link href="/" className="back-link"><ArrowLeft size={16} /> Back to feed</Link><div className="profile-cover"><div className="cover-orbit cover-orbit-one" /><div className="cover-orbit cover-orbit-two" /><span className="cover-word">curious by nature</span></div><section className="profile-card"><Avatar initials={author.initials} color={author.color} size="lg" /><div className="profile-main"><div className="profile-name-row"><div><h1>{author.name}</h1><p>@{author.username}</p></div><button className="follow-button" disabled>Follow <Sparkles size={15} /></button></div><p className="profile-bio">Curious about people, places, and the ideas that bring us together. Here to ask better questions and learn something new.</p><div className="profile-facts"><span><MapPin size={14} /> Somewhere in the world</span><span><CalendarDays size={14} /> Joined recently</span></div><div className="profile-stats"><div><strong>08</strong><span>Polls</span></div><div><strong>1.8k</strong><span>Votes received</span></div><div><strong>340</strong><span>Conversations</span></div></div></div></section><div className="profile-content-heading"><div><p className="eyebrow">COMMUNITY CONTRIBUTIONS</p><h2>Polls by {author.name.split(' ')[0]}</h2></div><span className="sample-pill">Sample profile</span></div><div className="poll-stream"><PollCard poll={poll} /></div><div className="profile-footnote"><MessageCircle size={15} /> Activity shown here is sample preview content.</div></div>
}
