# Nestor Nichols Bot

Tutorial from Roman Akhromieiev [here](https://medium.com/firebase-developers/building-a-telegram-bot-with-firebase-cloud-functions-and-telegraf-js-5e5323068894)
Tutorial from Kai Kok Chew [here](https://medium.com/@kaikok/telegram-bot-with-cloud-function-and-firestore-14cc2ec0bfc6)

## Deploy

```sh
firebase deploy --only functions
```

## Set webhook

```sh
curl --location --request POST 'https://api.telegram.org/bot<BOT-TOKEN>/setWebhook?url=<GCLOUD-FUNCTION-URL>' --header 'Accept: application/json'
```
