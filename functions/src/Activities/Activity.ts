import { firestore } from '../../config/firestore';

export interface ActivityData {
    type: 'book' | 'videogame';
    title: string;
    titleLower?: string;
    author?: string;
    platform?: string;
}

const COLLECTION = 'activities';

export class Activity {
    id: string;
    type: 'book' | 'videogame';
    title: string;
    titleLower?: string;
    author?: string;
    platform?: string;

    constructor(data: ActivityData & { id: string }) {
        this.id = data.id;
        this.type = data.type;
        this.title = data.title;
        this.titleLower = data.titleLower;
        this.author = data.author;
        this.platform = data.platform;
    }

    static async getAll(): Promise<Activity[]> {
        const snapshot = await firestore.collection(COLLECTION).get();
        return snapshot.docs.map(
            (doc) =>
                new Activity({
                    id: doc.id,
                    ...(doc.data() as ActivityData),
                })
        );
    }

    static async getByType(
        type: 'book' | 'videogame'
    ): Promise<Activity[]> {
        const snapshot = await firestore
            .collection(COLLECTION)
            .where('type', '==', type)
            .get();
        return snapshot.docs.map(
            (doc) =>
                new Activity({
                    id: doc.id,
                    ...(doc.data() as ActivityData),
                })
        );
    }

    static async exists(title: string): Promise<boolean> {
        const normalizedTitle = title.toLowerCase();
        const snapshot = await firestore
            .collection(COLLECTION)
            .where('titleLower', '==', normalizedTitle)
            .limit(1)
            .get();

        if (!snapshot.empty) return true;

        const legacySnapshot = await firestore
            .collection(COLLECTION)
            .where('title', '==', title)
            .limit(1)
            .get();

        if (!legacySnapshot.empty) {
            await legacySnapshot.docs[0].ref.update({
                titleLower: normalizedTitle,
            });
            return true;
        }

        return !snapshot.empty;
    }

    static async add(data: ActivityData): Promise<Activity> {
        const titleLower = data.title.toLowerCase();
        const docRef = await firestore.collection(COLLECTION).add({
            type: data.type,
            title: data.title,
            titleLower,
            ...(data.author && { author: data.author }),
            ...(data.platform && { platform: data.platform }),
        });
        return new Activity({ ...data, titleLower, id: docRef.id });
    }

    static async remove(title: string): Promise<boolean> {
        const normalizedTitle = title.toLowerCase();
        const snapshot = await firestore
            .collection(COLLECTION)
            .where('titleLower', '==', normalizedTitle)
            .limit(1)
            .get();

        const match = snapshot.docs[0];

        if (match) {
            await match.ref.delete();
            return true;
        }

        const legacySnapshot = await firestore
            .collection(COLLECTION)
            .where('title', '==', title)
            .limit(1)
            .get();
        const legacyMatch = legacySnapshot.docs[0];

        if (!legacyMatch) return false;

        await legacyMatch.ref.delete();
        return true;
    }

    format(): string {
        if (this.type === 'book') {
            const authorPart = this.author ? `, by _${this.author}_` : '';
            return `Reading: ${this.title}${authorPart}`;
        } else {
            const platformPart = this.platform ?
                `, on _${this.platform}_` : '';
            return `Playing: ${this.title}${platformPart}`;
        }
    }
}
