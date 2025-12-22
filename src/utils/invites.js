/**
 * Friend Invite System
 * 
 * Manages invite link generation, validation, and friend request creation
 * from intentional friend invitations.
 */

const STORAGE_KEY = 'friend_invites_v1';

/**
 * Invite data model
 * @typedef {Object} Invite
 * @property {string} id - Unique invite ID
 * @property {string} token - Unique shareable token
 * @property {string} fromUserId - ID of user who created the invite
 * @property {string} fromUserName - Name of user who created the invite
 * @property {number} createdAt - Timestamp
 * @property {string} status - 'active' | 'used' | 'expired'
 * @property {string} [usedByUserId] - ID of user who used the invite
 * @property {number} [usedAt] - Timestamp when invite was used
 */

/**
 * Generate a unique invite ID
 * @returns {string}
 */
export function generateInviteId() {
  return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique invite token (shareable)
 * @returns {string}
 */
export function generateInviteToken() {
  return Math.random().toString(36).substr(2, 12) + Math.random().toString(36).substr(2, 12);
}

/**
 * Load all invites from localStorage
 * @returns {Array<Invite>}
 */
export function loadInvites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn('Failed to load invites:', err);
    return [];
  }
}

/**
 * Save invites to localStorage
 * @param {Array<Invite>} invites
 */
export function saveInvites(invites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
  } catch (err) {
    console.warn('Failed to save invites:', err);
  }
}

/**
 * Create a new invite
 * @param {string} fromUserId
 * @param {string} fromUserName
 * @returns {Invite}
 */
export function createInvite(fromUserId, fromUserName) {
  const invite = {
    id: generateInviteId(),
    token: generateInviteToken(),
    fromUserId,
    fromUserName,
    createdAt: Date.now(),
    status: 'active',
  };
  
  const invites = loadInvites();
  invites.push(invite);
  saveInvites(invites);
  
  return invite;
}

/**
 * Find invite by token
 * @param {string} token
 * @returns {Invite|null}
 */
export function findInviteByToken(token) {
  const invites = loadInvites();
  return invites.find((inv) => inv.token === token) || null;
}

/**
 * Mark invite as used
 * @param {string} token
 * @param {string} usedByUserId
 */
export function markInviteAsUsed(token, usedByUserId) {
  const invites = loadInvites();
  const updated = invites.map((inv) =>
    inv.token === token
      ? {
          ...inv,
          status: 'used',
          usedByUserId,
          usedAt: Date.now(),
        }
      : inv
  );
  saveInvites(updated);
}

/**
 * Generate shareable invite link
 * @param {string} token
 * @returns {string}
 */
export function generateInviteLink(token) {
  // In production, this would be the actual app URL
  // For demo/prototype, we use a mock URL
  return `https://breakloop.app/invite/${token}`;
}

/**
 * Validate invite token
 * @param {string} token
 * @returns {Object} { valid: boolean, invite?: Invite, reason?: string }
 */
export function validateInvite(token) {
  if (!token) {
    return { valid: false, reason: 'No invite token provided' };
  }
  
  const invite = findInviteByToken(token);
  
  if (!invite) {
    return { valid: false, reason: 'Invite not found' };
  }
  
  if (invite.status === 'used') {
    return { valid: false, reason: 'This invite is no longer valid' };
  }
  
  if (invite.status === 'expired') {
    return { valid: false, reason: 'This invite has expired' };
  }
  
  return { valid: true, invite };
}

/**
 * Get all active invites for a user
 * @param {string} userId
 * @returns {Array<Invite>}
 */
export function getUserInvites(userId) {
  const invites = loadInvites();
  return invites.filter((inv) => inv.fromUserId === userId);
}

