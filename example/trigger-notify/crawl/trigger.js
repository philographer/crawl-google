'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const querystring = require('querystring');

const CRAWL_CORE_FUNCTION_NAME = process.env.CRAWL_CORE_FUNCTION;
const SLACK_ACCESS_TOKEN = process.env.SLACK_ACCESS_TOKEN;

module.exports.trigger = (event, context, callback) => {
  const { text, token } = querystring.parse(event.body); // 검색할 키워드 입력 (구글에서 2008년 ~ 2018년 검색)
  const keyword = text;

  // Token Validation
  if (SLACK_ACCESS_TOKEN != token) {
    callback(null, 'Access Token is Invalid');
  }

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
      FunctionName: CRAWL_CORE_FUNCTION_NAME, // the lambda function we are going to invoke
      InvocationType: 'Event', // 'Event' | 'RequestResponse' | 'DryRun' ref: https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html
      LogType: 'Tail',
      Payload: JSON.stringify(body),
    };

    let p = lambda.invoke(params).promise();
    promiseArr.push(p);

    startYear++;
  }

  let body = { "text": `Crawl ${keyword} Successfully executed` };
  
  // If Promise all resolved, then
  Promise.all(promiseArr).then(() => {
    callback(null, {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  });
};
