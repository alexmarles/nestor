import { firestore } from '../../config/firestore';

export interface ActivityData {
    type: 'book' | 'videogame';
    title: string;
    author?: string;
    platform?: string;
}

const COLLECTION = 'activities';

export class Activity {
    id: string;
    type: 'book' | 'videogame';
    title: string;
    author?: string;
    platform?: string;

    constructor(data: ActivityData & { id: string }) {
        this.id = data.id;
        this.type = data.type;
        this.title = data.title;
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
        const snapshot = await firestore.collection(COLLECTION).get();
        return snapshot.docs.some(
            (doc) =>
                (doc.data() as ActivityData).title.toLowerCase() ===
                title.toLowerCase()
        );
    }

    static async add(data: ActivityData): Promise<Activity> {
        const docRef = await firestore.collection(COLLECTION).add({
            type: data.type,
            title: data.title,
            ...(data.author && { author: data.author }),
            ...(data.platform && { platform: data.platform }),
        });
        return new Activity({ ...data, id: docRef.id });
    }

    static async remove(title: string): Promise<boolean> {
        const snapshot = await firestore.collection(COLLECTION).get();
        const match = snapshot.docs.find(
            (doc) =>
                (doc.data() as ActivityData).title.toLowerCase() ===
                title.toLowerCase()
        );

        if (!match) return false;

        await match.ref.delete();
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
