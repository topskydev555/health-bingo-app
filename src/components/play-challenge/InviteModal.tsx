import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { usePlans } from '../../hooks/usePlans';
import { Participant } from '../../types/participant.type';
import { inviteParticipants } from '../../services/participant.service';
import { searchUsers } from '../../services/user.service';
import { useChallengesStore } from '../../store/challenges.store';
import { COLORS } from '../../theme';
import { CustomButton } from '../common/Button';
import { Modal } from '../common/Modal';

export type Candidate = {
  email: string;
  displayName?: string;
  image?: string;
};

interface InviteModalProps {
  participants: Participant[];
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  participants,
  visible,
  onClose,
  onSuccess,
}) => {
  const { selectedChallenge } = useChallengesStore();
  const { getPlanById } = usePlans();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [value, setValue] = useState('');
  const [inviting, setInviting] = useState(false);
  const [addingEmail, setAddingEmail] = useState(false);

  const isValidEmail = (email: string) =>
    /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email.trim());
  const isUsernameSearch = (input: string) => input.startsWith('@');
  const checkEmailExists = useCallback(
    (email: string) =>
      candidates.some(
        c =>
          c.email.toLowerCase() === email.toLowerCase() ||
          participants.some(p => p.email.toLowerCase() === email.toLowerCase())
      ),
    [candidates, participants]
  );

  const isAtLimit = useMemo(
    () =>
      participants.length + candidates.length >=
      (getPlanById(selectedChallenge?.plan as string)?.maxParticipants || 0),
    [participants, candidates, selectedChallenge?.plan]
  );

  const addEmail = async () => {
    if (value.trim() !== value) {
      Alert.alert(
        'Invalid Input',
        'Input should not contain spaces. Please remove any spaces and try again.'
      );
      return;
    }

    if (isAtLimit) {
      Alert.alert(
        'At Limit',
        `You have reached the maximum number of participants for your plan. Please upgrade your plan to invite more participants.`
      );
      return;
    }

    setAddingEmail(true);
    try {
      if (isUsernameSearch(value)) {
        const username = value.substring(1);
        if (username.length === 0) {
          Alert.alert('Invalid Username', 'Username is required');
          return;
        }
        try {
          const user = await searchUsers(username);
          if (user) {
            if (checkEmailExists(user.email)) {
              Alert.alert(
                'User Already Added',
                'This user has already been added to the list'
              );
              return;
            }
            setCandidates([
              ...candidates,
              {
                email: user.email,
                displayName: user.display_name,
                image: user.image,
              },
            ]);
          } else {
            Alert.alert('User Not Found', 'No user found with that username');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to search for user');
        }
      } else {
        if (!isValidEmail(value)) {
          Alert.alert('Invalid Email', 'Please enter a valid email address');
          return;
        }
        if (checkEmailExists(value)) {
          Alert.alert(
            'Email Already Added',
            'This email has already been added to the list'
          );
          return;
        }

        setCandidates([...candidates, { email: value }]);
      }

      setValue('');
    } catch (error) {
      console.error('Error', 'Failed to add email');
    } finally {
      setAddingEmail(false);
    }
  };

  const removeEmail = (email: string) => {
    setCandidates(candidates.filter(c => c.email !== email));
  };

  const sendInvitations = async () => {
    if (candidates.length === 0) return;

    try {
      setInviting(true);
      await inviteParticipants(
        selectedChallenge!.id,
        candidates.map(c => c.email)
      );
      setCandidates([]);
      onClose();
      onSuccess();
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitations');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} widthPercentage={95}>
      <Text style={styles.modalTitle}>Invite Players</Text>

      <View style={styles.inputSection}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Input email or @username"
            placeholderTextColor={COLORS.gray.mediumDark}
            value={value}
            onChangeText={setValue}
            keyboardType={isValidEmail(value) ? 'email-address' : 'default'}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          <CustomButton
            text="Add"
            onPress={addEmail}
            disabled={isAtLimit || !value.trim() || addingEmail}
            variant="outline"
            buttonStyle={styles.addButton}
            textStyle={styles.addButtonText}
          />
        </View>
      </View>

      {candidates.length > 0 && (
        <View style={styles.emailListSection}>
          <Text style={styles.emailListTitle}>
            Invitations ({candidates.length})
          </Text>
          <ScrollView
            style={styles.emailListContainer}
            showsVerticalScrollIndicator={false}
          >
            {candidates.map((candidate, index) => (
              <View key={index} style={styles.row}>
                <Image
                  source={
                    candidate.image
                      ? { uri: candidate.image }
                      : require('../../assets/images/create-challenge/default-avatar.png')
                  }
                  style={styles.avatar}
                />
                <Text style={styles.rowText}>
                  {candidate.displayName || candidate.email}
                </Text>
                <CustomButton
                  text="×"
                  onPress={() => removeEmail(candidate.email)}
                  variant="default"
                  buttonStyle={styles.deleteBtn}
                  textStyle={styles.deleteBtnText}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.modalButtons}>
        <CustomButton
          text="Cancel"
          onPress={onClose}
          variant="outline"
          buttonStyle={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
        <CustomButton
          text={inviting ? 'Sending...' : 'Send'}
          onPress={sendInvitations}
          disabled={candidates.length === 0 || inviting}
          loading={inviting}
          variant="primary"
          buttonStyle={styles.sendButton}
          textStyle={styles.sendButtonText}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  emailListSection: {
    marginBottom: 24,
  },
  emailListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emailListContainer: {
    maxHeight: 300,
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary.green,
    borderRadius: 28,
    paddingLeft: 16,
    paddingRight: 8,
    height: 48,
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
  sendButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
  },
  addButton: {
    backgroundColor: COLORS.primary.white,
    borderWidth: 1,
    borderColor: COLORS.primary.green,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: COLORS.primary.green,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  rowText: {
    flex: 1,
    color: COLORS.primary.blue,
  },
  deleteBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    gap: 0,
  },
  deleteBtnText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    lineHeight: 16,
  },
});
