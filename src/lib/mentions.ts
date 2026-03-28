export function extractMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_+.-]+)/g;
  const matches = text.match(mentionRegex);
  
  if (!matches) return [];
  
  return matches.map((match) => match.slice(1));
}

export function getUniqueMentions(text: string): string[] {
  const mentions = extractMentions(text);
  return Array.from(new Set(mentions));
}
