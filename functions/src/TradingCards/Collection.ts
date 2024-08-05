import { v4 as uuidv4 } from 'uuid';
import { database } from '../../config/database';

export class Collection {
    _uid: any;
    _name: any;
    _numCards: any;
    _author: any;

    constructor(uid: any, name: any, numCards: any, author: any) {
        this._uid = uid;
        this._name = name;
        this._numCards = numCards;
        this._author = author;
    }

    static create(name: any, numCards: number, author: any) {
        return database.ref(`collections/${name}`).set({
            uid: uuidv4(),
            name: name,
            numCards: numCards,
            author: author,
        });
    }

    static get(name: string) {
        const result = new Promise((resolve, reject) => {
            database
                .ref(`collections/${name}`)
                .once('value', (snap) => {
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
                .catch((err) => {
                    reject(err);
                });
        });
        return result;
    }

    static getAll() {
        const result = new Promise((resolve, reject) => {
            database
                .ref('collections')
                .once('value', (snap) => {
                    const data = snap.val();
                    const result = Object.values(data).map(
                        (collection: any) => {
                            return new this(
                                collection.uid,
                                collection.name,
                                collection.numCards,
                                collection.author
                            );
                        }
                    );
                    resolve(result);
                })
                .catch((err) => {
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
