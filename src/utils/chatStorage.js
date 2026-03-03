const CHAT_MESSAGES_KEY = 'rythom-chat-messages';
const MAX_MESSAGES = 100;

/** @param {{ role: string; content: string }[]} messages */
export function loadChatMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CHAT_MESSAGES_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.slice(-MAX_MESSAGES) : [];
  } catch {
    return [];
  }
}

/** @param {{ role: string; content: string }[]} messages */
export function saveChatMessages(messages) {
  if (typeof window === 'undefined') return;
  try {
    const list = messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages;
    window.localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(list));
  } catch (_) {}
}
