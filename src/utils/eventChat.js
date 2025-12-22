/**
 * Event Group Chat Storage
 * 
 * Manages chat messages scoped to individual events.
 * Each event owns its own chat history.
 * 
 * Phase E-2b: Event Group Chat v0.1
 */

const STORAGE_KEY = 'event_chat_state_v1';

/**
 * Get all event chat messages from localStorage
 * @returns {Object} EventChatState { [eventId]: EventChatMessage[] }
 */
export function loadEventChatState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.warn('Failed to load event chat state:', err);
    return {};
  }
}

/**
 * Save event chat state to localStorage
 * @param {Object} state - EventChatState
 */
export function saveEventChatState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save event chat state:', err);
  }
}

/**
 * Get messages for a specific event
 * @param {string} eventId 
 * @returns {Array} EventChatMessage[]
 */
export function getEventMessages(eventId) {
  const state = loadEventChatState();
  return state[eventId] || [];
}

/**
 * Add a message to an event's chat
 * @param {string} eventId 
 * @param {Object} message - EventChatMessage
 * @returns {Array} Updated messages for the event
 */
export function addEventMessage(eventId, message) {
  const state = loadEventChatState();
  
  if (!state[eventId]) {
    state[eventId] = [];
  }
  
  state[eventId].push({
    ...message,
    createdAt: message.createdAt || Date.now(),
  });
  
  saveEventChatState(state);
  return state[eventId];
}

/**
 * Generate a unique message ID
 * @returns {string}
 */
export function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format relative time for message timestamps
 * @param {number} timestamp 
 * @returns {string}
 */
export function formatMessageTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  // For older messages, show date
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

