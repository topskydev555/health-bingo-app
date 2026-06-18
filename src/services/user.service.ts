import { AuthUser } from '../store/auth.store';
import { apiFetch } from '../utils';

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  country?: string;
  timezone?: string;
  push_reminders?: boolean;
  image?: string | null;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const checkDisplayName = async (
  displayName: string
): Promise<boolean> => {
  const response = await apiFetch('/api/user/check-display-name', 'POST', {
    display_name: displayName,
  });
  return response.available;
};

export const getProfile = async (): Promise<AuthUser> => {
  const response = await apiFetch('/api/user/profile', 'GET', {});
  return {
    email: response.email,
    firstName: response.first_name,
    lastName: response.last_name,
    image: response.image,
    id: response.id,
    displayName: response.display_name,
    timezone: response.timezone,
    country: response.country ?? '',
    activated: response.activated ?? false,
  };
};

export const updateProfile = async (data: UpdateProfileData): Promise<any> => {
  const response = await apiFetch('/api/user/profile', 'PATCH', data);
  return response;
};

export const uploadImage = async (
  imageUri: string
): Promise<{ image_url: string }> => {
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'profile.jpg',
  } as any);

  const response = await apiFetch(
    '/api/user/upload-image',
    'POST',
    formData,
    true
  );
  return response;
};

export const removeImage = async (): Promise<void> => {
  await apiFetch('/api/user/remove-image', 'DELETE', {});
};

export const getImageUrl = async (): Promise<{ imageUrl: string | null }> => {
  const response = await apiFetch('/api/user/image-url', 'GET', {});
  return { imageUrl: response.image_url };
};

export const deleteAccount = async (): Promise<void> => {
  await apiFetch('/api/user/me', 'DELETE', {});
};

export const searchUsers = async (username: string): Promise<any> => {
  const response = await apiFetch(
    `/api/user/search?username=${encodeURIComponent(username)}`,
    'GET',
    {}
  );
  return response;
};
