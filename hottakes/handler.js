'use strict';
if(process.env.NODE_ENV === 'dev') require('dotenv').config();

const AWS = require('aws-sdk'),
      Dynamo = new AWS.DynamoDB(),
      uuidv1 = require('uuid/v1')
module.exports.getTwitterHottakes = (event, context, callback) => {
   const Twit = require('twit');
   let t = new Twit({
    consumer_key:         process.env.consumer_key,
    consumer_secret:      process.env.consumer_secret,
    access_token:         process.env.access_token,
    access_token_secret:  process.env.access_token_secret,
    timeout_ms:           10*1000,
  }), searchParams, yesterday;
  // set the yesterday variable
  yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1); 

  searchParams = {
    q: `hottake -filter:retweets  since:${yesterday.getYear()-yesterday.getMonth()-yesterday.getDate()}`,
    lang: 'en',
    count: 25,
    include_rts: false
  }

  t.get('search/tweets', searchParams, (err, data) => {
      let batchWriteDynamo = data.statuses.map( data => {
        let { created_at, id, text, user } = data,
        uuid = uuidv1();

        return {
           PutRequest: {
             Item: {
               "uuid": {
                S: uuid
               },
               "origin_id": {
                 S: id.toString()
               }, 
               "created_at": {
                 S: created_at
               }, 
               "user_id": {
                 S: user.id.toString()
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
                 N: "0"
               },
               "ups": {
                 N: "0"
               },
               "downs": {
                 N: "0"
               }
             }
           }
        }
      }), response = {};

      Dynamo.batchWriteItem({ RequestItems: { "hottakeTable": batchWriteDynamo } }, (err, data) => {
        if(err){
          console.log(err)
          callback(new Error('[400] Bad Request', err))
        } 
        else{
          response.statusCode = 200
          response.body = { message: `Successfuly added takes to db`}
          callback(null, response)
        }
      })
  })
}

module.exports.voteUp = (event, context, callback) => {
  const uuid = event.path.id,
  params = {
    ExpressionAttributeNames: {
      "#S": "score", 
      "#U": "ups"
    },
    ExpressionAttributeValues: {
      ":a": {
        N: "1"
      }
    },
    TableName: "HottakesTable",
    Key: {
      "uuid": {
        S: uuid
      }
    },
    UpdateExpression: "ADD #S :a, #U :a"
  },
  response = {};

  Dynamo.updateItem(params, (err, data) => {
    if(err){
      callback(new Error('[400] Bad Request'))
    }
    else{
      response.statusCode = 200
      response.body = { message: `Successfuly upvoted item ${uuid}`}
      callback(null, response)
    }
  })
};

module.exports.voteDown = (event, context, callback) => {
  const uuid = event.path.id,
  params = {
    ExpressionAttributeNames: {
      "#S": "score", 
      "#D": "downs"
    },
    ExpressionAttributeValues: {
      ":m": {
        N: "-1"
      }
    },
    TableName: "HottakesTable",
    Key: {
      "uuid": {
        S: uuid
      }
    },
    UpdateExpression: "ADD #S :m, #D :m"
  },
  response = {};

  Dynamo.updateItem(params, (err, data) => {
    if(err){
      callback(new Error('[400] Bad Request'))
    }
    else{
      response.statusCode = 200
      response.body = { message: `Successfuly downvoted item ${uuid}`}
      callback(null, response)
    }
  })
};

module.exports.deleteTake = (event, context, callback) => {};

module.exports.submitTake = (event, context, callback) => {};

module.exports.getRandomTake = (event, context, callback) => {};
