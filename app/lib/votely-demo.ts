export type PollOption = {
  id: string
  label: string
  votes: number
}

export type Poll = {
  id: string
  question: string
  description?: string
  category: string
  author: { username: string; name: string; initials: string; color: string; verified?: boolean }
  createdAt: string
  closesIn: string
  votes: number
  comments: number
  options: PollOption[]
  votedOptionId?: string
  sponsored?: boolean
  image?: string
}

export const demoPolls: Poll[] = [
  {
    id: 'community-spaces',
    question: 'What makes a community feel like home to you?',
    description: 'We’re collecting the little things that make a big difference.',
    category: 'Community',
    author: { username: 'maya.chen', name: 'Maya Chen', initials: 'MC', color: 'lavender', verified: true },
    createdAt: '12 min ago',
    closesIn: '5 days left',
    votes: 1842,
    comments: 86,
    options: [
      { id: 'belonging', label: 'Feeling like I belong', votes: 792 },
      { id: 'shared', label: 'Shared interests & traditions', votes: 498 },
      { id: 'support', label: 'People who show up for me', votes: 405 },
      { id: 'places', label: 'A place to gather', votes: 147 },
    ],
    votedOptionId: 'belonging',
    image: '/votely-community.png',
  },
  {
    id: 'learning-future',
    question: 'What skill are you most excited to learn this year?',
    category: 'Learning',
    author: { username: 'theo.builds', name: 'Theo Martins', initials: 'TM', color: 'cyan' },
    createdAt: '38 min ago',
    closesIn: '6 days left',
    votes: 967,
    comments: 41,
    options: [
      { id: 'language', label: 'A new language', votes: 319 },
      { id: 'creative', label: 'Creative skills', votes: 274 },
      { id: 'tech', label: 'Technology & AI', votes: 248 },
      { id: 'life', label: 'Practical life skills', votes: 126 },
    ],
  },
  {
    id: 'weekend-ritual',
    question: 'Your perfect slow Sunday starts with…',
    category: 'Lifestyle',
    author: { username: 'amira.studio', name: 'Amira Khan', initials: 'AK', color: 'rose' },
    createdAt: '1 hr ago',
    closesIn: '3 days left',
    votes: 528,
    comments: 29,
    options: [
      { id: 'coffee', label: 'Coffee and a good book', votes: 201 },
      { id: 'walk', label: 'A long morning walk', votes: 164 },
      { id: 'brunch', label: 'Making a slow brunch', votes: 111 },
      { id: 'sleep', label: 'Absolutely no plans', votes: 52 },
    ],
  },
  {
    id: 'city-gardens',
    question: 'What would make your city greener?',
    category: 'Future',
    author: { username: 'green.city', name: 'Nora James', initials: 'NJ', color: 'mint' },
    createdAt: '2 hrs ago',
    closesIn: '4 days left',
    votes: 2134,
    comments: 103,
    sponsored: true,
    options: [
      { id: 'trees', label: 'More trees on every street', votes: 904 },
      { id: 'roofs', label: 'Green rooftops', votes: 581 },
      { id: 'parks', label: 'Pocket parks in neighborhoods', votes: 472 },
      { id: 'gardens', label: 'Shared community gardens', votes: 177 },
    ],
  },
]

export const demoComments = [
  { id: 'c1', username: 'leo.travels', name: 'Leo Park', initials: 'LP', color: 'cyan', time: '8 min ago', text: 'For me it’s the people who remember the small things. That’s what turns a place into home.' },
  { id: 'c2', username: 'sana.creates', name: 'Sana Ali', initials: 'SA', color: 'rose', time: '14 min ago', text: 'A shared table and an open invitation can make any neighborhood feel welcoming.' },
]

export const categories = [
  { name: 'Community', count: '2.4k polls', color: 'violet', icon: '◌' },
  { name: 'Technology', count: '1.8k polls', color: 'cyan', icon: '⌘' },
  { name: 'Lifestyle', count: '1.2k polls', color: 'rose', icon: '✳' },
  { name: 'Culture', count: '986 polls', color: 'amber', icon: '✦' },
  { name: 'Learning', count: '754 polls', color: 'mint', icon: '⌁' },
  { name: 'Future', count: '642 polls', color: 'blue', icon: '↗' },
]
