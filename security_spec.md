# Security Specification for Yemen Battle Royale

## Data Invariants
1. A user cannot modify another user's profile.
2. Users cannot increment their own `totalKills` or `totalWins` to arbitrary values; they must be updated logically (though rules have limits here, we use increment).
3. `matches` are immutable after creation.
4. `uid` in `users` must match the document ID.

## The "Dirty Dozen" Payloads (PERMISSION_DENIED)
1. Update another user's profile.
2. Create a user profile with `isAdmin: true` (if we had admins).
3. Create a match record with a different `userId` than the authenticated one.
4. Modify an existing match record (Immutability test).
5. Delete another user's profile.
6. Create a user profile with `totalKills: 999999`.
7. Update `users` collection without being signed in.
8. Inject a 1MB string into `displayName`.
9. Update `lastActive` with a client-side date instead of `request.time`.
10. List all `matches` (should be restricted to owner if we enforce privacy, but for leaderboards matches might be public? No, matches should be private or specific).
11. Add a `ghostField` to the user profile.
12. Use a non-alphanumeric character in a document ID.

## Test Runner (firestore.rules.test.ts)
```typescript
// To be implemented in Phase 1
```
