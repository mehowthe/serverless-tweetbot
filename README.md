# serverless-tweetbot

Tweeter bot for [#noServerNovember](https://serverless.com/blog/no-server-november-challenge/) challange.

Respond to tweets mentioning this bot -> recognizing animals on attached images

### How-to
+ [Twitter Developer Account ](https://developer.twitter.com) - create account and setup new app (follow [documentation](https://developer.twitter.com/en/docs/basics/apps)) (stage name is `dev`)
+ Setup values in `config.js`
+ setup AWS account - create S3 bucket and update `custom.bucket` name in `serverless.yaml`
+ deploy application with `serverless deploy` (assuming you have installed [serverless](https://serverless.com))
+ Make two calls to Twitter API (using API Gateway)
  * register webhook triggering `GET` request to `webhookRegister` lambda function - note down **_id_** of a created webhook 
  * subscribe to Twitter feed triggering `POST` request with param `webhookId=ID_OF_YOUR_WEBHOOK`
+ Post a tweet with image @mentioning your bot and check reply!

## Used technologies
* [Serverless](https://serverless.com) framework
* [AWS Lambda](https://aws.amazon.com/lambda/)
* [AWS S3](https://aws.amazon.com/s3/)
* [AWS Rekognition](https://aws.amazon.com/rekognition/)

## Author

* Michal Durkalec <drkr24@gmail.com>
