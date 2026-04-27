import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Footer } from '../../components/create-challenge/Footer';
import { Header } from '../../components/create-challenge/Header';
import { DashboardHeader } from '../../components/dashboard';
import { SCREEN_NAMES } from '../../constants';
import { usePlans, useToast } from '../../hooks';
import { createChallenge, searchUsers } from '../../services';
import { Participant, useCreateStore } from '../../store';
import { COLORS } from '../../theme';
import { CreateChallengeStackParamList } from '../../types/navigation.type';

type NavigationProp = NativeStackNavigationProp<CreateChallengeStackParamList>;

export const InviteParticipants: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { getPlanById } = usePlans();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const { showToast } = useToast();
  const {
    title,
    plan,
    duration,
    categoryId,
    cardSize,
    bingoCards,
    isOrganizerParticipant,
    participants,
    setParticipants,
    startingDayOfWeek,
    startImmediately,
  } = useCreateStore();

  const isValidEmail = (email: string) =>
    /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email.trim());

  const isUsernameSearch = (input: string) => input.startsWith('@');

  const checkEmailExists = (email: string) => {
    return participants.some(
      p => p.email.toLowerCase() === email.toLowerCase()
    );
  };

  const maxParticipants = getPlanById(plan as string)?.maxParticipants || 3;
  const isAtLimit = participants.length >= maxParticipants;

  const handleAddParticipant = async () => {
    setLoading(true);
    if (isAtLimit) {
      showToast('You have reached the maximum number of players');
      setLoading(false);
      return;
    }
    if (isUsernameSearch(value)) {
      const username = value.substring(1);
      if (username.length === 0) {
        showToast('Username is required');
        setLoading(false);
        return;
      }
      const user = await searchUsers(username);
      if (user) {
        if (checkEmailExists(user.email)) {
          showToast('User already added');
          setLoading(false);
          return;
        }
        setParticipants((prev: Participant[]) => [
          ...prev,
          {
            email: user.email,
            displayName: user.display_name,
            image: user.image,
          },
        ]);
      } else {
        showToast('User not found');
        setLoading(false);
      }
    } else {
      if (isValidEmail(value)) {
        if (checkEmailExists(value)) {
          showToast('User already added');
          setLoading(false);
          return;
        }
        setParticipants((prev: Participant[]) => [...prev, { email: value }]);
      } else {
        showToast('Invalid email');
      }
    }
    setValue('');
    setLoading(false);
  };

  const handleRemove = (participant: Participant) => {
    setParticipants((prev: Participant[]) =>
      prev.filter(p => p !== participant)
    );
  };

  const handlePublish = async () => {
    setPublishing(true);
    // Custom bingo cards: only name, color, count
    const customBingoCards = bingoCards
      .filter(card => card.count > 0 && card.type === 'custom')
      .map(card => ({
        title: card.name,
        color: card.color,
        count: card.count,
      }));
    // Default bingo cards: array of IDs repeated by count
    const defaultBingoCardIds = bingoCards
      .filter(card => card.count > 0 && card.type !== 'custom')
      .flatMap(card => Array(card.count).fill(card.id));
    const challenge: any = {
      title,
      plan,
      duration,
      category_id: categoryId,
      card_size: cardSize,
      is_organizer_participant: isOrganizerParticipant,
      starting_day_of_week: startingDayOfWeek,
      start_immediately: startImmediately,
      participants: participants.map(p => p.email),
      custom_cards: customBingoCards,
      default_cards: defaultBingoCardIds,
    };
    try {
      const { data } = await createChallenge(challenge);

      navigation.navigate(SCREEN_NAMES._CREATE_CHALLENGE.PAY_CHALLENGE, {
        challenge: data,
      });
    } catch (error) {
      showToast('Failed to publish challenge');
    } finally {
      setPublishing(false);
    }
  };

  const handleCancel = () => {
    navigation.navigate(SCREEN_NAMES.DASHBOARD as never);
  };

  const handleBack = () => {
    navigation.navigate(
      SCREEN_NAMES._CREATE_CHALLENGE.DEFINE_CHALLENGE as never
    );
  };

  return (
    <>
      <DashboardHeader
        title="Create Challenge"
        action={
          <TouchableOpacity onPress={handleCancel}>
            <Text style={{ color: COLORS.primary.green, marginRight: 4 }}>
              Cancel
            </Text>
          </TouchableOpacity>
        }
        showProfileIcon={false}
      />
      <View style={styles.container}>
        <Header
          title="Invite Players"
          step={3}
          totalSteps={3}
          onBack={handleBack}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.participantInfo}>
            <Text style={styles.participantCount}>
              Players ({participants.length}/{maxParticipants})
            </Text>
            <Text style={styles.planInfo}>{plan} Plan</Text>
          </View>

          <View style={styles.list}>
            {participants.map((item, index) => (
              <View key={index} style={styles.row}>
                <Image
                  source={
                    item.image
                      ? { uri: item.image }
                      : require('../../assets/images/create-challenge/default-avatar.png')
                  }
                  style={styles.avatar}
                />
                <Text style={styles.rowText}>
                  {item.displayName || item.email}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemove(item)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

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
            <TouchableOpacity
              style={[styles.addButton, isAtLimit && styles.addButtonDisabled]}
              onPress={handleAddParticipant}
              disabled={loading}
            >
              <Text
                style={{ ...styles.addButtonText, opacity: loading ? 0.5 : 1 }}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Footer>
          <TouchableOpacity
            style={styles.publishButton}
            onPress={handlePublish}
            disabled={publishing}
          >
            <Text
              style={{
                ...styles.publishButtonText,
                opacity: publishing ? 0.5 : 1,
              }}
            >
              Publish & Send Invites{publishing && '...'}
            </Text>
          </TouchableOpacity>
        </Footer>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.white,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  participantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  participantCount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  planInfo: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textTransform: 'capitalize',
  },
  list: {
    gap: 12,
    marginBottom: 16,
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
  },
  deleteBtnText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    lineHeight: 16,
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
  publishButton: {
    flex: 1,
    backgroundColor: COLORS.primary.green,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  publishButtonText: {
    color: COLORS.primary.white,
    fontSize: 14,
  },
});
