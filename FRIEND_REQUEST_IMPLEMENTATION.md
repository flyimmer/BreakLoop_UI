# Contextual Friend Request Feature - Implementation Summary

## Overview

This document describes the implementation of contextual friend request functionality from Activity Details → Participants in the BreakLoop web application.

## Design Principles Followed

✅ **Explicit** - Friend requests require explicit user action  
✅ **Mutual** - Friendship must be accepted by both parties  
✅ **Optional** - Feature is contextual, not forced  
✅ **Calm** - UI is subtle and non-intrusive  
✅ **Consent-based** - Registration required before social actions  

## Architecture

### Data Model

#### FriendRequest
```javascript
{
  id: string,              // Unique request ID (freq_timestamp_random)
  fromUserId: string,      // ID of user sending request
  fromUserName: string,    // Name of user sending request
  toUserId: string,        // ID of user receiving request
  toUserName: string,      // Name of user receiving request
  status: string,          // 'pending' | 'accepted' | 'declined'
  createdAt: number        // Timestamp
}
```

#### EventUpdate (Friend Request)
```javascript
{
  id: string,              // Unique update ID
  type: 'friend_request',  // Update type
  eventId: string,         // Friend request ID (used as eventId)
  actorId: string,         // User who sent the request
  actorName: string,       // Name of user who sent request
  message: string,         // "{Name} wants to add you as a friend"
  createdAt: number,       // Timestamp
  resolved: boolean        // Always false initially
}
```

### Storage

- **friend_requests_v1** - All friend requests (localStorage)
- **event_updates_v1** - Event updates including friend requests (localStorage)
- **mindful_account_v17_2** - User account state (localStorage)

## Implementation Details

### 1. Friend Request Utilities (`src/utils/friendRequests.js`)

**New file** containing friend request management functions:

- `generateFriendRequestId()` - Generate unique request ID
- `loadFriendRequests()` - Load all requests from localStorage
- `saveFriendRequests()` - Save requests to localStorage
- `createFriendRequest()` - Create and persist new request
- `findExistingRequest()` - Check if request exists (either direction)
- `areAlreadyFriends()` - Check if users are already friends
- `updateFriendRequestStatus()` - Update request status
- `getPendingRequestsForUser()` - Get all pending requests for a user

### 2. Event Updates Extension (`src/utils/eventUpdates.js`)

**Modified** to support friend requests:

- Added `FRIEND_REQUEST` to `UPDATE_TYPES`
- Added `emitFriendRequestUpdate()` function
- Emits structured update to Inbox system

### 3. Activity Details Modal (`src/components/ActivityDetailsModal.js`)

**Modified** Participants section to show "Add friend" button:

#### New Props
- `onAddFriend` - Callback for friend request action
- `friendsList` - Array of user's friends for eligibility checks

#### UI Changes
- Renders all confirmed participants from `activity.participants` array
- Shows "Add friend" button for eligible participants
- Button styling: Secondary text button with UserPlus icon
- Eligibility checks:
  - Not current user
  - Not already friends
  - No pending request exists

#### Eligibility Logic
```javascript
const shouldShowAddFriend = (participant) => {
  if (participant.id === currentUserId) return false;
  if (areAlreadyFriends(currentUserId, participant.id, friendsList)) return false;
  if (findExistingRequest(currentUserId, participant.id)) return false;
  return true;
};
```

### 4. App.js Integration

**Modified** to handle friend requests and registration:

#### New State
```javascript
const [showRegistrationModal, setShowRegistrationModal] = useState(false);
const [pendingFriendRequest, setPendingFriendRequest] = useState(null);
```

#### New Handlers

**handleAddFriend(participant)**
- Checks if user is logged in
- If not logged in: Shows registration modal with pending request
- If logged in: Creates friend request and emits update
- Shows toast notifications

**handleCompleteRegistration(name, email)**
- Updates user account to logged in
- Closes registration modal
- Resumes pending friend request if exists
- Shows success toast

#### Registration Modal UI
- Simple overlay modal with form
- Name and email fields (pre-filled with defaults)
- Context message shows pending friend's name
- Create Account / Cancel buttons
- Triggered from "Add friend" or Settings

#### ActivityDetailsModal Props
```javascript
<ActivityDetailsModal
  // ... existing props
  onAddFriend={handleAddFriend}
  friendsList={state.friendsList || []}
/>
```

## User Flow

### Flow 1: Registered User Adds Friend

1. User opens Activity Details → Participants
2. Sees "Add friend" button next to non-friend participants
3. Clicks "Add friend"
4. Friend request created and stored
5. Event update emitted to Inbox
6. Toast: "Friend request sent to [Name]"
7. Button disappears (no longer eligible)

### Flow 2: Unregistered User Adds Friend

1. User opens Activity Details → Participants
2. Clicks "Add friend" button
3. Registration modal appears with context message
4. User enters name and email
5. Clicks "Create Account"
6. Account created (userAccount.loggedIn = true)
7. Toast: "Account created successfully!"
8. Friend request automatically sent
9. Toast: "Friend request sent to [Name]"
10. Modal closes, returns to Activity Details

### Flow 3: User Cancels Registration

1. User clicks "Add friend" (not logged in)
2. Registration modal appears
3. User clicks "Cancel"
4. Modal closes, no friend request sent
5. Pending request cleared

## Integration with Existing Systems

### Inbox System (Phase E-2d)
- Friend requests emit `friend_request` updates
- Updates stored in `event_updates_v1`
- Will appear in Inbox → Updates (when UI is implemented)
- Resolution logic ready for future implementation

### Friends System
- Uses existing `friendsList` state
- Checks `status: 'accepted'` for friendship
- No modifications to friend data structure
- Ready for acceptance flow in future phase

### Activity System
- Uses `activity.participants` array
- No changes to activity data model
- Works with existing participant management

## UI/UX Details

### Button Design
- **Icon**: UserPlus (14px)
- **Text**: "Add friend"
- **Style**: Secondary text button
- **Color**: slate-600, hover: blue-600
- **Font**: xs, medium weight
- **Position**: Right side of participant row
- **Behavior**: Single-click action

### Registration Modal
- **Layout**: Centered overlay with backdrop
- **Size**: max-w-sm (384px)
- **Style**: Rounded corners, shadow
- **Fields**: Name, Email (pre-filled)
- **Buttons**: Cancel (secondary), Create Account (primary)
- **Context**: Shows pending friend's name when applicable

### Toast Notifications
- "Friend request sent to [Name]" - Success
- "Account created successfully!" - Success
- "Please enter your name and email" - Error
- "You are already friends" - Info
- "Friend request already pending" - Info

## Error Handling

### Validation
- Name and email required for registration
- Duplicate request prevention
- Already friends check
- Current user exclusion

### Edge Cases
- Empty participants array → Show host only
- No participants property → Show host only
- Rapid clicks → Prevented by eligibility checks
- Modal cancel → Cleans up pending state

### Fail-Safe Rules
- If eligibility uncertain → Don't show button
- If validation fails → Show clear error message
- If request exists → Don't create duplicate

## Testing

See `FRIEND_REQUEST_TEST_PLAN.md` for comprehensive test scenarios.

## Future Enhancements

### Phase 2: Friend Request Acceptance
- Inbox UI for friend requests
- Accept/Decline actions
- Update friendsList on acceptance
- Notification badges

### Phase 3: Friend Management
- View friend requests in dedicated screen
- Unfriend action
- Block/unblock users
- Friend suggestions (optional)

### Phase 4: Enhanced Context
- Show mutual friends
- Show shared activities
- Friend profile preview
- Activity history together

## Code Quality

### Separation of Concerns
- ✅ Data layer: `utils/friendRequests.js`
- ✅ Update system: `utils/eventUpdates.js`
- ✅ UI component: `ActivityDetailsModal.js`
- ✅ Business logic: `App.js`

### Reusability
- ✅ Friend request utilities are reusable
- ✅ Registration modal can be triggered from multiple places
- ✅ Eligibility checks are centralized

### Maintainability
- ✅ Clear function names and documentation
- ✅ Consistent with existing patterns
- ✅ No duplicate code
- ✅ Easy to extend

## Compliance with Requirements

✅ **Contextual** - Only in Activity Details → Participants  
✅ **Explicit** - Requires user action  
✅ **Mutual** - Data model supports acceptance  
✅ **Optional** - Not forced or suggested  
✅ **Registration gated** - Prompts for account creation  
✅ **Inbox integration** - Updates emitted correctly  
✅ **Calm UI** - Secondary action, not dominant  
✅ **No auto-add** - Always requires consent  
✅ **No suggestions** - Only contextual discovery  
✅ **Fail-safe** - Defaults to not showing button  

## Files Modified

1. **src/utils/friendRequests.js** (NEW) - 135 lines
2. **src/utils/eventUpdates.js** (MODIFIED) - Added 20 lines
3. **src/components/ActivityDetailsModal.js** (MODIFIED) - Added 60 lines
4. **src/App.js** (MODIFIED) - Added 120 lines

**Total**: ~335 lines added

## Dependencies

No new external dependencies added. Uses existing:
- React hooks (useState, useCallback)
- lucide-react icons (UserPlus)
- localStorage API
- Existing utility functions

## Performance Impact

- ✅ Minimal - Only runs eligibility checks when Participants tab is viewed
- ✅ No network requests
- ✅ localStorage operations are fast
- ✅ No re-renders on unrelated state changes

## Accessibility

- ✅ Button has clear text label
- ✅ Modal has proper focus management
- ✅ Form inputs have labels
- ✅ Keyboard navigation works
- ✅ Toast notifications provide feedback

## Security Considerations

- ✅ No sensitive data exposed
- ✅ User IDs are internal (not email/phone)
- ✅ Friend requests stored locally (no server in prototype)
- ✅ Registration is optional (demo mode)

## Conclusion

The contextual friend request feature has been successfully implemented following all design principles and requirements. The implementation is:

- **Complete** - All core functionality working
- **Clean** - Well-organized and maintainable
- **Compliant** - Follows all specified rules
- **Calm** - Non-intrusive and optional
- **Contextual** - Only appears where relevant
- **Consent-based** - Registration required

The feature is ready for testing and can be extended in future phases to include friend request acceptance and management.

