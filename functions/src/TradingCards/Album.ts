import { v4 as uuidv4 } from 'uuid';
import { database } from '../../config/database';

import { Collection } from './Collection';

export class Album {
    _path: string;
    _collection: string;
    _username: string;
    _cards: Record<string, any>;

    constructor(collectionName: any, username: any, cards: any) {
        this._path = `albums/${collectionName}/${username}`;
        this._collection = collectionName;
        this._username = username;
        this._cards = cards;
    }

    static create(collectionName: any, username: any) {
        console.log('[ALBUM/CREATE] – Creating Album');
        return database.ref(`albums/${collectionName}/${username}`).set({
            uid: uuidv4(),
        });
    }

    static createCollaborative(
        collectionName: any,
        username: any,
        collabs: any[]
    ) {
        console.log('[ALBUM/CREATE] – Creating Collaborative Album');
        const ref = database.ref(`albums/${collectionName}/${username}`).set({
            uuid: uuidv4(),
            collabs,
        });
        collabs.forEach((collab: any) => {
            database.ref(`albums/${collectionName}/${collab}`).set({
                uuid: uuidv4(),
                owner: username,
            });
        });
        return ref;
    }

    static get(collectionName: any, username: any) {
        console.log('[ALBUM/GET] – Retrieving Album');
        const result = new Promise((resolve, reject) => {
            database
                .ref(`albums/${collectionName}/${username}`)
                .once('value', (snap: any) => {
                    console.log('[ALBUM/GET] – Album Retrieved');
                    if (snap.hasChild('owner')) {
                        console.log('[ALBUM/GET] – Album is Collaborative');
                        const owner = snap.child('owner').val();
                        database
                            .ref(`albums/${collectionName}/${owner}`)
                            .once('value', (originalSnap: any) => {
                                const cards =
                                    originalSnap.hasChild('cards') &&
                                    originalSnap.child('cards').toJSON();

                                if (cards) {
                                    console.log('[ALBUM/GET] – Cards Found');
                                    resolve({
                                        found: true,
                                        album: new this(
                                            collectionName,
                                            owner,
                                            cards
                                        ),
                                    });
                                } else {
                                    console.log(
                                        '[ALBUM/GET] – Cards Not Found'
                                    );
                                    resolve({ found: false, album: undefined });
                                }
                            });
                    } else {
                        const cards =
                            snap.hasChild('cards') &&
                            snap.child('cards').toJSON();

                        if (cards) {
                            console.log('[ALBUM/GET] – Cards Found');
                            resolve({
                                found: true,
                                album: new this(
                                    collectionName,
                                    username,
                                    cards
                                ),
                            });
                        } else {
                            console.log('[ALBUM/GET] – Cards Not Found');
                            resolve({
                                found: true,
                                album: new this(collectionName, username, []),
                            });
                        }
                    }
                })
                .catch((err: any) => {
                    console.log('[ALBUM/GET] – Album Not Found');
                    reject(err);
                });
        });
        return result;
    }

    async addCards(cards: any[]) {
        const newCards = new Set();
        const repes = new Set();
        const newRepes = new Set();
        const dict: Record<string, any> = {};
        cards.forEach((card: string | number) => {
            dict[card] = dict[card] ? dict[card] + 1 : 1;
        });
        for (const [card, value] of Object.entries(dict)) {
            const count = this._cards[card] || 0;
            if (value > 1) newRepes.add(card);
            if (!count) {
                newCards.add(card);
            } else {
                repes.add(card);
            }
            database.ref(`${this._path}/cards/${card}`).set(count + value);
        }
        return {
            newCards,
            repes,
            newRepes,
        };
    }

    async dealCards(cards: any[]) {
        const dealtCards = new Set();
        const missingCards = new Set();
        const dict: Record<string, any> = {};
        cards.forEach((card: string | number) => {
            dict[card] = dict[card] ? dict[card] + 1 : 1;
        });
        for (const [card, value] of Object.entries(dict)) {
            const count = this._cards[card] || 0;
            if (count > value) {
                dealtCards.add(card);
                database.ref(`${this._path}/cards/${card}`).set(count - value);
            } else {
                missingCards.add(card);
            }
        }
        return {
            dealtCards,
            missingCards,
        };
    }

    async tengui() {
        return this._cards;
    }

    async falti() {
        const collectionData: any = await Collection.get(this._collection);
        const cards = await this._cards;
        const falti = [];
        for (let i = 1; i <= collectionData.getNumCards(); i++) {
            if (!cards[i]) falti.push(i);
        }
        return falti;
    }

    async repes() {
        const repes: Record<string, any> = {};
        for (const card in this._cards) {
            if (this._cards[card] > 1) {
                repes[card] = this._cards[card];
            }
        }
        return repes;
    }
}
