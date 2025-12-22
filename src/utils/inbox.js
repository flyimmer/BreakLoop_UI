/**
 * Inbox Utility Functions
 * Phase E-2d: Inbox v1 - Updates tab
 * 
 * Provides functions for managing inbox updates, resolution, and badge counts.
 */

import { loadEventUpdates, saveEventUpdates } from './eventUpdates';

/**
 * Get all unresolved updates
 * @returns {Array} Array of unresolved EventUpdate objects
 */
export function getUnresolvedUpdates() {
  const allUpdates = loadEventUpdates();
  return allUpdates
    .filter(update => !update.resolved)
    .sort((a, b) => b.createdAt - a.createdAt); // Most recent first
}

/**
 * Get unresolved update count (for badge)
 * @returns {number}
 */
export function getUnresolvedCount() {
  return getUnresolvedUpdates().length;
}

/**
 * Mark an update as resolved
 * @param {string} updateId - The update ID to resolve
 */
export function resolveUpdate(updateId) {
  const allUpdates = loadEventUpdates();
  const updated = allUpdates.map(update =>
    update.id === updateId
      ? { ...update, resolved: true }
      : update
  );
  saveEventUpdates(updated);
}

/**
 * Resolve all updates for a specific event
 * Useful when user opens an event and all related updates should resolve
 * @param {string} eventId - The event ID
 */
export function resolveUpdatesByEvent(eventId) {
  const allUpdates = loadEventUpdates();
  const updated = allUpdates.map(update =>
    update.eventId === eventId
      ? { ...update, resolved: true }
      : update
  );
  saveEventUpdates(updated);
}

/**
 * Resolve updates by type for a specific event
 * @param {string} eventId - The event ID
 * @param {string} type - The update type to resolve
 */
export function resolveUpdatesByEventAndType(eventId, type) {
  const allUpdates = loadEventUpdates();
  const updated = allUpdates.map(update =>
    update.eventId === eventId && update.type === type
      ? { ...update, resolved: true }
      : update
  );
  saveEventUpdates(updated);
}

/**
 * Format relative timestamp for updates
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Relative time string (e.g., "2m ago", "3h ago", "2d ago")
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // For older items, show date
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

