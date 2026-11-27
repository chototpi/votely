import type { Category, Poll, PollComment } from "./types";

const NOW = Date.now();
const MIN = 60_000;

function poll(
  id: string,
  question: string,
  category: Category,
  authorName: string,
  ageMinutes: number,
  boost: number,
  options: [string, number][],
): Poll {
  return {
    id,
    question,
    category,
    authorName,
    createdAt: NOW - ageMinutes * MIN,
    boost,
    options: options.map(([text, votes], i) => ({ id: `${id}-o${i + 1}`, text, votes })),
  };
}

function comment(
  id: string,
  pollId: string,
  parentId: string | null,
  authorName: string,
  text: string,
  ageMinutes: number,
): PollComment {
  return { id, pollId, parentId, authorName, text, createdAt: NOW - ageMinutes * MIN };
}

export const SEED_POLLS: Poll[] = [
  poll("p1", "What should be the first thing you pay for with Pi?", "Pi Network", "lena_pioneer", 35, 3, [
    ["A coffee near home", 212],
    ["Groceries", 148],
    ["An online course", 187],
    ["Hold it for later", 301],
  ]),
  poll("p2", "Best time of day to open the app and check in?", "Pi Network", "kofi.mining", 110, 0, [
    ["Morning", 164],
    ["Afternoon", 52],
    ["Evening", 119],
    ["Whenever I remember", 96],
  ]),
  poll("p3", "Which local dish deserves to be famous worldwide?", "Food", "nguyen_minh", 190, 1, [
    ["Pho", 243],
    ["Jollof rice", 198],
    ["Biryani", 176],
    ["Tacos al pastor", 154],
    ["Ramen", 131],
  ]),
  poll("p4", "Remote work, hybrid, or office?", "Lifestyle", "sofia_builds", 270, 0, [
    ["Fully remote", 321],
    ["Hybrid", 402],
    ["Office", 77],
  ]),
  poll("p5", "Should apps in the Pi ecosystem show ads?", "Technology", "ravi_node", 420, 2, [
    ["Yes, if they reward me", 258],
    ["Only small banners", 91],
    ["No ads at all", 174],
    ["Let me pay to remove them", 63],
  ]),
  poll("p6", "Which sport do you follow the most?", "Sports", "amara_ng", 600, 0, [
    ["Football", 512],
    ["Basketball", 143],
    ["Cricket", 187],
    ["Tennis", 49],
    ["I don't follow sports", 71],
  ]),
  poll("p7", "Your favorite way to learn something new?", "Lifestyle", "tran_huong", 780, 0, [
    ["Short videos", 129],
    ["Books and articles", 84],
    ["Hands-on projects", 205],
    ["Courses with a community", 98],
  ]),
  poll("p8", "What feature does the Pi community need next?", "Pi Network", "diego_pi", 900, 1, [
    ["A local marketplace", 276],
    ["Easier ways to find meetups", 112],
    ["Better tools for developers", 134],
    ["More ways to earn", 233],
  ]),
  poll("p9", "Ideal weekend plan?", "Lifestyle", "yuki_t", 1200, 0, [
    ["Stay home and recharge", 188],
    ["See friends and family", 267],
    ["Get out into nature", 213],
    ["Work on a side project", 94],
  ]),
  poll("p10", "Which streaming genre wins your evenings?", "Entertainment", "mei_ling88", 1500, 0, [
    ["Sci-fi", 141],
    ["Comedy", 168],
    ["Documentaries", 72],
    ["Drama series", 119],
    ["Anime", 156],
  ]),
  poll("p11", "Is a four-day work week realistic?", "Society", "lena_pioneer", 1900, 0, [
    ["Yes, almost everywhere", 224],
    ["Only in some industries", 308],
    ["Not really", 87],
  ]),
  poll("p12", "How do you usually get around town?", "Lifestyle", "kofi.mining", 2400, 0, [
    ["Motorbike or scooter", 197],
    ["Bus or metro", 143],
    ["Bike or on foot", 118],
    ["Car", 126],
  ]),
  poll("p13", "Which skill will matter most by 2030?", "Technology", "sofia_builds", 3000, 1, [
    ["Working with AI tools", 289],
    ["Clear communication", 176],
    ["Coding", 121],
    ["Creativity", 163],
  ]),
  poll("p14", "Coffee or tea?", "Food", "amara_ng", 4000, 0, [
    ["Coffee", 334],
    ["Tea", 271],
    ["Both, depending on the day", 142],
    ["Neither", 28],
  ]),
];

export const SEED_COMMENTS: PollComment[] = [
  comment("c1", "p1", null, "kofi.mining", "A coffee for sure. Small things make it feel real.", 28),
  comment("c2", "p1", "c1", "lena_pioneer", "Same here, my local cafe is already curious about it.", 21),
  comment("c3", "p1", null, "ravi_node", "Holding for now, but an online course sounds like the smartest spend.", 17),
  comment("c4", "p3", null, "amara_ng", "Jollof rice and it is not even close.", 150),
  comment("c5", "p3", "c4", "nguyen_minh", "Respect! But you have to try a proper bowl of pho first.", 140),
  comment("c6", "p3", null, "diego_pi", "Tacos al pastor, straight from the trompo.", 120),
  comment("c7", "p4", null, "yuki_t", "Hybrid keeps me focused and social. Best of both.", 240),
  comment("c8", "p5", null, "tran_huong", "Rewarded ads are fine as long as I choose to watch them.", 380),
  comment("c9", "p5", "c8", "ravi_node", "Agreed. Opt-in only is the key.", 360),
  comment("c10", "p5", null, "mei_ling88", "Banners are okay, pop-ups are not.", 330),
  comment("c11", "p8", null, "sofia_builds", "A local marketplace would change everything for small shops.", 820),
  comment("c12", "p8", "c11", "diego_pi", "And meetups would make it easier to find vendors you trust.", 790),
  comment("c13", "p14", null, "yuki_t", "Tea in the morning, coffee after lunch. Does that count as both?", 3800),
  comment("c14", "p13", null, "kofi.mining", "Communication, because tools change but people stay the same.", 2900),
];

export const SEED_USERS: string[] = Array.from(new Set(SEED_POLLS.map((p) => p.authorName)));
