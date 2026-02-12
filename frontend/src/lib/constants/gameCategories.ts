export const GAME_CATEGORIES = [
  "shooter",
  "sports",
  "strategy",
  "simulation",
  "puzzle",
  "battle royale",
  "action",
  "adventure",
  "racing",
  "rpg",
  "moba",
  "casual",
  "card",
  "music",
];

export const GAME_CATEGORY_OPTIONS = GAME_CATEGORIES.map((c) => ({
  label: c.charAt(0).toUpperCase() + c.slice(1),
  value: c,
}));
