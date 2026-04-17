import { useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingCard } from '../../components/common';
import { Participant } from '../../types/participant.type';
import { InviteModal } from '../../components/play-challenge/InviteModal';
import { ParticipantCard } from '../../components/play-challenge/ParticipantCard';
import { ParticipantDetailModal } from '../../components/play-challenge/ParticipantDetailModal';
import { fetchParticipants } from '../../services/participant.service';
import { useChallengesStore } from '../../store/challenges.store';

export const ParticipantManagementScreen: React.FC = () => {
  const { selectedChallenge } = useChallengesStore();
  const isFocused = useIsFocused();
  const isFinished = selectedChallenge?.status === 'finish' || selectedChallenge?.status === 'finishing';
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadParticipants = useCallback(async () => {
    if (!selectedChallenge?.id) return;
    try {
      setLoading(true);
      const data = await fetchParticipants(selectedChallenge.id);
      setParticipants(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load players');
    } finally {
      setLoading(false);
    }
  }, [selectedChallenge?.id]);

  useEffect(() => {
    if (isFocused) {
      loadParticipants();
    } else {
      setLoading(false);
    }
  }, [isFocused, loadParticipants]);

  const handleParticipantPress = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowDetailModal(true);
  };

  const joinedParticipants = useMemo(
    () =>
      participants
        .filter(p => p.status === 'joined')
        .sort((a, b) => {
          if (a.is_organizer && !b.is_organizer) return -1;
          if (!a.is_organizer && b.is_organizer) return 1;
          return 0;
        }),
    [participants]
  );
  const pendingParticipants = useMemo(
    () => participants.filter(p => p.status === 'pending'),
    [participants]
  );

  return (
    <View style={styles.container}>
      {isFocused && loading && (
        <LoadingCard visible={loading} message="Loading players..." />
      )}

      <ScrollView style={styles.scrollView}>
        {joinedParticipants.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Joined Players</Text>
            {joinedParticipants.map(participant => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onPress={() => handleParticipantPress(participant)}
              />
            ))}
          </>
        )}

        {pendingParticipants.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Pending Players</Text>
            {pendingParticipants.map(participant => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                onPress={() => handleParticipantPress(participant)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {!isFinished && (
        <View style={styles.inviteButtonContainer}>
          <TouchableOpacity
            style={styles.inviteMoreButton}
            onPress={() => setShowInviteModal(true)}
          >
            <Text style={styles.inviteMoreButtonText}>Invite More</Text>
          </TouchableOpacity>
        </View>
      )}

      <InviteModal
        participants={participants}
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={loadParticipants}
      />

      <ParticipantDetailModal
        visible={showDetailModal}
        participant={selectedParticipant}
        onClose={() => setShowDetailModal(false)}
        onRemove={loadParticipants}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
    marginLeft: 16,
  },
  inviteButtonContainer: {
    padding: 16,
  },
  inviteMoreButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  inviteMoreButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});
