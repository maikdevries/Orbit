## Prerequisites

1. [DISCORD](https://discord.com/developers/)


## How to set up

```
// Copy the .env.example to .env
cp .env.example .env

// Fill the .env file

// Install the packages
npm i package.json

// Launch the bot
node src/bot.js
```
1. `DATABASE_URL` is the URL to your MongoDB database

2. `DATABASE_NAME`  is the name for the database.

3. `BASE_URL` is the url of the base `http://127.0.0.1:3001/orbit`

4. `DISCORD_ID` is the ID of your application which can be found in the general information tab in discord developer's panel

5. `DISCORD_SECRET` is the app's client secret

6. `SESSION_SECRET` is the string that we are going to use to encrypt our web app's session

7. `INVITE_URL` is the URL you use to login to the dashboard which is a separate app than your bot! (make sure it has a redirect to /orbit/auth/login and is of response_type=code (Can be found in the OAuth2 tab in the Discord Developer panel)

8. `SERVER_INVITE_URL` is the URL that you use to invite your bot to other servers (make sure it has a redirect to /orbit/auth/server and is of response_type=code

9. `TOKEN_TYPE` is the type of OAuth token, as you will be using your bot's token for this, in this case it's 99.99% of the time just the string `Bot`.

10. `TOKEN`  is your bot's token (the one that you create this dashboard for)
