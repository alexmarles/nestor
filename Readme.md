# Nestor Nichols Bot

Tutorial from Roman Akhromieiev [here](https://medium.com/firebase-developers/building-a-telegram-bot-with-firebase-cloud-functions-and-telegraf-js-5e5323068894)
Tutorial from Kai Kok Chew [here](https://medium.com/@kaikok/telegram-bot-with-cloud-function-and-firestore-14cc2ec0bfc6)

## Commands

### Collections

| Command | Description | Example |
|---|---|---|
| `/newCollection [name] [# of cards]` | Create a new Collection | `/newCollection Animales 276` |
| `/getCollections` | List all Collections | `/getCollections` |

### Albums

| Command | Description | Example |
|---|---|---|
| `/newAlbum [collection]` | Create an Album for a Collection | `/newAlbum Animales` |
| `/newAlbum [collection] with [user]` | Create a collaborative Album | `/newAlbum Animales with JohnSmith` |

### Cards

| Command | Description | Example |
|---|---|---|
| `/addCards [collection] [list of cards]` | Add cards to an Album | `/addCards Animales 1 5 9` |
| `/deal [collection] [list of cards]` | Remove cards from an Album | `/deal Animales 3 6 7` |
| `/tengui [collection]` | Get own cards | `/tengui Animales` |
| `/falti [collection]` | Get missing cards | `/falti Animales` |
| `/repes [collection]` | Get repeated cards | `/repes Animales` |
| `/count [collection]` | Get stats for your album | `/count Animales` |

### Other

| Command | Description |
|---|---|
| `/start` | Welcome message |
| `/help` | Show available commands |
| `/health` | Bot status check |

## Deploy

```sh
firebase deploy --only functions
```

## Set webhook

```sh
curl --location --request POST 'https://api.telegram.org/bot<BOT-TOKEN>/setWebhook?url=<GCLOUD-FUNCTION-URL>' --header 'Accept: application/json'
```
