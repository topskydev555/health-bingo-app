import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Participant } from '../../types/participant.type';
import { removeParticipant } from '../../services/participant.service';
import { useChallengesStore } from '../../store/challenges.store';
import { Modal } from '../common/Modal';

interface ParticipantDetailModalProps {
  visible: boolean;
  participant: Participant | null;
  onClose: () => void;
  onRemove: () => void;
}

const getStatusColor = (status: string) => {
  return status === 'joined' ? '#4CAF50' : '#FF6B35';
};

const getRoleText = (isOrganizer: boolean) => {
  return isOrganizer ? 'Organizer' : 'Player';
};

export const ParticipantDetailModal: React.FC<ParticipantDetailModalProps> = ({
  visible,
  participant,
  onClose,
  onRemove,
}) => {
  const { selectedChallenge } = useChallengesStore();
  const [removing, setRemoving] = useState(false);

  const isFinished = selectedChallenge?.status === 'finish' || selectedChallenge?.status === 'finishing';

  const handleRemoveParticipant = async () => {
    if (!participant) return;

    Alert.alert(
      'Remove Participant',
      `Are you sure you want to remove ${participant.user ? participant.user.first_name + ' ' + participant.user.last_name : participant.email} from the challenge?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemoving(true);
              await removeParticipant(selectedChallenge!.id, participant.id);
              onClose();
              onRemove();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove participant');
            } finally {
              setRemoving(false);
            }
          },
        },
      ]
    );
  };

  if (!participant) return null;

  return (
    <Modal visible={visible} onClose={onClose} widthPercentage={80}>
      <Text style={styles.modalTitle}>
        {participant.user?.first_name} {participant.user?.last_name}
      </Text>

      <View style={styles.detailSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Display Name:</Text>
          <Text style={styles.detailValue}>
            {participant.user?.display_name || 'Not provided'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email:</Text>
          <Text style={styles.detailValue}>{participant.email}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Country:</Text>
          <Text style={styles.detailValue}>
            {participant.user?.country || 'Not provided'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Timezone:</Text>
          <Text style={styles.detailValue}>
            {participant.user?.timezone || 'Not provided'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Points:</Text>
          <Text style={styles.detailValue}>{participant.points}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Wild Cards:</Text>
          <Text style={styles.detailValue}>{participant.wild_cards}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, { color: getStatusColor(participant.status) }]}>
            {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Role:</Text>
          <Text style={styles.detailValue}>{getRoleText(participant.is_organizer)}</Text>
        </View>

        {participant.joined_at && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Joined:</Text>
            <Text style={styles.detailValue}>
              {new Date(participant.joined_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.modalButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Close</Text>
        </TouchableOpacity>
        {!participant.is_organizer && !isFinished && (
          <TouchableOpacity
            style={[
              styles.removeParticipantButton,
              removing && styles.removeParticipantButtonDisabled
            ]}
            onPress={handleRemoveParticipant}
            disabled={removing}
          >
            <Text style={styles.removeParticipantButtonText}>
              {removing ? "Removing..." : "Remove"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    flex: 2,
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  removeParticipantButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  removeParticipantButtonDisabled: {
    opacity: 0.6,
  },
  removeParticipantButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
