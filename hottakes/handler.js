'use strict';
if(process.env.NODE_ENV === 'dev') require('dotenv').config();

const Twit = require('twit'),
      TweetModel = require('./tweetModel'),
      AWS = require('aws-sdk'),
      dynamo = new AWS.DynamoDB.DocumentClient();

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

module.exports.getTwitterHottakes = (event, context, callback) => {

   let t = new Twit({
    consumer_key:         process.env.consumer_key,
    consumer_secret:      process.env.consumer_secret,
    access_token:         process.env.access_token,
    access_token_secret:  process.env.access_token_secret,
    timeout_ms:           10*1000,
  }), searchParams, yesterday;

  // set the yesterday variable
  yesterday = new Date();
  yesterday = yesterday.setDate(yesterday.getDate() - 1); 

  searchParams = {
    q: `hottake -filter:retweets  since:${yesterday.getYear()-yesterday.getMonth()-yesterday.getDate()}`,
    lang: 'en',
    count: 100,
    include_rts: false
  }

  t.get('search/tweets', searchParams, (err, data, response) => {
    if(data.statuses.length)
    {
      let statuses = data.statuses.map( data => {
        let { created_at, id, text, user } = data;

        return {
          created_at,
          id,
          text,
          user_id: user.id,
          name: user.screen_name,
          origin: 'twitter',
        }
      });
      callback(statuses); 
    }
    callback([])
  })
}

module.exports.voteUp = (event, context, callback) => {};

module.exports.voteDown = (event, context, callback) => {};

module.exports.deleteTake = (event, context, callback) => {};

modue.exports.submitTake = (event, context, callback) => {};

modue.exports.getRandomTake = (event, context, callback) => {};



