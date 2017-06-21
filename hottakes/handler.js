'use strict';
if(process.env.NODE_ENV === 'dev') require('dotenv').config();

const Twit = require('twit'),
      AWS = require('aws-sdk'),
      Dynamo = new AWS.DynamoDB.DocumentClient(),
      uuidv1 =require('uuid/v1');

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
      let batchWriteDynamo = data.statuses.map( data => {
        let { created_at, id, text, user } = data,
        uuid = uuidv1();

        return {
           PutRequest: {
             Item: {
               "UUID": {
                S: uuid
               },
               "origin_id": {
                 S: id
               }, 
               "created_at": {
                 S: created_at
               }, 
               "user_id": {
                 S: user.id
               },
               "name": {
                 S: user.screen_name
               },
               "text": {
                 S: text
               },
               "origin": {
                 S: 'twitter'
               },
               "score": {
                 N: 0
               },
               "ups": {
                 N: 0
               },
               "downs": {
                 N: 0
               }
             }
           }
        }
      });


      Dynamo.BatchWriteItem({ RequestItems: { "HottakesTable": batchWriteDynamo } }, (err, data) => {
        callback(err, data)
      })
    }
    callback()
  })
}

module.exports.voteUp = (event, context, callback) => {};

module.exports.voteDown = (event, context, callback) => {};

module.exports.deleteTake = (event, context, callback) => {};

module.exports.submitTake = (event, context, callback) => {};

module.exports.getRandomTake = (event, context, callback) => {};



