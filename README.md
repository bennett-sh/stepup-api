<!-- Header -->
<div style="text-align:center" align="center">
  <h1>StepUp API</h1>
  <h3>A simple wrapper for the StepUp-Game API</h3>
  <br/>

  <img src="assets/stepup.png" width="256">
</div>

## Fetching and updating data
Sadly, the StepUp API only has a single endpoint which both updates and fetches data, so any data fetch requires a data update.

This example updates your stats & calculates your position amongst your friends and the bots.
```ts
const api = new StepUp({ ... })

const result = await api.activity({
  steps: 1500,
  calories: 120, // in kcal
  distance: 1489 // in meters
})

if(!result.success) return `Couldn't fetch data (${result.status}): ${result.error}`

const position = response.leaderbord
  .find(board => board.day === 'today')
  .data
  .sort((a, b) => a.steps - b.steps)
  .findIndex(user => user.id === stepup.me.id)

return `You're placed #${position + 1} out of ${response.leaderboard.length} today.`
```

## Poking a user
```ts
const api = new StepUp({ ... })

await api.poke({
  expression: 'taunt', // there's also 'cheer' & 'nudge'
  recipientId: '...',
  recipientType: 'google', // if you're unsure about a users type, fetch the data using the activity method. this includes user ids & types of your friends or group members
  message: 'Hello World'
}) //=> boolean: successful?
```

## Authentication
This is a simple example on how to authenticate to the API.
```ts
import { StepUp } from 'stepup-api'

const api = new StepUp({
  auth: {
    type: 'google', // this means you've used "sign in with google" to create your account
    token: 'eyJ...'
  }
}) // may throw an UnsupportedAccountTypeError (for 'facebook' or 'bot') or an InvalidLoginDataError 
```

### Google Sign-In
```ts
new StepUp({
  auth: {
    type: 'google',
    token: 'eyJ...'
  }
}) 
```

### Apple Sign-In
Because I don't have a jailbroken iOS device to grab the token, I can't test the API for Apple users but it should probably work with the following example.
```ts
new StepUp({
  auth: {
    type: 'apple',
    token: 'eyJ...'
  }
})
```

### Facebook Sign-In
Currently, I haven't tested this authentication method, however it'll probably work like so.
```ts
new StepUp({
  auth: {
    type: 'facebook',
    token: 'eyJ...'
  }
})
```

### Obtaining your token
To obtain the token, you'll need to sign in on a device where you can inspect & decrypt HTTPS traffic.

#### Android Emulator
My personal recommendation is to use the official Android Emulator to do this. During creation, make sure to select an image that is labeled as "Google APIs". An image with the type of "Google Play" will not work.

* Install the StepUp app, sign in & close it
* On your desktop machine, install HTTPToolkit and select "Android Device via ADB"
* Follow the on-device instructions & open StepUp
* In HTTPToolkit, look for a request to `stepup-api.azurewebsites.net`
* Your token is in the `usertoken` header & your account type is in the `usertype` header on the right

#### Anything using HTTPToolkit
* Setup [HTTPToolkit](https://httptoolkit.com/) on your device of choice
* Open StepUp
* In HTTPToolkit, look for a request to `stepup-api.azurewebsites.net`
* Your token is in the `usertoken` header & your account type is in the `usertype` header on the right

**Note** that this process also works with any other tool. You'll only need to find a way to inspect & decrypt HTTPS traffic.

## Disadvantages
Currently StepUp combines all API calls to update & receive data into one endpoint. This means that opening your app will usually result in the data being reset to the real values. Also, you can't fetch data without updating or knowing the previous data. Also, the status codes of the API are not realible as they seem quite arbritary. E.g. wrong user input often results in a 404 or a 500, which both are not meant for bad data.

#### This is WIP
As mentioned, I can't test this API on Apple accounts and I've so far also not tested it with Facebook accounts. Also, some fields may sometimes contain `null`-values which I don't know of.

## Todo
- [ ] Test Facebook sign in
- [ ] Test Apple sign in
- [ ] Wrap e.g. leaderboard data into classes
- [ ] Experiment with hiding users
- [ ] Explore "history" & "leaderboard" fields in `/activity/v2` body fields
