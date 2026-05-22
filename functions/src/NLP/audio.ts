const OPENAI_TRANSCRIPTIONS_URL =
    'https://api.openai.com/v1/audio/transcriptions';
const OPENAI_TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';
const MAX_TRANSCRIPTION_BYTES = 25 * 1024 * 1024;
const TRANSCRIPTION_PROMPT = [
    'Transcribe this Telegram voice message in the original language.',
    'Keep names, commands, numbers, place names, and domain vocabulary',
    'exactly as spoken.',
    'Do not translate, summarize, or answer the message.',
].join(' ');

type SupportedAudioMediaType =
    | 'audio/flac'
    | 'audio/m4a'
    | 'audio/mp4'
    | 'audio/mpeg'
    | 'audio/mpga'
    | 'audio/ogg'
    | 'audio/wav'
    | 'audio/webm';

interface TelegramAudioSource {
    kind: 'audio' | 'voice';
    fileId: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
}

interface TelegramAudioFile {
    bytes: Buffer;
    fileName: string;
    mediaType: SupportedAudioMediaType;
}

const SUPPORTED_AUDIO_MEDIA_TYPES: SupportedAudioMediaType[] = [
    'audio/flac',
    'audio/m4a',
    'audio/mp4',
    'audio/mpeg',
    'audio/mpga',
    'audio/ogg',
    'audio/wav',
    'audio/webm',
];

export function hasSupportedTelegramAudio(message: any): boolean {
    return Boolean(getTelegramAudioSource(message));
}

export async function transcribeTelegramAudioMessage(
    ctx: any
): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
        throw new Error('Missing OpenAI transcription API key.');
    }

    const audioFile = await extractTelegramAudioFile(ctx);

    if (!audioFile) {
        throw new Error('No transcribable Telegram audio was found.');
    }

    const formData = new FormData();
    formData.append(
        'file',
        new Blob([audioFile.bytes], { type: audioFile.mediaType }),
        audioFile.fileName
    );
    formData.append('model', OPENAI_TRANSCRIPTION_MODEL);
    formData.append('response_format', 'text');
    formData.append('prompt', TRANSCRIPTION_PROMPT);

    const response = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(
            `OpenAI transcription failed (${response.status}).`
        );
    }

    const transcript = normalizeTranscript(await response.text());

    if (!transcript) {
        throw new Error('Empty transcription received from OpenAI.');
    }

    return transcript;
}

function getTelegramAudioSource(message: any): TelegramAudioSource | null {
    const voice = message?.voice;

    if (voice?.file_id) {
        return {
            kind: 'voice',
            fileId: voice.file_id,
            fileSize: voice.file_size,
            mimeType: voice.mime_type,
        };
    }

    const audio = message?.audio;

    if (audio?.file_id) {
        return {
            kind: 'audio',
            fileId: audio.file_id,
            fileName: audio.file_name,
            fileSize: audio.file_size,
            mimeType: audio.mime_type,
        };
    }

    const document = message?.document;

    if (
        document?.file_id &&
        typeof document.mime_type === 'string' &&
        document.mime_type.startsWith('audio/')
    ) {
        return {
            kind: 'audio',
            fileId: document.file_id,
            fileName: document.file_name,
            fileSize: document.file_size,
            mimeType: document.mime_type,
        };
    }

    return null;
}

async function extractTelegramAudioFile(
    ctx: any
): Promise<TelegramAudioFile | null> {
    const source = getTelegramAudioSource(ctx.message);

    if (!source) return null;

    if (source.fileSize && source.fileSize > MAX_TRANSCRIPTION_BYTES) {
        throw new Error('Telegram audio file is too large for transcription.');
    }

    const fileUrl = await ctx.telegram.getFileLink(source.fileId);
    const response = await fetch(fileUrl);

    if (!response.ok) {
        throw new Error(
            `Failed to download Telegram audio (${response.status}).`
        );
    }

    const mediaType = resolveAudioMediaType(
        response.headers.get('content-type'),
        source.mimeType,
        source.fileName,
        fileUrl.pathname
    );

    if (!mediaType) {
        throw new Error('Unsupported Telegram audio type.');
    }

    const bytes = Buffer.from(await response.arrayBuffer());

    if (bytes.byteLength > MAX_TRANSCRIPTION_BYTES) {
        throw new Error('Telegram audio file is too large for transcription.');
    }

    return {
        bytes,
        fileName: resolveFileName(source, mediaType, fileUrl.pathname),
        mediaType,
    };
}

function resolveAudioMediaType(
    contentType: string | null,
    declaredMimeType: string | undefined,
    fileName: string | undefined,
    pathname: string
): SupportedAudioMediaType | null {
    const candidates = [
        contentType,
        declaredMimeType,
        getMediaTypeFromExtension(fileName ?? ''),
        getMediaTypeFromExtension(pathname),
    ];

    for (const candidate of candidates) {
        const normalized = normalizeMediaType(candidate);

        if (normalized && isSupportedAudioMediaType(normalized)) {
            return normalized;
        }
    }

    return null;
}

function resolveFileName(
    source: TelegramAudioSource,
    mediaType: SupportedAudioMediaType,
    pathname: string
): string {
    const candidate = source.fileName ?? pathname.split('/').pop() ?? '';

    if (candidate.includes('.')) {
        return candidate;
    }

    return `${source.kind}-message.${getExtensionForMediaType(mediaType)}`;
}

function normalizeTranscript(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeMediaType(mediaType: string | null | undefined): string | null {
    if (!mediaType) return null;

    const normalized = mediaType
        .split(';')[0]
        .trim()
        .toLowerCase();

    if (normalized === 'application/ogg') {
        return 'audio/ogg';
    }

    if (normalized === 'audio/x-m4a') {
        return 'audio/m4a';
    }

    if (normalized === 'audio/x-wav') {
        return 'audio/wav';
    }

    return normalized;
}

function getMediaTypeFromExtension(
    value: string
): SupportedAudioMediaType | null {
    const normalized = value.toLowerCase();

    if (normalized.endsWith('.flac')) return 'audio/flac';
    if (normalized.endsWith('.m4a')) return 'audio/m4a';
    if (normalized.endsWith('.mp3') || normalized.endsWith('.mpeg')) {
        return 'audio/mpeg';
    }

    if (normalized.endsWith('.mp4')) return 'audio/mp4';
    if (normalized.endsWith('.mpga')) return 'audio/mpga';
    if (
        normalized.endsWith('.ogg') ||
        normalized.endsWith('.oga') ||
        normalized.endsWith('.opus')
    ) {
        return 'audio/ogg';
    }

    if (normalized.endsWith('.wav')) return 'audio/wav';
    if (normalized.endsWith('.webm')) return 'audio/webm';

    return null;
}

function getExtensionForMediaType(mediaType: SupportedAudioMediaType): string {
    switch (mediaType) {
    case 'audio/flac':
        return 'flac';
    case 'audio/m4a':
        return 'm4a';
    case 'audio/mp4':
        return 'mp4';
    case 'audio/mpeg':
        return 'mp3';
    case 'audio/mpga':
        return 'mpga';
    case 'audio/ogg':
        return 'ogg';
    case 'audio/wav':
        return 'wav';
    case 'audio/webm':
        return 'webm';
    }
}

function isSupportedAudioMediaType(
    mediaType: string
): mediaType is SupportedAudioMediaType {
    return SUPPORTED_AUDIO_MEDIA_TYPES.includes(
        mediaType as SupportedAudioMediaType
    );
}
