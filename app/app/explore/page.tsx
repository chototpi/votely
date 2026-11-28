'use client'

import Link from 'next/link'
import { Search, ArrowUpRight, Sparkles, UsersRound, Cpu, Heart, Palette, BookOpen, Leaf } from 'lucide-react'
import { useMemo, useState } from 'react'
import { categories, demoPolls } from '@/lib/votely-demo'
import { PageHeading, PollCard, StateNotice } from '@/components/votely/ui'

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => demoPolls.filter(poll => `${poll.question} ${poll.category} ${poll.author.name}`.toLowerCase().includes(query.toLowerCase())), [query])
  const categoryIcons = [UsersRound, Cpu, Heart, Palette, BookOpen, Leaf]
  return <div className="explore-page"><PageHeading eyebrow="FIND YOUR NEXT CONVERSATION" title="Explore what’s on people’s minds." description="Find a topic you care about, or discover a perspective you didn’t expect." />
    <label className="explore-search"><Search size={19} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search polls, topics, or people" aria-label="Search polls, topics, or people" /><kbd>⌘ K</kbd></label>
    <section className="explore-section"><div className="section-heading"><div><p className="eyebrow">BROWSE BY INTEREST</p><h2>Explore topics</h2></div><span className="section-caption">A little something for every curious mind</span></div><div className="category-grid">{categories.map((category, index) => { const Icon = categoryIcons[index]; return <Link href={`/explore?topic=${category.name}`} key={category.name} className={`category-card category-${category.color}`}><span className="category-icon" aria-hidden="true"><Icon size={17} strokeWidth={1.8} /></span><span className="category-card-copy"><strong>{category.name}</strong><small>{category.count}</small></span><ArrowUpRight size={16} className="category-arrow" /><span className="category-orb" aria-hidden="true" /></Link> })}</div></section>
    <section className="explore-section"><div className="section-heading"><div><p className="eyebrow">CURATED FOR CURIOSITY</p><h2>{query ? 'Search results' : 'Conversations to explore'}</h2></div><span className="section-caption">{filtered.length} sample polls</span></div>{filtered.length ? <div className="explore-polls">{filtered.slice(0, 3).map(poll => <PollCard key={poll.id} poll={poll} />)}</div> : <StateNotice type="empty" title="No matching conversations yet" message="Try a different word or browse a topic above." />}</section>
    <div className="explore-cta"><div className="cta-spark"><Sparkles size={19} /></div><div><strong>Good questions make great communities.</strong><p>Find a conversation worth being part of.</p></div><Link href="/featured">Discover featured <ArrowUpRight size={15} /></Link></div>
  </div>
}
