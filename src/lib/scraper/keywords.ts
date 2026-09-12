import type { Keyword } from "@/db/schema";

export function matchKeywords(title: string, activeKeywords: Keyword[]): string[] {
  const lowerTitle = title.toLowerCase();
  const matched: string[] = [];
  for (const kw of activeKeywords) {
    if (lowerTitle.includes(kw.word.toLowerCase())) {
      matched.push(kw.word);
    }
  }
  return matched;
}
