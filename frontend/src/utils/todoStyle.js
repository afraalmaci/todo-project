// Small helpers that turn todo data into styling. Tailwind's JIT scanner
// needs full class strings to exist literally in the source, so the tag
// palette below is spelled out rather than built with template
// interpolation like `bg-${color}-100`.

const TAG_PALETTE = [
  { chip: 'bg-lavender-50 text-lavender-500' },
  { chip: 'bg-peach-50 text-peach-500' },
  { chip: 'bg-sky-50 text-sky-500' },
  { chip: 'bg-sage-50 text-sage-600' },
  { chip: 'bg-rose-50 text-rose-500' },
];

// Deterministic hash so the same tag name always gets the same color,
// without needing to store a color per tag anywhere.
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
  overdue: 'bg-rose-50 text-rose-500',
  today: 'bg-peach-50 text-peach-500',
  upcoming: 'bg-sage-50 text-sage-600',
};

export const DUE_DATE_BADGE_LABEL = {
  overdue: '⏰ Overdue',
  today: '📅 Today',
  upcoming: '📅',
};
