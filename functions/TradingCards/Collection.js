const { v4: uuidv4 } = require('uuid');
const { database } = require('../../config/database');

class Collection {
    constructor(uid, name, numCards, author) {
        this._uid = uid;
        this._name = name;
        this._numCards = numCards;
        this._author = author;
    }

    static create(name, numCards, author) {
        return database.ref(`collections/${name}`).set({
            uid: uuidv4(),
            name: name,
            numCards: numCards,
            author: author,
        });
    }

    static get(name) {
        const result = new Promise((resolve, reject) => {
            database
                .ref(`collections/${name}`)
                .once('value', snap => {
                    const data = snap.val();
                    resolve(
                        new this(
                            data.uid,
                            data.name,
                            data.numCards,
                            data.author
                        )
                    );
                })
                .catch(err => {
                    reject(err);
                });
        });
        return result;
    }

    getUid() {
        return this._uid;
    }

    getName() {
        return this._name;
    }

    getNumCards() {
        return this._numCards;
    }

    getAuthor() {
        return this._author;
    }
}

module.exports = {
    Collection,
};
