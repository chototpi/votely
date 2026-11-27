import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BarChart3, Clock3, MessageCircle, Share2 } from 'lucide-react'
import { demoPolls } from '@/lib/votely-demo'
import { Avatar, CommentSection, PageHeading, ResultBar } from '@/components/votely/ui'

export const metadata: Metadata = { title: 'Poll conversation' }

export default async function PollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const poll = demoPolls.find(item => item.id === id)
  if (!poll) notFound()
  const total = poll.options.reduce((sum, option) => sum + option.votes, 0)
  return <div className="detail-layout"><section className="detail-main"><Link href="/" className="back-link"><ArrowLeft size={16} /> Back to conversations</Link><PageHeading eyebrow="POLL CONVERSATION" title="A question worth sharing." description="See the poll, sample results, and community discussion." />
    <article className="poll-card detail-poll">{poll.sponsored && <div className="sponsored-line"><span className="sponsored-dot" /> SPONSORED <span className="sponsored-note">· Featured community poll</span></div>}<div className="poll-author"><Link href={`/profile/${poll.author.username}`}><Avatar initials={poll.author.initials} color={poll.author.color} /></Link><div className="author-meta"><Link href={`/profile/${poll.author.username}`} className="author-name">{poll.author.name}</Link><span>@{poll.author.username} <span className="meta-separator">·</span> {poll.createdAt}</span></div></div><span className="category-pill">{poll.category}</span><h2 className="detail-question">{poll.question}</h2>{poll.description && <p className="detail-description">{poll.description}</p>}{poll.image && <img className="detail-image" src={poll.image} alt="Friends talking together at a community gathering" />}<div className="detail-results"><div className="results-heading"><div><span className="eyebrow">COMMUNITY RESULTS</span><h3>What people are saying</h3></div><span className="results-live"><span /> Sample results</span></div><div className="detail-options">{poll.options.map((option, index) => <ResultBar key={option.id} option={option} total={total} selected={option.id === poll.votedOptionId} index={index} />)}</div><p className="total-votes"><BarChart3 size={15} /> {poll.votes.toLocaleString()} sample votes</p><p className="preview-action-note">Preview data only · this poll does not accept votes</p></div><div className="poll-footer"><div className="poll-stats"><span><Clock3 size={15} /> {poll.closesIn}</span><span><MessageCircle size={15} /> {poll.comments} comments</span></div><div className="poll-actions"><button aria-label="Share poll" className="quiet-icon"><Share2 size={17} /></button></div></div></article>
    <CommentSection />
  </section><aside className="detail-rail"><div className="rail-card detail-context"><p className="rail-eyebrow">A NOTE ABOUT THIS PREVIEW</p><h3>Sample data, real curiosity.</h3><p>This is a UI preview. Results and comments are illustrative and are not connected to live accounts or the Votely backend.</p><Link href="/explore">Explore more polls <ArrowLeft size={14} className="rotate-arrow" /></Link></div><div className="rail-card"><h3 className="rail-heading">Poll snapshot</h3><div className="snapshot-stat"><strong>{poll.votes.toLocaleString()}</strong><span>sample votes</span></div><div className="snapshot-stat"><strong>{poll.options.length}</strong><span>answer choices</span></div><div className="snapshot-stat"><strong>{poll.closesIn.split(' ')[0]}</strong><span>days remaining</span></div></div></aside></div>
}
