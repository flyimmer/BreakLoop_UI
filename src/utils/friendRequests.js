/**
 * Friend Request Management System
 * 
 * Manages friend request creation, storage, and state management.
 * Friend requests are stored separately from the event updates system.
 */

const STORAGE_KEY = 'friend_requests_v1';

/**
 * FriendRequest data model
 * @typedef {Object} FriendRequest
 * @property {string} id - Unique request ID
 * @property {string} fromUserId - ID of user sending the request
 * @property {string} fromUserName - Name of user sending the request
 * @property {string} toUserId - ID of user receiving the request
 * @property {string} toUserName - Name of user receiving the request
 * @property {string} status - 'pending' | 'accepted' | 'declined'
 * @property {number} createdAt - Timestamp
 */

/**
 * Generate a unique friend request ID
 * @returns {string}
 */
export function generateFriendRequestId() {
  return `freq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Load all friend requests from localStorage
 * @returns {Array<FriendRequest>}
 */
export function loadFriendRequests() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn('Failed to load friend requests:', err);
    return [];
  }
}

/**
 * Save friend requests to localStorage
 * @param {Array<FriendRequest>} requests
 */
export function saveFriendRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.warn('Failed to save friend requests:', err);
  }
}

/**
 * Create a new friend request
 * @param {string} fromUserId
 * @param {string} fromUserName
 * @param {string} toUserId
 * @param {string} toUserName
 * @returns {FriendRequest}
 */
export function createFriendRequest(fromUserId, fromUserName, toUserId, toUserName) {
  const request = {
    id: generateFriendRequestId(),
    fromUserId,
    fromUserName,
    toUserId,
    toUserName,
    status: 'pending',
    createdAt: Date.now(),
  };
  
  const requests = loadFriendRequests();
  requests.push(request);
  saveFriendRequests(requests);
  
  return request;
}

/**
 * Check if a friend request already exists between two users (in either direction)
 * @param {string} userId1
 * @param {string} userId2
 * @returns {FriendRequest|null}
 */
export function findExistingRequest(userId1, userId2) {
  const requests = loadFriendRequests();
  return requests.find(
    (req) =>
      req.status === 'pending' &&
      ((req.fromUserId === userId1 && req.toUserId === userId2) ||
        (req.fromUserId === userId2 && req.toUserId === userId1))
  ) || null;
}

/**
 * Check if two users are already friends
 * @param {string} userId1
 * @param {string} userId2
 * @param {Array} friendsList - The friendsList array from App.js state
 * @returns {boolean}
 */
export function areAlreadyFriends(userId1, userId2, friendsList) {
  // Check if userId2 is in the friendsList and has status 'accepted'
  const friend = friendsList.find(
    (f) => f.id === userId2 && f.status === 'accepted'
  );
  return !!friend;
}

/**
 * Update friend request status
 * @param {string} requestId
 * @param {string} newStatus - 'accepted' | 'declined'
 */
export function updateFriendRequestStatus(requestId, newStatus) {
  const requests = loadFriendRequests();
  const updated = requests.map((req) =>
    req.id === requestId ? { ...req, status: newStatus } : req
  );
  saveFriendRequests(updated);
}

/**
 * Get all pending friend requests for a user
 * @param {string} userId
 * @returns {Array<FriendRequest>}
 */
export function getPendingRequestsForUser(userId) {
  const requests = loadFriendRequests();
  return requests.filter(
    (req) => req.toUserId === userId && req.status === 'pending'
  );
}

