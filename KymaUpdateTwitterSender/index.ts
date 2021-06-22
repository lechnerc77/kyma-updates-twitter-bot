
import { AzureFunction, Context } from "@azure/functions"
const TwitterClient = require('twitter-lite')

const activityFunction: AzureFunction = async function (context: Context) {
 
  context.log.info(`Tweet will be build`)

  const tweetText = buildTweet(context)

  try {
    const client = new TwitterClient({
      consumer_key: process.env["TwitterApiKey"],
      consumer_secret: process.env["TwitterApiSecretKey"],
      access_token_key: process.env["TwitterAccessToken"],
      access_token_secret: process.env["TwitterAccessTokenSecret"]
    })

    const tweet = await client.post("statuses/update", {
      status: tweetText
    })

    context.log.info(`Tweet successfully sent: ${tweetText}`)

  } catch (error) {
    context.log.error(`The call of the Twitter API caused an error: ${error}`)
  }


}

export default activityFunction

function buildTweet(context: Context): string {

  const tweetText = `📢 A new update is available for the repository ${context.bindings.updateInformation.RepositoryName} named ${context.bindings.updateInformation.Name}. 
  See details at ${context.bindings.updateInformation.HtmlUrl}. ${context.bindings.updateInformation.HashTags}`

  if (tweetText.length >= 280) {
    context.log.error("Tweet text exceeds length")
    throw new Error(`Tweet exceeds length limitation. Current length: ${tweetText.length}`)
  }
  else {
    return tweetText
  }

}