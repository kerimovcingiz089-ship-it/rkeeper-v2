type EmojiEntry = [RegExp, string];

const MAP: EmojiEntry[] = [
  [/şorba|sup\b|soup|çörba/i, "🥣"],
  [/içki|içecek|drink|cola|fanta|soda|limonad|kompot|fresh/i, "🥤"],
  [/çay|tea|chai/i, "🍵"],
  [/qəhvə|kofe|coffee/i, "☕"],
  [/salat|salad/i, "🥗"],
  [/meyvə|fruit/i, "🍎"],
  [/pizza/i, "🍕"],
  [/burger|hamburger/i, "🍔"],
  [/pasta|makaron|spagetti/i, "🍝"],
  [/kabab|kebab|köftə|ət|grill|steak/i, "🥩"],
  [/balıq|fish/i, "🐟"],
  [/səhər|breakfast|kahvaltı|omlet|yumurta/i, "🌅"],
  [/tort|cake|kek/i, "🎂"],
  [/desert|dessert|şirin|şirni|dolce/i, "🍰"],
  [/dondurma|ice.?cream/i, "🍦"],
  [/çörək|bread|pastry|bulka/i, "🥖"],
  [/süd|milk|yogurt|qatıq|kefir|ayran|kefir/i, "🥛"],
  [/xüsusi|special|kampaniya|promo/i, "⭐"],
  [/vegan|vegetarian|tərəvəz|vegetable|göyərti/i, "🥬"],
  [/döner|doner|durum/i, "🌯"],
  [/sushi|suşi/i, "🍣"],
  [/qızartma|fry|fries|kartof/i, "🍟"],
  [/sous|sauce|dip/i, "🫕"],
  [/mix|set|menü|menu|kombo/i, "📦"],
];

export function getCatEmoji(name: string): string {
  const key = name.trim();
  for (const [regex, emoji] of MAP) {
    if (regex.test(key)) return emoji;
  }
  return "🍽️";
}
