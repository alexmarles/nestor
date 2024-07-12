const { v4: uuidv4 } = require('uuid');
const { database } = require('../../config/database');

const { Collection } = require('./Collection');

class Album {
    constructor(collectionName, username, cards) {
        this._path = `albums/${collectionName}/${username}`;
        this._collection = collectionName;
        this._username = username;
        this._cards = cards;
    }

    static create(collectionName, username) {
        console.log('[ALBUM/CREATE] – Creating Album');
        return database.ref(`albums/${collectionName}/${username}`).set({
            uid: uuidv4(),
        });
    }

    static createCollaborative(collectionName, username, collabs) {
        console.log('[ALBUM/CREATE] – Creating Collaborative Album');
        const ref = database.ref(`albums/${collectionName}/${username}`).set({
            uuid: uuidv4(),
            collabs,
        });
        if (ref) {
            collabs.forEach(collab => {
                database.ref(`albums/${collectionName}/${collab}`).set({
                    uuid: uuidv4(),
                    owner: username,
                });
            });
        }
        return ref;
    }

    static get(collectionName, username) {
        console.log('[ALBUM/GET] – Retrieving Album');
        const result = new Promise((resolve, reject) => {
            database
                .ref(`albums/${collectionName}/${username}`)
                .once('value', snap => {
                    console.log('[ALBUM/GET] – Album Retrieved');
                    if (snap.hasChild('owner')) {
                        console.log('[ALBUM/GET] – Album is Collaborative');
                        const owner = snap.child('owner').val();
                        database
                            .ref(`albums/${collectionName}/${owner}`)
                            .once('value', originalSnap => {
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
                .catch(err => {
                    console.log('[ALBUM/GET] – Album Not Found');
                    reject(err);
                });
        });
        return result;
    }

    async addCards(cards) {
        const newCards = [];
        cards.forEach(card => {
            const count = !!this._cards[card] ? this._cards[card] + 1 : 1;
            if (count === 1) newCards.push(card);
            database.ref(`${this._path}/cards/${card}`).set(count);
        });
        return newCards;
    }

    async tengui() {
        return this._cards;
    }

    async falti() {
        const collectionData = await Collection.get(this._collection);
        const cards = await this._cards;
        const falti = [];
        for (let i = 1; i <= collectionData.getNumCards(); i++) {
            if (!cards[i]) falti.push(i);
        }
        return falti;
    }

    async repes() {
        const repes = {};
        for (const card in this._cards) {
            if (this._cards[card] > 1) {
                repes[card] = this._cards[card];
            }
        }
        return repes;
    }
}

module.exports = {
    Album,
};
