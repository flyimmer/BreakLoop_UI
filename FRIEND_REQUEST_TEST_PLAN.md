# Friend Request Feature - Test Plan

## Feature Overview
Contextual friend request functionality from Activity Details → Participants tab.

## Implementation Summary

### Files Created/Modified
1. **src/utils/friendRequests.js** (NEW)
   - Friend request data model and storage
   - Functions: createFriendRequest, findExistingRequest, areAlreadyFriends, etc.

2. **src/utils/eventUpdates.js** (MODIFIED)
   - Added FRIEND_REQUEST update type
   - Added emitFriendRequestUpdate() function

3. **src/components/ActivityDetailsModal.js** (MODIFIED)
   - Added "Add friend" button to Participants section
   - Shows button only when eligible (not already friends, no pending request)
   - Imports friend request utilities for eligibility checks

4. **src/App.js** (MODIFIED)
   - Added handleAddFriend() handler
   - Added handleCompleteRegistration() handler
   - Added registration modal UI
   - Connected registration flow to friend request resumption

## Test Scenarios

### Scenario 1: Add Friend (User Registered)
**Setup:**
- User is logged in (userAccount.loggedIn = true)
- Navigate to Community → Discover
- Open an activity with participants

**Steps:**
1. Click on activity to open Activity Details
2. Navigate to "Participants" tab
3. Verify "Add friend" button appears next to non-friend participants
4. Click "Add friend" button

**Expected Result:**
- Toast message: "Friend request sent to [Name]"
- Button should disappear or change state
- Friend request stored in localStorage (friend_requests_v1)
- Event update emitted to Inbox (event_updates_v1)

### Scenario 2: Add Friend (User Not Registered)
**Setup:**
- User is NOT logged in (userAccount.loggedIn = false)
- Navigate to Community → Discover
- Open an activity with participants

**Steps:**
1. Click on activity to open Activity Details
2. Navigate to "Participants" tab
3. Click "Add friend" button

**Expected Result:**
- Registration modal appears
- Modal shows context: "Create an account to send a friend request to [Name]"
- User can enter name and email
- After clicking "Create Account":
  - User account is created (userAccount.loggedIn = true)
  - Toast: "Account created successfully!"
  - Friend request is automatically sent
  - Toast: "Friend request sent to [Name]"

### Scenario 3: Already Friends
**Setup:**
- User is logged in
- Target participant is already in friendsList with status "accepted"

**Expected Result:**
- "Add friend" button does NOT appear for this participant

### Scenario 4: Pending Request Exists
**Setup:**
- User is logged in
- A pending friend request already exists between users

**Expected Result:**
- "Add friend" button does NOT appear for this participant

### Scenario 5: Current User
**Setup:**
- User is logged in
- Viewing activity where current user is a participant

**Expected Result:**
- "Add friend" button does NOT appear next to "You"

### Scenario 6: Host View
**Setup:**
- User is the host of the activity
- Activity has multiple participants

**Expected Result:**
- Host sees all participants
- "Add friend" button appears for non-friend participants
- Host badge (Shield icon) appears next to host name

## Data Verification

### localStorage Keys to Check:
1. **friend_requests_v1** - Friend request objects
   ```json
   [
     {
       "id": "freq_1234567890_abc123",
       "fromUserId": "f0",
       "fromUserName": "Wei",
       "toUserId": "f3",
       "toUserName": "Sarah",
       "status": "pending",
       "createdAt": 1234567890000
     }
   ]
   ```

2. **event_updates_v1** - Event updates including friend requests
   ```json
   [
     {
       "id": "upd_1234567890_xyz789",
       "type": "friend_request",
       "eventId": "freq_1234567890_abc123",
       "actorId": "f0",
       "actorName": "Wei",
       "message": "Wei wants to add you as a friend",
       "createdAt": 1234567890000,
       "resolved": false
     }
   ]
   ```

3. **mindful_account_v17_2** - User account state
   ```json
   {
     "loggedIn": true,
     "name": "Wei",
     "email": "wei@example.com",
     "streak": 3,
     "isPremium": false
   }
   ```

## Console Verification

Check browser console for:
```
[Event Update Emitted] {
  type: 'friend_request',
  eventId: 'freq_...',
  actor: 'Wei',
  message: 'Wei wants to add you as a friend',
  timestamp: '2024-...'
}
```

## UI/UX Verification

### Button Styling
- Text button with UserPlus icon
- Color: text-slate-600, hover:text-blue-600
- Font: text-xs font-medium
- Not visually dominant (secondary action)
- Positioned to the right of participant name

### Registration Modal
- Centered overlay with backdrop
- Clean, simple form
- Pre-filled with default values
- Clear call-to-action
- Cancel option available
- Context message shows pending friend's name

## Edge Cases

### Edge Case 1: Multiple Participants
- Activity has 5+ participants
- Some are friends, some are not
- Verify correct button visibility for each

### Edge Case 2: Rapid Clicks
- Click "Add friend" multiple times quickly
- Should only create one request
- Subsequent clicks should show "already pending" toast

### Edge Case 3: Cancel Registration
- Click "Add friend" (not logged in)
- Registration modal appears
- Click "Cancel"
- Modal closes, no friend request sent

### Edge Case 4: Empty Participants Array
- Activity has no participants array
- Should show host only
- No errors in console

## Regression Tests

Verify existing functionality still works:
1. Join activity flow
2. Accept/Decline join requests
3. Event group chat
4. Activity Details navigation
5. Inbox updates display

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ Data persists correctly in localStorage
✅ Registration flow is smooth and contextual
✅ Friend request button only shows when eligible
✅ UI is calm and non-intrusive
✅ No breaking changes to existing features

## Known Limitations

1. Friend request acceptance UI not implemented (future phase)
2. No friend request notifications in Inbox UI yet (data-only in this phase)
3. No search/browse friends feature
4. No suggested friends

## Next Steps (Future Phases)

1. Implement friend request acceptance/decline UI in Inbox
2. Add friend request badge to Inbox tab
3. Implement friend profile view from friend requests
4. Add friend management (unfriend, block, etc.)

