export function formatModelResponse(text: string): string {
  // First escape any HTML to prevent XSS
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Handle various formatting patterns
  return escaped
    // Italics
    .replace(/\*\*(.*?)\*\*/g, '<i>$1</i>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    // Actions/emotes
    .replace(/\((.*?)\)/g, '<span class="text-muted-foreground">($1)</span>')
    // Emphasis
    .replace(/!(.*?)!/g, '<em class="text-primary">$1</em>')
    // Expressions
    .replace(/~(.*?)~/g, '<span class="text-muted-foreground italic">$1</span>')
    // Newlines
    .replace(/\n/g, '<br>');
} 