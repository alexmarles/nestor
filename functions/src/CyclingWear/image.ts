import { Base64ImageSource } from '@anthropic-ai/sdk/resources/messages/messages';

export interface CyclingForecastImage {
    data: string;
    mediaType: Base64ImageSource['media_type'];
}

const SUPPORTED_MEDIA_TYPES: Base64ImageSource['media_type'][] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
];

export async function extractCyclingForecastImage(
    ctx: any
): Promise<CyclingForecastImage | null> {
    const fileId = getTelegramImageFileId(ctx.message);

    if (!fileId) return null;

    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(fileUrl);

    if (!response.ok) {
        throw new Error(
            `Failed to download Telegram image (${response.status}).`
        );
    }

    const mediaType = resolveMediaType(
        response.headers.get('content-type'),
        fileUrl.pathname
    );

    if (!mediaType) {
        throw new Error('Unsupported Telegram image type.');
    }

    const bytes = Buffer.from(await response.arrayBuffer());

    return {
        data: bytes.toString('base64'),
        mediaType,
    };
}

export function hasSupportedTelegramImage(message: any): boolean {
    return Boolean(getTelegramImageFileId(message));
}

function getTelegramImageFileId(message: any): string | null {
    const photo = message?.photo;

    if (Array.isArray(photo) && photo.length > 0) {
        return photo[photo.length - 1]?.file_id ?? null;
    }

    const document = message?.document;
    if (
        document?.file_id &&
        typeof document.mime_type === 'string' &&
        document.mime_type.startsWith('image/')
    ) {
        return document.file_id;
    }

    return null;
}

function resolveMediaType(
    contentType: string | null,
    pathname: string
): Base64ImageSource['media_type'] | null {
    const normalizedType = contentType?.split(';')[0].trim().toLowerCase();

    if (normalizedType && isSupportedMediaType(normalizedType)) {
        return normalizedType;
    }

    const lowerPath = pathname.toLowerCase();

    if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) {
        return 'image/jpeg';
    }

    if (lowerPath.endsWith('.png')) {
        return 'image/png';
    }

    if (lowerPath.endsWith('.gif')) {
        return 'image/gif';
    }

    if (lowerPath.endsWith('.webp')) {
        return 'image/webp';
    }

    return null;
}

function isSupportedMediaType(
    mediaType: string
): mediaType is Base64ImageSource['media_type'] {
    return SUPPORTED_MEDIA_TYPES.includes(
        mediaType as Base64ImageSource['media_type']
    );
}
