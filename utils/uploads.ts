import { Platform } from 'react-native';

type ImageAsset = { uri: string; fileName?: string | null; mimeType?: string | null };

export async function appendImage(form: FormData, field: string, asset: ImageAsset): Promise<void> {
    const name = asset.fileName || asset.uri.split('/').pop()?.split('?')[0] || 'image.jpg';
    if (Platform.OS === 'web') {
        const response = await fetch(asset.uri);
        if (!response.ok) throw new Error('Unable to read the selected image. Please select it again.');
        form.append(field, await response.blob(), name);
        return;
    }
    const extension = name.split('.').pop()?.toLowerCase();
    const type = asset.mimeType || (extension === 'png' ? 'image/png'
        : extension === 'webp' ? 'image/webp' : extension === 'gif' ? 'image/gif' : 'image/jpeg');
    form.append(field, { uri: asset.uri, name, type } as any);
}
