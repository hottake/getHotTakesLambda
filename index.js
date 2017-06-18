'use strict';
const Twit = require('twit');

let T = new Twit({
  consumer_key:         process.env.consumer_key,
  consumer_secret:      process.env.consumer_secret,
  access_token:         process.env.access_token,
  access_token_secret:  process.env.access_token_secret,
  timeout_ms:           10*1000,
})

console.log('Loading function');

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('value1 =', event.key1);
    console.log('value2 =', event.key2);
    console.log('value3 =', event.key3);

    /// https://dev.twitter.com/rest/reference/get/search/tweets
    searchParams = {
      q: '',
      lang: 'en',
      result_type: 'popular',
      count: 100,
    }

    callback(null, event.key1);  // Echo back the first key value
    //callback('Something went wrong');
};
