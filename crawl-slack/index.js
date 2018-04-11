const AWS = require("aws-sdk");
const sqs = new AWS.SQS();
const lambda = new AWS.Lambda();
const request = require("request");

// Target End-Point
const QUEUE_URL = "https://sqs.ap-northeast-2.amazonaws.com/989300825295/crawl-queue";
const SLACK_TARGET = "https://hooks.slack.com/services/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";

// Const Variables
const CRAWL_START_YEAR = 2008; 
const CRAWAL_END_YEAR = (new Date()).getFullYear;

exports.handler = (event, context, callback) => {
  const receiveParams = {
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    MessageAttributeNames: ["All"]
  };

  let MAX_RECUR = 50; // 10(SQS MaxNumberOfMessages) * 50(loop) = 500 msg, 50 page
  let keywordObj = {};
  let promiseArr = [];
  let msgArr = [];

  for (let i = 0; i < MAX_RECUR; i++) {
    let p = sqs.receiveMessage(receiveParams).promise();
    promiseArr.push(p);
  }

  Promise.all(promiseArr)
    .then(resArr => {
      resArr.forEach(res => {
        if (res.Messages && res.Messages.length > 0) {
          res.Messages.forEach(message => {
            msgArr.push(message);
          });
        }
        // Todo: Need to performance enhence for cutting cost Like break;
      });

      msgArr.forEach(msg => {
        let keyword = msg.Body; // 김치
        let receiptHandle = msg.ReceiptHandle;
        if (!keywordObj.hasOwnProperty(keyword)) {
          // key 없으면 만들고
          keywordObj[keyword] = [receiptHandle];
        } else {
          // key 있으면 추가
          keywordObj[keyword].push(receiptHandle);
        }
      });

      console.log("keywordObj is", keywordObj);

      let removeQueuePromiseArr = Object.keys(keywordObj).map(keyword => {
        let handleArr = keywordObj[keyword];
        let handleArrLength = handleArr.length || 0;
        console.log("handleArrLength is", keyword, handleArrLength);
        if (handleArrLength >= CRAWAL_END_YEAR-CRAWL_START_YEAR+1) {
          // currently 2008 ~ 2018 => 11 year
          // Slack to Dev Chanel
          slack_noti(keyword);

          // remove queue
          return handleArr.map(handle => {
            console.log("handle is", handle);
            const params = {
              QueueUrl: receiveParams.QueueUrl,
              ReceiptHandle: handle
            };
            return sqs.deleteMessage(params).promise();
          });
        }
      });

      return Promise.all(removeQueuePromiseArr);
    })
    .then(() => {
      callback(null, "success!!");
    });
};

function slack_noti(keyword) {
  var options = {
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
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });
}