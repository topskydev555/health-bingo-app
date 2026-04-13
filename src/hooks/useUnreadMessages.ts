import { useEffect, useRef, useState } from 'react';
import { getUnreadMessageCount } from '../services/firebase-chat.service';
import { useAuthStore, useChallengesStore, useLastSeenStore } from '../store';

export const useUnreadMessages = () => {
  const { activeChallenges } = useChallengesStore();
  const { user } = useAuthStore();
  const lastSeenTimes = useLastSeenStore(state => state.lastSeenTimes);

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const unsubscribeRefs = useRef<Record<string, (() => void) | null>>({});

  useEffect(() => {
    if (!user?.id) {
      // Reset counts if user is not logged in
      setUnreadCounts({});
      return;
    }

    // Subscribe to unread counts for each ongoing challenge
    activeChallenges.forEach((challenge) => {
      const challengeId = challenge.id;

      // Clean up existing subscription if any
      if (unsubscribeRefs.current[challengeId]) {
        unsubscribeRefs.current[challengeId]?.();
        unsubscribeRefs.current[challengeId] = null;
      }

      // Get last seen timestamp for this challenge
      const lastSeenTimestamp = lastSeenTimes[challengeId] || null;

      // Subscribe to unread message count
      const unsubscribe = getUnreadMessageCount(
        challengeId,
        lastSeenTimestamp,
        user.id,
        (count) => {
          setUnreadCounts((prev) => ({
            ...prev,
            [challengeId]: count,
          }));
        }
      );

      unsubscribeRefs.current[challengeId] = unsubscribe;
    });

    // Clean up subscriptions for challenges that are no longer ongoing
    Object.keys(unsubscribeRefs.current).forEach((challengeId) => {
      const stillExists = activeChallenges.some((ch) => ch.id === challengeId);
      if (!stillExists) {
        unsubscribeRefs.current[challengeId]?.();
        delete unsubscribeRefs.current[challengeId];
        setUnreadCounts((prev) => {
          const updated = { ...prev };
          delete updated[challengeId];
          return updated;
        });
      }
    });

    // Cleanup function
    return () => {
      Object.values(unsubscribeRefs.current).forEach((unsubscribe) => {
        unsubscribe?.();
      });
      unsubscribeRefs.current = {};
    };
  }, [activeChallenges, user?.id, lastSeenTimes]);

  // Calculate total unread count
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return {
    unreadCounts,
    totalUnread,
    getUnreadCount: (challengeId: string) => unreadCounts[challengeId] || 0,
  };
};

