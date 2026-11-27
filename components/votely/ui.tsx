'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Compass, Flame, Home, Plus, Search, Sparkles, Clock3, MessageCircle, ArrowUpRight, Check, ChevronRight, MoreHorizontal, Bookmark, Share2, Send, BarChart3 } from 'lucide-react'
import type { Poll, PollOption } from '@/lib/votely-demo'
import { demoComments } from '@/lib/votely-demo'
import { useState } from 'react'

const mainLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Featured', href: '/featured', icon: Sparkles },
  { label: 'Trending', href: '/trending', icon: Flame },
  { label: 'Latest', href: '/latest', icon: Clock3 },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-[#f8f8fc] text-[#202033]">
      <div className="preview-ribbon"><span className="preview-dot" /> Preview environment <span className="ribbon-divider">·</span> Sample community data, not live polls</div>
      <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-[1440px]">
        <aside className="hidden w-[248px] shrink-0 border-r border-[#ececf3] bg-white px-5 pb-8 pt-7 lg:flex lg:flex-col">
          <Link href="/" className="brand-lockup"><span className="brand-mark">v</span><span>votely<span className="brand-period">.</span></span></Link>
          <div className="mt-10"><p className="nav-eyebrow">YOUR SPACE</p><nav aria-label="Primary navigation" className="mt-3 flex flex-col gap-1">{mainLinks.map(({ label, href, icon: Icon }) => <NavLink key={href} href={href} label={label} icon={<Icon size={19} strokeWidth={1.8} />} active={pathname === href} />)}</nav></div>
          <div className="mt-8"><p className="nav-eyebrow">YOUR COMMUNITY</p><div className="mt-3 flex flex-col gap-1"><NavLink href="/profile/maya.chen" label="My profile" icon={<span className="sidebar-avatar">MC</span>} active={pathname.startsWith('/profile')} /></div></div>
          <div className="sidebar-prompt mt-auto"><div className="prompt-icon"><Sparkles size={17} /></div><p className="font-semibold text-[#2c2940]">Your voice matters.</p><p className="mt-1 text-xs leading-5 text-[#77758b]">Join a global community shaping better conversations.</p><Link href="/explore" className="prompt-link">Explore polls <ArrowUpRight size={14} /></Link></div>
          <div className="sidebar-user"><Avatar initials="MC" color="lavender" size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Maya Chen</p><p className="text-xs text-[#89889a]">@maya.chen</p></div><MoreHorizontal size={18} className="text-[#9997a8]" /></div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="topbar"><Link href="/" className="brand-lockup lg:hidden"><span className="brand-mark">v</span><span>votely<span className="brand-period">.</span></span></Link><div className="top-search"><Search size={17} /><span>Search conversations, people...</span><kbd>⌘ K</kbd></div><div className="top-actions"><Link href="/explore" aria-label="Search" className="mobile-search lg:hidden"><Search size={19} /></Link><button className="icon-button" aria-label="Notifications"><Bell size={19} /><span className="notification-dot" /></button><Link href="/profile/maya.chen" className="top-avatar"><Avatar initials="MC" color="lavender" size="sm" /></Link><Link href="/explore" className="create-button"><Plus size={17} /> <span>Start a poll</span></Link></div></header>
          <main className="page-frame">{children}</main>
        </div>
      </div>
      <nav className="mobile-nav lg:hidden" aria-label="Mobile navigation">{mainLinks.map(({ label, href, icon: Icon }) => <Link href={href} key={href} className={`mobile-nav-link ${pathname === href ? 'is-active' : ''}`}><Icon size={20} strokeWidth={pathname === href ? 2.2 : 1.8} /><span>{label}</span></Link>)}</nav>
    </div>
  )
}

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return <Link href={href} className={`side-link ${active ? 'active' : ''}`}>{icon}<span>{label}</span>{label === 'Featured' && <span className="nav-count">12</span>}</Link>
}

export function Avatar({ initials, color, size = 'md', image }: { initials: string; color: string; size?: 'sm' | 'md' | 'lg'; image?: string }) {
  return image ? <img className={`avatar avatar-${size}`} src={image} alt={`${initials} avatar`} /> : <span className={`avatar avatar-${size} avatar-${color}`} aria-label={`${initials} avatar`}>{initials}</span>
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action}</div>
}

export function FeedTabs({ active = 'For you' }: { active?: string }) {
  const tabs = [{ label: 'For you', href: '/' }, { label: 'Trending', href: '/trending' }, { label: 'Latest', href: '/latest' }]
  return <div className="feed-tabs" role="tablist" aria-label="Poll feed">{tabs.map(tab => <Link key={tab.href} href={tab.href} role="tab" aria-selected={active === tab.label} className={`feed-tab ${active === tab.label ? 'active' : ''}`}>{tab.label}{tab.label === 'Trending' && <span className="tab-spark">↗</span>}</Link>)}</div>
}

export function PollCard({ poll }: { poll: Poll }) {
  const total = poll.options.reduce((sum, option) => sum + option.votes, 0)
  return <article className="poll-card">
    {poll.sponsored && <div className="sponsored-line"><span className="sponsored-dot" /> SPONSORED <span className="sponsored-note">· Featured community poll</span></div>}
    <div className="poll-author"><Link href={`/profile/${poll.author.username}`}><Avatar initials={poll.author.initials} color={poll.author.color} /></Link><div className="author-meta"><Link href={`/profile/${poll.author.username}`} className="author-name">{poll.author.name}{poll.author.verified && <span className="verified-check"><Check size={10} /></span>}</Link><span>@{poll.author.username} <span className="meta-separator">·</span> {poll.createdAt}</span></div><button className="quiet-icon" aria-label="More poll actions"><MoreHorizontal size={19} /></button></div>
    <Link href={`/poll/${poll.id}`} className="poll-question-link"><h2 className="poll-question">{poll.question}</h2></Link>
    {poll.description && <p className="poll-description">{poll.description}</p>}
    {poll.image && <Link href={`/poll/${poll.id}`} className="poll-image-wrap"><img src={poll.image} alt="Friends sharing a conversation at a community gathering" className="poll-image" /><span className="image-caption"><span className="image-caption-icon">✳</span> A conversation starts here</span></Link>}
    <div className="poll-category-row"><span className="category-pill">{poll.category}</span><span className="poll-closes">{poll.closesIn}</span></div>
    <div className="options-wrap"><VoteOptions options={poll.options} total={total} selectedId={poll.votedOptionId} /></div>
    <div className="poll-footer"><div className="poll-stats"><span><BarChart3 size={15} /> {poll.votes.toLocaleString()} votes</span><Link href={`/poll/${poll.id}#comments`}><MessageCircle size={15} /> {poll.comments} comments</Link></div><div className="poll-actions"><button aria-label="Bookmark poll" className="quiet-icon"><Bookmark size={17} /></button><button aria-label="Share poll" className="quiet-icon"><Share2 size={17} /></button></div></div>
    <p className="preview-action-note">Preview only · voting is not connected</p>
  </article>
}

export function VoteOptions({ options, total, selectedId }: { options: PollOption[]; total: number; selectedId?: string }) {
  return <div className="vote-options" aria-label="Sample poll options">{options.map((option, index) => <ResultBar key={option.id} option={option} total={total} selected={option.id === selectedId} index={index} />)}</div>
}

export function ResultBar({ option, total, selected, index = 0 }: { option: PollOption; total: number; selected: boolean; index?: number }) {
  const percentage = total ? Math.round(option.votes / total * 100) : 0
  return <div className={`result-option ${selected ? 'selected' : ''}`}><div className="result-track"><span className={`result-fill fill-${index % 4}`} style={{ width: `${percentage}%` }} /></div><span className="result-label">{option.label}</span><span className="result-value">{percentage}%</span>{selected && <span className="result-selected"><Check size={11} /></span>}</div>
}

export function CommentSection({ compact = false }: { compact?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <section id="comments" className={`comments-section ${compact ? 'compact' : ''}`}>
      <div className="comments-heading">
        <div><h3>Conversation</h3><p>Thoughtful takes make better polls.</p></div>
        <button className="comment-count">86 <ChevronRight size={15} /></button>
      </div>
      <div className="comment-compose">
        <Avatar initials="MC" color="lavender" size="sm" />
        <div className="compose-placeholder"><span>Add your perspective...</span><button aria-label="Send comment" disabled><Send size={15} /></button></div>
      </div>
      <div className="comment-list">
        {demoComments.slice(0, compact ? 1 : 2).map(comment => (
          <div className="comment-row" key={comment.id}>
            <Avatar initials={comment.initials} color={comment.color} size="sm" />
            <div className="comment-body">
              <div className="comment-meta">
                <Link href={`/profile/${comment.username}`} className="author-name">{comment.name}</Link>
                <span>{comment.time}</span>
                <button aria-label="More comment actions"><MoreHorizontal size={15} /></button>
              </div>
              <p>{comment.text}</p>
              <button className="reply-button" onClick={() => setExpanded(!expanded)}>{expanded ? 'Reply preview unavailable' : 'Reply'}</button>
            </div>
          </div>
        ))}
      </div>
      <p className="preview-action-note">Sample comments · discussion is read-only in preview</p>
    </section>
  )
}

export function StateNotice({ type, title, message }: { type: 'loading' | 'empty' | 'error'; title: string; message: string }) {
  return <div className={`state-notice state-${type}`} role={type === 'error' ? 'alert' : 'status'}><div className="state-mark">{type === 'loading' ? <span className="loading-spinner" /> : type === 'error' ? '!' : '◌'}</div><div><h3>{title}</h3><p>{message}</p></div></div>
}
