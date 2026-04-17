import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Participant } from '../../types/participant.type';
import { ProfileIcon } from '../common';

interface ParticipantCardProps {
  participant: Participant;
  onPress: () => void;
}

const getRoleText = (isOrganizer: boolean) => {
  return isOrganizer ? 'Organizer' : 'Player';
};

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, onPress }) => {
  const username = useMemo(() => {
    if (participant.user?.first_name && participant.user?.last_name) {
      return participant.user?.first_name + ' ' + participant.user?.last_name;
    }
    if (participant.user?.display_name) {
      return participant.user?.display_name;
    }
    return participant.email;
  }, [participant]);

  const initials = useMemo(() => {
    return username.split(' ').map(name => name[0]).join('');
  }, [username]);

  return (
    <TouchableOpacity style={styles.participantCard} onPress={onPress}>
      <View style={styles.participantAvatar}>
        <ProfileIcon
          image={participant.user?.image}
          initialsText={initials}
          size={40}
        />
      </View>
      <View style={styles.participantInfo}>
        <View style={styles.participantHeader}>
          <Text style={styles.participantName}>
            {username}
          </Text>
          <Text style={styles.roleText}>{getRoleText(participant.is_organizer)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  participantCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  participantAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  participantInfo: {
    flex: 1,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  roleText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
});
