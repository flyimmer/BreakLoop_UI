/**
 * Private Messages Utility Functions
 * 
 * Manages private (friend-to-friend) conversations.
 * Separate from event group chat.
 */

const STORAGE_KEY = 'private_messages_v1';

/**
 * Generate a deterministic conversation ID for two users
 * @param {string} userId1 
 * @param {string} userId2 
 * @returns {string} Conversation ID
 */
export function getConversationId(userId1, userId2) {
  const sorted = [userId1, userId2].sort();
  return `conv_${sorted[0]}_${sorted[1]}`;
}

/**
 * Load all private conversations from localStorage
 * @returns {Object} { [conversationId]: Conversation }
 */
export function loadPrivateConversations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.warn('Failed to load private conversations:', err);
    return {};
  }
}

/**
 * Save private conversations to localStorage
 * @param {Object} conversations - { [conversationId]: Conversation }
 */
export function savePrivateConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.warn('Failed to save private conversations:', err);
  }
}

/**
 * Get or create a conversation between two users
 * @param {string} userId1 
 * @param {string} userId2 
 * @returns {Object} Conversation object
 */
export function getOrCreateConversation(userId1, userId2) {
  const conversationId = getConversationId(userId1, userId2);
  const conversations = loadPrivateConversations();
  
  if (!conversations[conversationId]) {
    conversations[conversationId] = {
      id: conversationId,
      participantIds: [userId1, userId2].sort(),
      messages: [],
      createdAt: Date.now(),
      lastMessageAt: null,
    };
    savePrivateConversations(conversations);
  }
  
  return conversations[conversationId];
}

/**
 * Add a message to a conversation
 * @param {string} conversationId 
 * @param {Object} message - { senderId, senderName, text }
 * @returns {Object} Updated conversation
 */
export function addMessageToConversation(conversationId, message) {
  const conversations = loadPrivateConversations();
  const conversation = conversations[conversationId];
  
  if (!conversation) {
    console.warn('Conversation not found:', conversationId);
    return null;
  }
  
  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    conversationId,
    senderId: message.senderId,
    senderName: message.senderName,
    text: message.text,
    createdAt: Date.now(),
  };
  
  conversation.messages.push(newMessage);
  conversation.lastMessageAt = newMessage.createdAt;
  
  savePrivateConversations(conversations);
  
  return conversation;
}

/**
 * Get all conversations sorted by last message time
 * @returns {Array} Array of conversations
 */
export function getAllConversationsSorted() {
  const conversations = loadPrivateConversations();
  return Object.values(conversations)
    .filter(conv => conv.messages.length > 0) // Only show conversations with messages
    .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
}

/**
 * Get a specific conversation
 * @param {string} conversationId 
 * @returns {Object|null} Conversation or null
 */
export function getConversation(conversationId) {
  const conversations = loadPrivateConversations();
  return conversations[conversationId] || null;
}

/**
 * Get the other participant in a conversation
 * @param {Object} conversation 
 * @param {string} currentUserId 
 * @returns {string} Other user's ID
 */
export function getOtherParticipantId(conversation, currentUserId) {
  return conversation.participantIds.find(id => id !== currentUserId);
}

/**
 * Check if a conversation is unread for the current user
 * A conversation is unread if:
 * - There are messages
 * - The latest message was sent by the OTHER user
 * - The conversation has not been opened since that message
 * 
 * @param {Object} conversation 
 * @param {string} currentUserId 
 * @returns {boolean} True if conversation is unread
 */
export function isConversationUnread(conversation, currentUserId) {
  if (!conversation || !conversation.messages || conversation.messages.length === 0) {
    return false;
  }
  
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  
  // If the last message was sent by current user, conversation is not unread
  if (lastMessage.senderId === currentUserId) {
    return false;
  }
  
  // If conversation has never been read, it's unread
  if (!conversation.lastReadAt) {
    return true;
  }
  
  // Conversation is unread if last message arrived after last read
  return lastMessage.createdAt > conversation.lastReadAt;
}

/**
 * Mark a conversation as read by the current user
 * @param {string} conversationId 
 * @returns {Object} Updated conversation
 */
export function markConversationAsRead(conversationId) {
  const conversations = loadPrivateConversations();
  const conversation = conversations[conversationId];
  
  if (!conversation) {
    console.warn('Conversation not found:', conversationId);
    return null;
  }
  
  conversation.lastReadAt = Date.now();
  savePrivateConversations(conversations);
  
  return conversation;
}

/**
 * Get count of unread conversations for current user
 * @param {string} currentUserId 
 * @returns {number} Count of unread conversations
 */
export function getUnreadConversationCount(currentUserId) {
  const conversations = loadPrivateConversations();
  return Object.values(conversations)
    .filter(conv => conv.messages.length > 0)
    .filter(conv => isConversationUnread(conv, currentUserId))
    .length;
}

/**
 * Migrate old chatMessages format to new privateConversations format
 * @param {Object} oldChatMessages - { [friendId]: Message[] }
 * @param {string} currentUserId - Current user's ID
 * @returns {Object} New conversations object
 */
export function migrateOldChatMessages(oldChatMessages, currentUserId) {
  const conversations = {};
  
  Object.entries(oldChatMessages).forEach(([friendId, messages]) => {
    if (!messages || messages.length === 0) return;
    
    const conversationId = getConversationId(currentUserId, friendId);
    const migratedMessages = messages.map((msg, index) => ({
      id: msg.id || `msg_migrated_${Date.now()}_${index}`,
      conversationId,
      senderId: msg.sender === 'me' ? currentUserId : friendId,
      senderName: msg.sender === 'me' ? 'You' : 'Friend', // Name not available in old format
      text: msg.text,
      createdAt: Date.now() - (messages.length - index) * 60000, // Approximate timestamps
    }));
    
    conversations[conversationId] = {
      id: conversationId,
      participantIds: [currentUserId, friendId].sort(),
      messages: migratedMessages,
      createdAt: Date.now() - messages.length * 60000,
      lastMessageAt: migratedMessages[migratedMessages.length - 1]?.createdAt || Date.now(),
    };
  });
  
  return conversations;
}

