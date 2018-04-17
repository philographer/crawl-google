"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk"); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const request = require("request");

// Const Variables
const CRAWAL_START_YEAR = 2008;
const CRAWAL_END_YEAR = new Date().getFullYear();
const SLACK_TARGET =
  "https://hooks.slack.com/services/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";

module.exports.notify = (event, context, callback) => {
  // 모든 키워드 가져와서 키워드대로 분류
  let keywordObj = {};

  let params = {
    TableName: process.env.DYNAMODB_TABLE
  };

  // write the todo to the database
  dynamoDb.scan(params, (error, data) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { "Content-Type": "text/plain" },
        body: "Couldn't Scan the table"
      });
      return;
    }

    let items = data["Items"];

    // data 분류
    items.forEach(item => {
      let keyword = item.keyword; // 김치
      if (!keywordObj.hasOwnProperty(keyword)) {
        // key 없으면 만들고
        keywordObj[keyword] = [item];
      } else {
        // key 있으면 추가
        keywordObj[keyword].push(item);
      }
    });
    console.log("keywordObj is", keywordObj);

    /*
      keywordObj is { '치킨': 
      [ { years: '2010', keyword: '치킨' },
        { years: '2011', keyword: '치킨' } ] }
      */

    // Delete Item
    let removeQueryPromiseArr = Object.keys(keywordObj).map(keyword => {
      let handleArr = keywordObj[keyword];
      let handleArrLength = handleArr.length || 0;
      if (handleArrLength >= CRAWAL_END_YEAR - CRAWAL_START_YEAR + 1) {
        // currently 2008 ~ 2018 => 11 year
        // Slack to Dev Chanel
        slack_noti(keyword);

        let toDeleteItemsArr = [];
        handleArr.forEach(item => {
          let toDeleteItem = {
            DeleteRequest: {
              Key: item
            }
          };
          toDeleteItemsArr.push(toDeleteItem);
        });

        let deleteParams = {
          RequestItems: {
            [process.env.DYNAMODB_TABLE]: toDeleteItemsArr
          }
        };

        dynamoDb.batchWrite(deleteParams, function(err, data) {
          if (err) {
            console.log("Batch delete unsuccessful ...");
            console.log(err, err.stack); // an error occurred
          } else {
            console.log("Batch delete successful ...");
            console.log(data); // successful response
          }
          callback(null, "Batch delete successful ...");
        });
      }
    });
  });
};

exports.slack_noti = function(keyword) {
  let options = {
    method: "POST",
    url: SLACK_TARGET,
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json"
    },
    body: {
      text: "Image Crawl " + keyword + " Finished",
      icon_emoji: ":robot_face:"
    },
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error);
        throw new Error(error);
      }
      console.log(body);
      resolve(response);
    });
  })
}