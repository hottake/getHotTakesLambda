'use strict';
if(process.env.NODE_ENV === 'dev') require('dotenv').config();
let tweets = require('./twitterPolling');



console.log('Loading function');

exports.handler = (event, context, callback) => {
    //TODO figure out event identification to send it to the api.

    // console.log('value1 =', event.key1);
    // console.log('value2 =', event.key2);
    // console.log('value3 =', event.key3);
    tweets.getTodaysHottakes()
    //callback('Something went wrong');
};

exports.handler();