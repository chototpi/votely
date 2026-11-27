import Link from 'next/link'
import { ArrowRight, Flame, Sparkles, Users } from 'lucide-react'
import { demoPolls } from '@/lib/votely-demo'
import { FeedTabs, PageHeading, PollCard } from '@/components/votely/ui'

export function FeedPage({ mode = 'home' }: { mode?: 'home' | 'featured' | 'trending' | 'latest' }) {
  const config = {
    home: { eyebrow: 'THE COMMUNITY FEED', title: 'Good questions bring us closer.', description: 'A little curiosity goes a long way. See what the community is thinking about.', active: 'For you', polls: demoPolls.slice(0, 3) },
    featured: { eyebrow: 'HANDPICKED FOR YOU', title: 'Featured conversations', description: 'Promoted polls from voices and communities worth hearing.', active: 'For you', polls: demoPolls.filter(poll => poll.sponsored) },
    trending: { eyebrow: 'THE COMMUNITY IS TALKING', title: 'Trending right now', description: 'Conversations gaining momentum, shaped by community engagement.', active: 'Trending', polls: [...demoPolls].sort((a, b) => b.votes - a.votes) },
    latest: { eyebrow: 'FRESH PERSPECTIVES', title: 'The latest polls', description: 'New questions from across the Votely community.', active: 'Latest', polls: [...demoPolls].reverse() },
  }[mode]
  return <div className="feed-layout"><section className="feed-column"><PageHeading eyebrow={config.eyebrow} title={config.title} description={config.description} />
    <div className="feed-welcome-strip"><div className="welcome-icon"><Users size={18} /></div><div><strong>Better conversations start with you.</strong><p>Explore perspectives from people around the world.</p></div><Link href="/explore" aria-label="Explore polls"><ArrowRight size={18} /></Link></div>
    <FeedTabs active={config.active} />
    <div className="poll-stream">{config.polls.map(poll => <PollCard key={poll.id} poll={poll} />)}</div>
    <div className="load-more"><span>You’re all caught up</span><span className="load-more-rule" /></div>
  </section><aside className="right-rail"><div className="rail-card community-card"><div className="rail-card-heading"><div><p className="rail-eyebrow">A WORLD OF PERSPECTIVES</p><h3>Curiosity connects us.</h3></div><div className="orbit-mark"><Sparkles size={18} /></div></div><p>Every poll is a chance to learn something new from someone new.</p><div className="community-stat"><div className="avatar-stack"><span className="mini-avatar mini-lavender">MC</span><span className="mini-avatar mini-cyan">TM</span><span className="mini-avatar mini-rose">AK</span><span className="mini-avatar mini-mint">NJ</span></div><span><strong>12k+</strong> curious voices</span></div></div>
    <div className="rail-card"><div className="rail-title-row"><h3>Popular topics</h3><Link href="/explore">See all</Link></div><div className="topic-list"><Link href="/explore?topic=Community"><span className="topic-dot dot-violet" /><span>Community</span><small>2.4k polls</small></Link><Link href="/explore?topic=Technology"><span className="topic-dot dot-cyan" /><span>Technology</span><small>1.8k polls</small></Link><Link href="/explore?topic=Culture"><span className="topic-dot dot-rose" /><span>Culture</span><small>986 polls</small></Link></div><Link href="/explore" className="rail-more">Explore all topics <ArrowRight size={14} /></Link></div>
    <div className="rail-card trending-card"><div className="rail-title-row"><h3><Flame size={16} className="flame-icon" /> Trending today</h3><Link href="/trending">View all</Link></div><Link href="/poll/learning-future" className="trending-teaser"><span className="trend-number">01</span><span><strong>Skills for the future</strong><small>967 voices · Learning</small></span><ArrowRight size={15} /></Link><Link href="/poll/weekend-ritual" className="trending-teaser"><span className="trend-number">02</span><span><strong>Your slow Sunday</strong><small>528 voices · Lifestyle</small></span><ArrowRight size={15} /></Link></div>
    <footer className="rail-footer"><span>About</span><span>Community guidelines</span><span>Privacy</span><span>© 2026 Votely</span></footer>
  </aside></div>
}
