export function sanitizeInput(input: string): string {
  if (!input) return "";
  
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

export function sanitizeHtml(input: string): string {
  const allowedTags = ["b", "i", "em", "strong", "a", "code", "pre"];
  let result = input;
  
  result = result.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
  return result;
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
