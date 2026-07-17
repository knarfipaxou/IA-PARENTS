import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Les photos d'iPhone dépassent facilement 5 Mo : l'API IA les refuse
// (« Could not process image »). Chaque image est donc redimensionnée
// (max 1600 px de large) et recompressée en JPEG avant l'envoi.
const MAX_WIDTH = 1600;
const COMPRESS = 0.6;

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 1,
};

/** Redimensionne + convertit en JPEG base64 prêt pour l'API. */
export async function toApiBase64(uri: string, width?: number): Promise<string | null> {
  try {
    const actions = width && width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [{ resize: { width: Math.min(width ?? MAX_WIDTH, MAX_WIDTH) } }];
    const out = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: COMPRESS,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    return out.base64 ?? null;
  } catch {
    return null;
  }
}

async function assetsToBase64(assets: ImagePicker.ImagePickerAsset[]): Promise<string[]> {
  const out: string[] = [];
  for (const a of assets) {
    const b64 = await toApiBase64(a.uri, a.width);
    if (b64) out.push(b64);
  }
  return out;
}

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
  return (await assetsToBase64([result.assets[0]]))[0] ?? null;
}

/** Opens the photo library directly. */
export async function pickFromLibrary(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted && Platform.OS !== 'web') return null;
  const result = await ImagePicker.launchImageLibraryAsync(OPTIONS);
  if (result.canceled || !result.assets?.length) return null;
  return (await assetsToBase64([result.assets[0]]))[0] ?? null;
}

/**
 * Opens the photo library with multi-selection (up to `max` images) and
 * returns the picked images as base64 strings (empty array if cancelled).
 */
export async function pickManyFromLibrary(max: number): Promise<string[]> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted && Platform.OS !== 'web') return [];
  const result = await ImagePicker.launchImageLibraryAsync({
    ...OPTIONS,
    allowsMultipleSelection: true,
    selectionLimit: max,
  });
  if (result.canceled || !result.assets?.length) return [];
  return assetsToBase64(result.assets.slice(0, max));
}
