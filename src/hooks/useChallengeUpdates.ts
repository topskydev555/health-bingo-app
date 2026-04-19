import { useEffect, useRef } from 'react';
import { subscribeToChallengeUpdate } from '../services/firebase-chat.service';
import { useAuthStore, useChallengesStore } from '../store';

export const useChallengeUpdates = () => {
  const { activeChallenges, fetchChallenges } = useChallengesStore();
  const { user } = useAuthStore();
  const unsubscribeRefs = useRef<Record<string, (() => void) | null>>({});
  const fetchChallengesRef = useRef(fetchChallenges);
  const lastUpdateTimestamps = useRef<Record<string, number>>({});
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchChallengesRef.current = fetchChallenges;
  }, [fetchChallenges]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    activeChallenges.forEach((challenge) => {
      const challengeId = challenge.id;

      if (unsubscribeRefs.current[challengeId]) {
        unsubscribeRefs.current[challengeId]?.();
        unsubscribeRefs.current[challengeId] = null;
      }

      if (debounceTimers.current[challengeId]) {
        clearTimeout(debounceTimers.current[challengeId]!);
        debounceTimers.current[challengeId] = null;
      }

      const unsubscribe = subscribeToChallengeUpdate(challengeId, (updateData: { timestamp?: number; updated_at?: string }) => {
        const updateTimestamp = updateData?.timestamp || Date.now();
        const lastTimestamp = lastUpdateTimestamps.current[challengeId] || 0;

        if (updateTimestamp <= lastTimestamp) {
          return;
        }

        if (debounceTimers.current[challengeId]) {
          clearTimeout(debounceTimers.current[challengeId]!);
        }

        debounceTimers.current[challengeId] = setTimeout(() => {
          debounceTimers.current[challengeId] = null;

          const doFetch = () => {
            isFetchingRef.current = true;
            lastUpdateTimestamps.current[challengeId] = updateTimestamp;

            Promise.resolve(fetchChallengesRef.current(true)).finally(() => {
              isFetchingRef.current = false;
            });
          };

          if (isFetchingRef.current) {
            // Retry once the in-progress fetch completes
            const retryTimer = setTimeout(doFetch, 1000);
            debounceTimers.current[challengeId] = retryTimer;
          } else {
            doFetch();
          }
        }, 500);
      });

      unsubscribeRefs.current[challengeId] = unsubscribe;
    });

    Object.keys(unsubscribeRefs.current).forEach((challengeId) => {
      const stillExists = activeChallenges.some((ch) => ch.id === challengeId);
      if (!stillExists) {
        unsubscribeRefs.current[challengeId]?.();
        delete unsubscribeRefs.current[challengeId];
        delete lastUpdateTimestamps.current[challengeId];
        if (debounceTimers.current[challengeId]) {
          clearTimeout(debounceTimers.current[challengeId]!);
          delete debounceTimers.current[challengeId];
        }
      }
    });

    return () => {
      Object.values(unsubscribeRefs.current).forEach((unsubscribe) => {
        unsubscribe?.();
      });
      Object.values(debounceTimers.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
      unsubscribeRefs.current = {};
      debounceTimers.current = {};
    };
  }, [activeChallenges, user?.id]);
};

