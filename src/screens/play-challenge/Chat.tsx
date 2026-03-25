import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ProfileIcon, UserIntroductionModal } from '../../components/common';
import { useMessages, useToast } from '../../hooks';
import { useAuthStore, useChallengesStore, useLastSeenStore } from '../../store';
import { COLORS, FONTS } from '../../theme';
import { ChatSender } from '../../types/chat.type';

export const ChatScreen: React.FC = () => {
  const { selectedChallenge } = useChallengesStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const challengeId = selectedChallenge?.id;
  const isFinished = selectedChallenge?.status === 'finish'
  const { messages, loading, hasMore, fetchMore, send, sending } = useMessages({
    challengeId,
    pageSize: 20,
    auto: true,
  });
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ChatSender | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { updateLastSeen } = useLastSeenStore();
  const listRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const myId = user?.id;

  // Header height is approximately 64px (48px button + 16px padding)
  const HEADER_HEIGHT = 64;

  useEffect(() => {
    updateLastSeen(challengeId || '');
  }, []);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const renderItem = useCallback(
    ({ item }: any) => {
      const isMe = item.sent_by === myId;

      let sender;
      if (item.sender?.id) {
        sender = item.sender;
      } else {
        sender = {
          id: 'system',
          image: require('../../assets/images/auth/logo.png'),
        };
      }

      const initials =
        (sender?.first_name?.[0] || '') + (sender?.last_name?.[0] || '');
      const image = sender?.image ?? null;
      const time = item.sent_time || item.createdAt;
      const dateTimeText = time
        ? new Date(time).toLocaleString([], {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
        : '';

      const handleUserIconPress = () => {
        if (!isMe && sender) {
          setSelectedUser(sender);
          setIsModalVisible(true);
        }
      };

      return (
        <View style={styles.messageContainer}>
          <View
            style={[styles.messageRow, isMe ? styles.rowMe : styles.rowOther]}
          >
            {!isMe && (
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={handleUserIconPress}
                activeOpacity={0.7}
              >
                <ProfileIcon
                  image={image}
                  initialsText={initials || 'Player'}
                  size={40}
                />
              </TouchableOpacity>
            )}
            <View
              style={[
                styles.bubble,
                isMe ? styles.bubbleMe : styles.bubbleOther,
              ]}
            >
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              )}
              {item.content ? (
                <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                  {item.content}
                </Text>
              ) : null}
            </View>
            {isMe && (
              <View style={styles.avatarContainer}>
                <ProfileIcon
                  image={image}
                  initialsText={initials || 'Player'}
                  size={40}
                />
              </View>
            )}
          </View>
          <View
            style={[
              styles.timeContainer,
              isMe ? styles.timeContainerMe : styles.timeContainerOther,
            ]}
          >
            <Text style={[styles.timeText, isMe && styles.timeTextMe]}>
              {dateTimeText}
            </Text>
          </View>
        </View>
      );
    },
    [myId, user]
  );

  const onEndReached = useCallback(() => {
    if (hasMore && !loading) fetchMore();
  }, [hasMore, loading, fetchMore]);

  const canSend = useMemo(
    () => (text.trim().length > 0 || selectedImage) && !sending,
    [text, selectedImage, sending]
  );

  const handleImageResponse = useCallback((response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      let errorMessage = 'Failed to open image picker';
      if (response.errorCode === 'permission') {
        errorMessage =
          'Permission denied. Please enable camera and photo library access in settings.';
      } else if (response.errorMessage) {
        errorMessage = response.errorMessage;
      }
      showToast(errorMessage, 'error');
      return;
    }

    const imageUri = response.assets?.[0]?.uri;
    if (!imageUri) {
      showToast('Failed to select image', 'error');
      return;
    }

    setSelectedImage(imageUri);
  }, [showToast]);

  const handleImagePicker = useCallback(() => {
    Alert.alert(
      'Select Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera(
              {
                mediaType: 'photo',
                quality: 0.8,
              },
              handleImageResponse
            );
          },
        },
        {
          text: 'Photo Library',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
              },
              handleImageResponse
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }, [handleImageResponse]);

  const handleSend = useCallback(async () => {
    if (!canSend || !challengeId) return;
    const toSend = text.trim();
    const imageToSend = selectedImage;
    setText('');
    setSelectedImage(null);

    try {
      await send(toSend, imageToSend || undefined);
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      setText(toSend);
      setSelectedImage(imageToSend);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send message. Please try again.';
      showToast(errorMessage, 'error');
    }
  }, [canSend, challengeId, text, selectedImage, send, showToast]);

  const content = (
    <>
      <View style={styles.listContainer}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          inverted
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator
                color={COLORS.primary.green}
                style={{ paddingVertical: 12 }}
              />
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      </View>
      {isFinished ? (
        <View style={styles.finishedBar}>
          <Text style={styles.finishedBarText}>This challenge has ended. Chat is read-only.</Text>
        </View>
      ) : (
        <View style={styles.inputBar}>
          {selectedImage && (
            <View style={styles.selectedImageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            onPress={handleImagePicker}
            style={styles.imagePickerButton}
            activeOpacity={0.7}
          >
            <Text style={styles.imagePickerText}>📷</Text>
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Type a message"
            placeholderTextColor={COLORS.gray.mediumDark}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!canSend}
            style={[styles.sendButton, !canSend && styles.sendDisabled]}
          >
            <MaterialIcons name="send" size={20} color={COLORS.primary.white} />
          </TouchableOpacity>
        </View>
      )}
      <UserIntroductionModal
        visible={isModalVisible}
        user={selectedUser}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
        }}
      />
    </>
  );

  // Calculate keyboard offset accounting for header
  // Safe area is already handled by navigation container, so we only need header height
  const keyboardVerticalOffset = HEADER_HEIGHT;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {content}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary.white,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rowMe: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    marginHorizontal: 8,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  bubbleMe: {
    backgroundColor: COLORS.primary.green,
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: COLORS.primary.white,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gray.lightMedium,
  },
  senderName: {
    fontSize: 13,
    color: COLORS.primary.blue,
    fontFamily: FONTS.family.poppinsSemiBold,
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    color: COLORS.primary.blue,
    fontFamily: FONTS.family.poppinsRegular,
    lineHeight: 20,
  },
  messageTextMe: {
    color: COLORS.primary.white,
  },
  timeContainer: {
    paddingHorizontal: 16,
    marginTop: 2,
  },
  timeContainerMe: {
    alignItems: 'flex-end',
    paddingRight: 56, // Account for avatar space
  },
  timeContainerOther: {
    alignItems: 'flex-start',
    paddingLeft: 56, // Account for avatar space
  },
  timeText: {
    fontSize: 10,
    color: COLORS.gray.mediumDark,
    fontFamily: FONTS.family.poppinsRegular,
    opacity: 0.7,
  },
  timeTextMe: {
    color: COLORS.gray.mediumDark,
    opacity: 0.7,
  },
  finishedBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.gray.veryLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray.lightMedium,
    alignItems: 'center',
  },
  finishedBarText: {
    fontSize: 13,
    fontFamily: FONTS.family.poppinsRegular,
    color: COLORS.gray.mediumDark,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray.lightMedium,
    gap: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: COLORS.gray.veryLight,
    color: COLORS.primary.blue,
    fontSize: 16,
    fontFamily: FONTS.family.poppinsRegular,
    borderWidth: 1,
    borderColor: COLORS.gray.lightMedium,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary.green,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sendDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedImageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  selectedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: COLORS.primary.white,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  imagePickerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray.veryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.gray.lightMedium,
  },
  imagePickerText: {
    fontSize: 20,
  },
});
