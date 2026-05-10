import { useEffect, useRef } from 'react';
import { subscribeToChallengeUpdate } from '../services/firebase-chat.service';
import { useAuthStore, useChallengesStore } from '../store';

const DEBOUNCE_MS = 500;

export const useChallengeUpdates = () => {
  const { activeChallenges, fetchChallenges } = useChallengesStore();
  const { user } = useAuthStore();

  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const fetchRef = useRef(fetchChallenges);
  const challengesRef = useRef(activeChallenges);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);

  // Update refs inline — avoids separate sync effects and always reflects the
  // latest values without adding them to the subscription effect's dep array.
  fetchRef.current = fetchChallenges;
  challengesRef.current = activeChallenges;

  // Stable primitive: effect only re-runs when the SET of IDs changes (add/remove).
  // Firebase onValue fires immediately on subscribe, so re-subscribing on every
  // data update would cause: fetch → store update → resubscribe → fetch → ∞
  const idsKey = activeChallenges.map(c => c.id).sort().join(',');

  useEffect(() => {
    if (!user?.id) return;

    const scheduleFetch = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        if (fetchingRef.current) {
          // Fetch already in-flight — reschedule after it settles.
          scheduleFetch();
          return;
        }
        fetchingRef.current = true;
        Promise.resolve(fetchRef.current(true)).finally(() => {
          fetchingRef.current = false;
        });
      }, DEBOUNCE_MS);
    };

    const challenges = challengesRef.current;

    // Subscribe to challenges we haven't seen yet.
    challenges.forEach(({ id }) => {
      if (subscriptionsRef.current.has(id)) return;

      // Firebase onValue fires once immediately with the current snapshot.
      // Drop that first call — we only want to react to genuine updates.
      let initialFire = true;
      const unsubscribe = subscribeToChallengeUpdate(id, () => {
        if (initialFire) { initialFire = false; return; }
        scheduleFetch();
      });
      subscriptionsRef.current.set(id, unsubscribe);
    });

    // Unsubscribe listeners for challenges that are no longer active.
    const activeIds = new Set(challenges.map(c => c.id));
    subscriptionsRef.current.forEach((unsubscribe, id) => {
      if (!activeIds.has(id)) {
        unsubscribe();
        subscriptionsRef.current.delete(id);
      }
    });

    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current.clear();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = null;
    };
  }, [idsKey, user?.id]);
};
