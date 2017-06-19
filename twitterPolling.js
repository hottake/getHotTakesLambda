'use strict';

const Twit = require('twit');
const TweetModel = require('./tweetModel');

class twitterPolling{
  constructor()
  {
      this.t = new Twit({
        consumer_key:         process.env.consumer_key,
        consumer_secret:      process.env.consumer_secret,
        access_token:         process.env.access_token,
        access_token_secret:  process.env.access_token_secret,
        timeout_ms:           10*1000,
      })

      // set the yesterday variable
      this.yesterday = new Date();
      this.yesterday.setDate(this.yesterday.getDate() - 1); 
  }

  getTodaysHottakes()
  {
    let searchParams = {
      q: `hottake -filter:retweets  since:${this.yesterday.getYear()-this.yesterday.getMonth()-this.yesterday.getDate()}`,
      lang: 'en',
      count: 100,
      include_rts: false
    }

    return this.t.get('search/tweets', searchParams, (err, data, response) => {
      if(data.statuses.length)
      {
        let statuses = data.statuses.map( data => {
          let { created_at, id, text, user } = data;

          return {
            created_at,
            id,
            text,
            userId: user.id,
            name: user.screen_name,
            location: user.location,
            type: 'twitter',
          }
        });

        return statuses 
    }
    return [];
   )
  }
}

module.exports = new twitterPolling()