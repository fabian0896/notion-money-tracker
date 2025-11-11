export function removeEmojis(text: string): string {
  return text
    .replace(/[\p{Emoji}\p{Emoji_Component}\p{Emoji_Modifier}\p{Emoji_Presentation}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}