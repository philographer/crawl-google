"use strict";

const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {

  const keyword = event.keyword; // 검색할 키워드 입력 (구글에서 2008년 ~ 2018년 검색)

  // Use Lambda
  const lambda = new AWS.Lambda();
  let startYear = 2008; // Google Image Search works from 2008
  let endYear = (new Date()).getFullYear(); // current Year ex) 2018
  let promiseArr = [];

  for (let i = 0; i < endYear-startYear + 1; i++) { // currently 2008 ~ 2018
    const body = {
      'keyword': keyword,
      'startYear': startYear + ''
    }

    let params = {
      FunctionName: 'crawl-google', // the lambda function we are going to invoke
      InvocationType: 'Event', // 'Event' | 'RequestResponse' | 'DryRun' ref: https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html
      LogType: 'Tail',
      Payload: JSON.stringify(body),
    };

    let p = lambda.invoke(params).promise();
    promiseArr.push(p);

    startYear++;
  }

  // If Promise all resolved, then
  Promise.all(promiseArr).then(() => {
    callback(null, 'Crawl Lambda Success');
  });
};