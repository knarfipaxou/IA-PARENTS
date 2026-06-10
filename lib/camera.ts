import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  base64: true,
  quality: 0.7,
};

/**
 * Opens the camera (or falls back to the photo library on web / when
 * camera permission is denied) and returns the picked image as a base64
 * string, or null if the user cancelled.
 */
export async function pickImage(): Promise<string | null> {
  let result: ImagePicker.ImagePickerResult | null = null;

  if (Platform.OS !== 'web') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.granted) {
      try {
        result = await ImagePicker.launchCameraAsync(OPTIONS);
      } catch {
        result = null;
      }
    }
  }

  if (!result) {
    const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!libPerm.granted && Platform.OS !== 'web') return null;
    result = await ImagePicker.launchImageLibraryAsync(OPTIONS);
  }

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].base64 ?? null;
}

/** Opens the photo library directly. */
export async function pickFromLibrary(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted && Platform.OS !== 'web') return null;
  const result = await ImagePicker.launchImageLibraryAsync(OPTIONS);
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].base64 ?? null;
}
