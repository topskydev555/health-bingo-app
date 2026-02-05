import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ImageErrorEventData,
  ImageSourcePropType,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { getImageUrl } from '../../services/user.service';
import { COLORS, FONTS } from '../../theme';

interface ProfileIconProps {
  image?: string | ImageSourcePropType | null;
  initialsText?: string;
  size?: number;
  editable?: boolean;
  onUpload?: (imageUri: string) => Promise<void>;
}

export const ProfileIcon: React.FC<ProfileIconProps> = ({
  image,
  initialsText,
  size = 40,
  editable = false,
  onUpload,
}) => {
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState<
    string | ImageSourcePropType | null | undefined
  >(image);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);

  useEffect(() => {
    setCurrentImage(image);
    setHasTriedRefresh(false);
  }, [image]);

  const getBackgroundColor = () => {
    const name = initialsText || '';
    let value = 0;
    for (let i = 0; i < name.length; i++) {
      value += name.charCodeAt(i);
    }
    const colors = Object.values(COLORS.bingo);
    const index = value % colors.length;
    return colors[index];
  };

  const handleImageResponse = async (response: ImagePickerResponse) => {
    if (!onUpload) return;

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
      Alert.alert('Error', errorMessage);
      return;
    }

    const imageUri = response.assets?.[0]?.uri;
    if (!imageUri) {
      Alert.alert('Error', 'Failed to select image');
      return;
    }

    try {
      await onUpload(imageUri);
    } catch (error) {
      Alert.alert(
        'Upload Error',
        error instanceof Error ? error.message : 'Failed to upload image'
      );
    }
  };

  const handleImagePicker = () => {
    if (!editable || !onUpload || uploading) return;

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
                maxWidth: 500,
                maxHeight: 500,
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
                maxWidth: 500,
                maxHeight: 500,
                selectionLimit: 1,
              },
              handleImageResponse
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleImageError = async (error: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (hasTriedRefresh || !currentImage) {
      setCurrentImage(null);
      return;
    }

    try {
      setHasTriedRefresh(true);
      const { imageUrl } = await getImageUrl();
      if (imageUrl) {
        setCurrentImage(imageUrl);
        setHasTriedRefresh(false);
      } else {
        setCurrentImage(null);
      }
    } catch (err) {
      setCurrentImage(null);
    }
  };

  const getImageSource = useCallback(() => {
    if (!currentImage) {
      return null;
    }
    if (typeof currentImage === 'string') {
      return { uri: currentImage };
    }
    return currentImage;
  }, [currentImage]);

  const imageSource = useMemo(() => getImageSource(), [currentImage]);

  return (
    <View
      style={[
        styles.container,
        styles.placeholder,
        { width: size, height: size, backgroundColor: getBackgroundColor() },
      ]}
    >
      <TouchableOpacity
        onPress={handleImagePicker}
        disabled={!editable || uploading}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            style={[styles.image, { width: size, height: size }]}
            resizeMode="cover"
            onError={handleImageError}
          />
        ) : (
          <Text style={[styles.initials, { fontSize: size * 0.32 }]}>
            {initialsText?.toUpperCase()}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary.white,
    shadowColor: COLORS.primary.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    borderRadius: 18,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: FONTS.family.poppinsBold,
    color: COLORS.primary.white,
    fontWeight: 'bold',
  },
});
