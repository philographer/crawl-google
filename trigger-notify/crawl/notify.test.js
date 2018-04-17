const notify = require('./notify');

// Test: Slack Notification Response Should return Status Code 200
test('Slack Notification Should Success', () => {
    notify.slack_noti("Test Slack Msg").then((res) => expect(res.statusCode).toEqual(200));
});