# Security Specification for Yemen Warrior & Forex

## Data Invariants
1. A user profile must only be created or modified by the authenticated owner.
2. A forex account must be linked to a valid user and can only be managed by that user.
3. Trades must have a valid user ID matching the creator and must follow strict status transitions (OPEN -> CLOSED).
4. Match records are immutable once created and must belong to the authenticated user.
5. Kills and wins statistics can only be updated through verified game logic (protected by owner checks).

## The Dirty Dozen Payloads

1. **Identity Spoofing (User Profile)**: Attempting to create a user profile for a different UID.
2. **Identity Spoofing (Forex Account)**: Attempting to create a forex account for a different UID.
3. **State Shortcutting (Trade)**: Attempting to create a trade directly in 'CLOSED' status with a manual profit.
4. **State Shortcutting (Match)**: Attempting to update a match record to 'won: true' after it was created.
5. **Resource Poisoning (User Name)**: Attempting to set a `displayName` longer than 50 characters.
6. **Resource Poisoning (Trade ID)**: Injecting a 1MB string as a `tradeId`.
7. **Privilege Escalation (Balance)**: Attempting to update `balance` in a `forexAccount` without a valid trade closing.
8. **Shadow Field Injection**: Adding an `isAdmin: true` field to a user profile.
9. **PII Leakage**: Authenticated user attempting to list all `forexAccounts` to see other users' balances.
10. **Type Poisoning**: Setting `lotSize` to a string "one" instead of a number.
11. **Timestamp Spoofing**: Providing a client-side `updatedAt` instead of using the server timestamp.
12. **Orphaned Trade**: Creating a trade for a `userId` that does not exist in the `users` collection.

## Test Runner (firestore.rules.test.ts)
```typescript
import { assertSucceeds, assertFails, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'planning-with-ai-bdd0d',
    firestore: {
      rules: '', // Loaded from file
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Yemen Warrior Security Rules', () => {
  test('Payload 1: Should deny profile creation for different UID', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(setDoc(doc(alice.firestore(), 'users', 'bob'), { uid: 'bob', displayName: 'Bob' }));
  });

  test('Payload 5: Should deny displayName longer than 50 chars', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(setDoc(doc(alice.firestore(), 'users', 'alice'), { 
      uid: 'alice', 
      displayName: 'A'.repeat(51) 
    }));
  });

  test('Payload 9: Should deny listing all forex accounts', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(getDocs(collection(alice.firestore(), 'forexAccounts')));
  });
});
```
