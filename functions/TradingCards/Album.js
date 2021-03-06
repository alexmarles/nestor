const { v4: uuidv4 } = require('uuid');
const { database } = require('../../config/database');

const { Collection } = require('./Collection');

class Album {
    constructor(collectionName, username, cards) {
        this._collection = collectionName;
        this._username = username;
        this._cards = cards;
    }

    static create(collectionName, username) {
        console.log('[ALBUM/CREATE – Creating Album');
        return database.ref(`albums/${collectionName}/${username}`).set({
            uid: uuidv4(),
        });
    }

    static get(collectionName, username) {
        console.log('[ALBUM/GET] – Retrieving Album');
        const result = new Promise((resolve, reject) => {
            database
                .ref(`albums/${collectionName}`)
                .once('value', snap => {
                    let found = false;
                    snap.forEach(collector => {
                        if (collector.key === username) {
                            console.log('[ALBUM/GET] – Album Retrieved');
                            found = true;
                            const cards = {};
                            collector.forEach(card => {
                                if (card.key !== 'uid')
                                    cards[parseInt(card.key)] = card.val();
                            });
                            resolve({
                                found: true,
                                album: new this(
                                    collectionName,
                                    username,
                                    cards
                                ),
                            });
                        }
                    });
                    if (!found) {
                        console.log('[ALBUM/GET] – Album Not Found');
                        resolve({ found: false, album: undefined });
                    }
                })
                .catch(err => {
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
            database
                .ref(`albums/${this._collection}/${this._username}/${card}`)
                .set(count);
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
