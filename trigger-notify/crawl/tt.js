const SLACK_TARGET =
  "https://hooks.slack.com/services/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";
const request = require('request');

let options = {
    method: "POST",
    url: SLACK_TARGET,
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/json"
    },
    body: {
      text: "Image Crawl " + "Hello" + " Finished",
      icon_emoji: ":robot_face:"
    },
    json: true
  };

  request(options, function(error, response, body) {
    if (error) {
      throw new Error(error);
    }
    console.log(response.statusCode);
  });