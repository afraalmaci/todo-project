// Small helpers that turn todo data into styling. Tailwind's JIT scanner
// needs full class strings to exist literally in the source, so the tag
// palette below is spelled out rather than built with template
// interpolation like `bg-${color}-100`.

const TAG_PALETTE = [
  { chip: 'bg-lavender-50 text-lavender-500 dark:bg-[#2c2840] dark:text-[#b3a6ee]' },
  { chip: 'bg-peach-50 text-peach-500 dark:bg-[#3a2f22] dark:text-[#e0ac7c]' },
  { chip: 'bg-sky-50 text-sky-500 dark:bg-[#22323d] dark:text-[#8fc0e0]' },
  { chip: 'bg-sage-50 text-sage-600 dark:bg-[#2b3a30] dark:text-[#9fd8bf]' },
  { chip: 'bg-rose-50 text-rose-500 dark:bg-[#3a2530] dark:text-[#e0a3bd]' },
];

// Dot colors used in the list sidebar. Same hashing idea as tags, but a
// flat set of solid accent colors rather than pastel chip backgrounds.
const LIST_DOT_PALETTE = [
  'bg-sage-400',
  'bg-sky-400',
  'bg-peach-400',
  'bg-lavender-400',
  'bg-rose-400',
];

// Deterministic hash so the same tag/list name always gets the same color,
// without needing to store a color per tag/list anywhere.
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function tagChipClasses(tagName) {
  const palette = TAG_PALETTE[hashString(tagName || '') % TAG_PALETTE.length];
  return palette.chip;
}

export function listDotClasses(listName) {
  return LIST_DOT_PALETTE[hashString(listName || '') % LIST_DOT_PALETTE.length];
}

// Returns a status used to color-code the due date badge.
export function dueDateStatus(dueDateIso) {
  if (!dueDateIso) return null;

  const due = new Date(dueDateIso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  if (due < now) return 'overdue';
  if (startOfDueDay.getTime() === startOfToday.getTime()) return 'today';
  return 'upcoming';
}

export const DUE_DATE_BADGE_CLASSES = {
  overdue: 'bg-rose-50 text-rose-500 dark:bg-[#3a2530] dark:text-[#e0a3bd]',
  today: 'bg-peach-50 text-peach-500 dark:bg-[#3a2f22] dark:text-[#e0ac7c]',
  upcoming: 'bg-sage-50 text-sage-600 dark:bg-[#2b3a30] dark:text-[#9fd8bf]',
};

export const DUE_DATE_BADGE_LABEL = {
  overdue: '⏰ Overdue',
  today: '📅 Today',
  upcoming: '📅',
};
