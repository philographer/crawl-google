'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const FUNCTION_NAME = process.env.SERVICE_NAME + '-' + process.env.STAGE + '-' + process.env.TRIGGER_FUNCTION;
const SLACK_ACCESS_TOKEN = process.env.SLACK_ACCESS_TOKEN;

module.exports.trigger = (event, context, callback) => {
  const GOT_ACCESS_TOKEN = event.token;
  if (SLACK_ACCESS_TOKEN != GOT_ACCESS_TOKEN) {
    callback(null, 'Access Token is Invalid');
    return;
  }

  const keyword = event.text; // 검색할 키워드 입력 (구글에서 2008년 ~ 2018년 검색)

  // Use Lambda
  const lambda = new AWS.Lambda();
  let startYear = 2008; // Google Image Search works from 2008
  let endYear = (new Date()).getFullYear(); // current Year ex) 2018
  let promiseArr = [];
  let howManyRun = endYear-startYear + 1

  for (let i = 0; i < howManyRun; i++) { // currently 2008 ~ 2018
    const body = {
      'keyword': keyword,
      'startYear': startYear + ''
    }

    let params = {
      FunctionName: 'crawl-google-dev-crawlGoogle', // the lambda function we are going to invoke
      InvocationType: 'Event', // 'Event' | 'RequestResponse' | 'DryRun' ref: https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html
      LogType: 'Tail',
      Payload: JSON.stringify(body),
    };

    let p = lambda.invoke(params).promise();
    promiseArr.push(p);

    startYear++;
  }

  const response = {
    statusCode: 200,
    body: { "msg": "Crawl Lambda Successfully executed" },
  }

  // If Promise all resolved, then
  Promise.all(promiseArr).then(() => {
    callback(null, response);
  });
  /*
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  const startYear = data.startYear;
  const keyword = data.keyword;

  
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      startYear: startYear,
      keyword: keyword,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  // write the todo to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the todo item.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
  */
};
