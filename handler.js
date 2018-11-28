'use strict';

const twitCtrl = require('./twitterController');
const messageCreator = require('./messageCreator');
const ImageAnalyser = require('./imageAnalyser');

const ctrl = new twitCtrl();

module.exports.webhookCheck = (event, context, callback) => {

  console.log('>> Challenge-Response Check event ', event);
  
  const crcToken = event.queryStringParameters.crc_token;
  ctrl.crc(crcToken, callback);
};

module.exports.webhookRegister = (event, context, callback) => {

  console.log('>> webhookRegister, event ', event);

  const env = process.env.TWITTER_ENV;
  const webhookUrl = process.env.WEBHOOK_URL

  ctrl.register(env, webhookUrl, callback);

};

module.exports.webhookUpdate = (event, context, callback) => {

  console.log('>> webhookUpdate, event ', event);

  const env = process.env.TWITTER_ENV;
  const webhookId = event.queryStringParameters.webhookId;

  ctrl.updateWebhookToken(env, webhookId, callback);

};

module.exports.webhookDelete = (event, context, callback) => {

  const env = process.env.TWITTER_ENV;
  const webhookId = event.queryStringParameters.webhookId;
  console.log('>> webhookDelete, event ', event);

  ctrl.deleteWebhook(env, webhookId, callback);
};

module.exports.webhookList = (event, context, callback) => {

  console.log('>> webhookList, event ', event);

  ctrl.listWebhooks(callback);

};

module.exports.subscribe = (event, context, callback) => {

  const env = process.env.TWITTER_ENV;
  console.log('>> subscribe, event ', event);

  ctrl.subscribe(env, callback);

};

module.exports.subscribeList = (event, context, callback) => {

  const env = process.env.TWITTER_ENV;

  ctrl.subscribeList(env, callback);

};

module.exports.webhookHandle = (event, context, callback) => {

  console.log('>> webhookHandle, event: ', event);
  const eventBody = JSON.parse(event.body);
  console.log('> event body, ', eventBody);

  ctrl.handleTweet(eventBody);
};

module.exports.imageAnalysis = (event) => {
  
  event.Records.forEach((record) => {
    const filename = record.s3.object.key;
    console.log(`New object has been created: ${filename}`);
    
    const s3Config = {
      bucket: process.env.BUCKET,
      imageName: record.s3.object.key
    };
    const tweetId = filename.split('_')[0];
    const username = filename.split('_')[1];

    return ImageAnalyser
      .getImageLabels(s3Config)
      .then(labels => messageCreator.createResponseMessage(labels))
      .then(message => {
        ctrl.reply(tweetId, username, message);
        ctrl.cleanup(tweetId, username);
      }).catch((error) => {
        console.log('Error while processing image');
        console.error(error);
      });
    
  });
};