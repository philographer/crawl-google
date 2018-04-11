'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.crawlGoogle = (event, context, callback) => {

  const response = {
    statusCode: 200,
    body: { "msg": "crawlGoogle Lambda Successfully executed" },
  }

  // If Promise all resolved, then
  Promise.all([]).then(() => {
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
