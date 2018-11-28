'use strict';
 
const Twitter = require('twitter');
const request = require('request-promise')
const config = require('./config');
const fetch = require('node-fetch');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const crypto = require('crypto');

const T = new Twitter(config);
const s3 = new AWS.S3();
const TWITTER_API_URL = 'https://api.twitter.com/1.1';
 
module.exports = class TwitterController {
    constructor() { }
    
    crc(crcToken, callback) {

        const responseToken = crypto.createHmac('sha256', config.consumer_secret).update(crcToken).digest('base64');
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                response_token: 'sha256=' + responseToken
            })
        };
        callback(null, response);
    }
    
    register(env, webhookUrl, callback) {

        T.post(`account_activity/all/${env}/webhooks.json`, {url: webhookUrl}, function(err, data, response) {
            
            if (!err) {
                console.log(">>Webhook registered, data", data);
                const result = {
                    statusCode: 200,
                    body: JSON.stringify({
                        result: data
                    }),
                 };
                callback(null, result);
            } else {
                console.log('ERROR while registering webhook');
                console.error(err);
                callback(err);
            }
        });
    }
    
    listWebhooks(callback) {

        T.get('account_activity/all/webhooks.json', function(err, data, response) {
            
            if (!err) {
                console.log('>> webhooks list result ', response);
                console.log('>> webhooks list data ', JSON.stringify(data));
                const result = {
                    statusCode: 200,
                    body: JSON.stringify({
                        webhooks: data 
                    })
                };
                callback(null, result);
            } else {
                console.log('ERROR while listing webhooks');
                console.error(err);
                callback(err);
            }
        });
    }
    
    updateWebhookToken(env, webhookId, callback) {
        
        var requestOptions = {
          url: `${TWITTER_API_URL}/account_activity/all/${env}/webhooks/${webhookId}.json`,
          oauth: config,
          resolveWithFullResponse: true
        };
        
        request.put(requestOptions).then(function (response) {
          console.log('HTTP response code:', response.statusCode)
          console.log('CRC request successful and webhook status set to valid.');
          callback(null, {
              statusCode: 200,
              message: 'Webhook token updated',
              body: JSON.stringify(response)
          });
        }).catch(function (response) {
          console.log('HTTP response code:', response.statusCode)
          console.log(response.error)
          callback(response.error);
        });
    }

    deleteWebhook(env, webhookId, callback) {
        
        var requestOptions = {
          url: `${TWITTER_API_URL}/account_activity/all/${env}/webhooks/${webhookId}.json`,
          oauth: config,
          resolveWithFullResponse: true
        };
        
        console.log('Deleting webhook:', requestOptions);
        request.del(requestOptions).then(function (response) {
          console.log('HTTP response code:', response.statusCode)
          console.log('Webhook deleted');
          callback(null, {
              statusCode: 200,
              message: 'Webhook deleted',
              body: JSON.stringify(response)
          });
        }).catch(function (response) {
          console.log('HTTP response code:', response.statusCode)
          console.log(response.error)
          callback(response.error);
        });
    }
    
    subscribe(env, callback) {

        T.post(`account_activity/all/${env}/subscriptions.json`, function(err, data, response) {
            
            if (!err) {
                console.log('>> subscription created');
                console.log('> subscription data ', JSON.stringify(data));
                const result = {
                    statusCode: 200,
                    message: 'Subscription created',
                    body: JSON.stringify({subscriptions: data })
                };
                callback(null, result);
            } else {
                console.log('ERROR while creating subscription');
                console.error(err);
                callback(err);
            }
        });
    }
    
    subscribeList(env, callback) {

        T.get(`account_activity/all/${env}/subscriptions.json`, function(err, data, response) {
            
            if (!err) {
                console.log('>> subscription fetched', response);
                console.log('>> subscription data', JSON.stringify(data));
                
                const result = {
                    statusCode: 200,
                    message: 'Subscription list result',
                    body: JSON.stringify({ subscriptions: data })
                };
                callback(null, result);
            } else {
                console.log('ERROR while listing subscription');
                console.error(err);
                callback(err);
            }
        });
    }
    
    handleTweet(tweet) {

        const tweetEvents = tweet.tweet_create_events;
        if (typeof tweetEvents === 'undefined' || tweetEvents.length < 1) {
           console.log('Not a new tweet event');
           return;
        }
        
        for (var i in tweetEvents) {

            const tweetData = tweetEvents[i];
            console.log('Processing event: ', tweetData);
            
            const media = tweetData.entities
                ? tweetData.entities.media
                : [];

            if (typeof media == 'undefined' || media.length < 1) {
                console.log('Tweet without image, skipping');
                continue;
            }

            const imageKey = `${tweetData.id_str}_${tweetData.in_reply_to_screen_name}`;

            fetch(media[0].media_url)
                .then((response) => {
                    if (response.ok) {
                        console.log('Image fetched');
                        return response;
                    }
                    return Promise.reject(new Error(
                        `Failed to fetch ${response.url}: ${response.status} ${response.statusText}`));
                    
                })
                .then(response => response.buffer())
                .then(buffer => (
                    s3.putObject({
                        Bucket: process.env.BUCKET,
                        Key: imageKey,
                        Body: buffer
                    }).promise()
                ))
                .then(result => console.log('Image saved ', result));
        }
    }
    
    cleanup(id, username) {

        const imageKey = `${id}_${username}`;
        const params = {
            Bucket: process.env.BUCKET,
            Key: imageKey,
        };

        s3.deleteObject(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(imageKey + ' deleted');
            }
        });
    }
    
    reply(tweetId, username, message) {

        const params = {
            auto_populate_reply_metadata: true,
            in_reply_to_status_id: tweetId,
            status: `@${username} - ${message}`,
        };
        
        console.log('Replying to tweet ', params);
        T.post('statuses/update', params, function(err, data, response) {
            if (err) {
                console.log('ERROR while replying to a tweet ', tweetId);
                console.error(err);
            } else {
                console.log(`Tweet comment created for id ${tweetId}`);
            }
        });
    }
 
}