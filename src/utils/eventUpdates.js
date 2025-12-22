/**
 * Event Update Signal System
 * 
 * Manages emission and storage of event-related update signals.
 * These updates will be consumed by Inbox v1 in future phases.
 * 
 * Phase E-2c: Event Update Signal Emission
 */

const STORAGE_KEY = 'event_updates_v1';

/**
 * EventUpdate types
 */
export const UPDATE_TYPES = {
  EVENT_CHAT: 'event_chat',
  JOIN_REQUEST: 'join_request',
  JOIN_APPROVED: 'join_approved',
  JOIN_DECLINED: 'join_declined',
  EVENT_UPDATED: 'event_updated',
  EVENT_CANCELLED: 'event_cancelled',
  PARTICIPANT_LEFT: 'participant_left',
};

/**
 * Generate a unique update ID
 * @returns {string}
 */
export function generateUpdateId() {
  return `upd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create an EventUpdate object
 * @param {Object} params
 * @param {string} params.type - Update type from UPDATE_TYPES
 * @param {string} params.eventId - Event ID
 * @param {string} [params.actorId] - ID of user who triggered the update
 * @param {string} [params.actorName] - Name of user who triggered the update
 * @param {string} [params.message] - Short preview or description
 * @returns {Object} EventUpdate
 */
export function createEventUpdate({
  type,
  eventId,
  actorId = null,
  actorName = null,
  message = null,
}) {
  return {
    id: generateUpdateId(),
    type,
    eventId,
    actorId,
    actorName,
    message,
    createdAt: Date.now(),
    resolved: false,
  };
}

/**
 * Load all event updates from localStorage
 * @returns {Array} EventUpdate[]
 */
export function loadEventUpdates() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn('Failed to load event updates:', err);
    return [];
  }
}

/**
 * Save event updates to localStorage
 * @param {Array} updates - EventUpdate[]
 */
export function saveEventUpdates(updates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  } catch (err) {
    console.warn('Failed to save event updates:', err);
  }
}

/**
 * Add an event update to storage
 * @param {Object} update - EventUpdate
 * @returns {Array} Updated array of all updates
 */
export function addEventUpdate(update) {
  const updates = loadEventUpdates();
  updates.push(update);
  saveEventUpdates(updates);
  
  // Debug logging (Phase E-2c)
  console.log('[Event Update Emitted]', {
    type: update.type,
    eventId: update.eventId,
    actor: update.actorName || update.actorId,
    message: update.message,
    timestamp: new Date(update.createdAt).toISOString(),
  });
  
  return updates;
}

/**
 * Emit an event chat message update
 * @param {string} eventId
 * @param {string} senderId
 * @param {string} senderName
 * @param {string} messageText
 */
export function emitEventChatUpdate(eventId, senderId, senderName, messageText) {
  const preview = messageText.length > 50 
    ? messageText.substring(0, 50) + '...' 
    : messageText;
  
  return addEventUpdate(
    createEventUpdate({
      type: UPDATE_TYPES.EVENT_CHAT,
      eventId,
      actorId: senderId,
      actorName: senderName,
      message: preview,
    })
  );
}

/**
 * Emit a join request update
 * @param {string} eventId
 * @param {string} requesterId
 * @param {string} requesterName
 */
export function emitJoinRequestUpdate(eventId, requesterId, requesterName) {
  return addEventUpdate(
    createEventUpdate({
      type: UPDATE_TYPES.JOIN_REQUEST,
      eventId,
      actorId: requesterId,
      actorName: requesterName,
    })
  );
}

/**
 * Emit a join approved update
 * @param {string} eventId
 * @param {string} hostId
 * @param {string} hostName
 */
export function emitJoinApprovedUpdate(eventId, hostId, hostName) {
  return addEventUpdate(
    createEventUpdate({
      type: UPDATE_TYPES.JOIN_APPROVED,
      eventId,
      actorId: hostId,
      actorName: hostName,
    })
  );
}

/**
 * Emit a join declined update
 * @param {string} eventId
 * @param {string} hostId
 * @param {string} hostName
 */
export function emitJoinDeclinedUpdate(eventId, hostId, hostName) {
  return addEventUpdate(
    createEventUpdate({
      type: UPDATE_TYPES.JOIN_DECLINED,
      eventId,
      actorId: hostId,
      actorName: hostName,
    })
  );
}

/**
 * Emit an event updated update
 * @param {string} eventId
 * @param {string} editorId
 * @param {string} editorName
 * @param {string} [changeDescription] - Optional description of changes
 */
export function emitEventUpdatedUpdate(eventId, editorId, editorName, changeDescription = null) {
  return addEventUpdate(
    createEventUpdate({
      type: UPDATE_TYPES.EVENT_UPDATED,
      eventId,
      actorId: editorId,
      actorName: editorName,
      message: changeDescription,
    })
  );
}

/**
 * Emit an event cancelled update
 * @param {string} eventId
 * @param {string} hostId
 * @param {string} hostName
 */
export function emitEventCancelledUpdate(eventId, hostId, hostName) {
  return addEventUpdate(
    createEventUpdate({
      type: UPDATE_TYPES.EVENT_CANCELLED,
      eventId,
      actorId: hostId,
      actorName: hostName,
    })
  );
}

/**
 * Emit a participant left update
 * @param {string} eventId
 * @param {string} participantId
 * @param {string} participantName
 */
export function emitParticipantLeftUpdate(eventId, participantId, participantName) {
  return addEventUpdate(
    createEventUpdate({
      type: UPDATE_TYPES.PARTICIPANT_LEFT,
      eventId,
      actorId: participantId,
      actorName: participantName,
    })
  );
}



