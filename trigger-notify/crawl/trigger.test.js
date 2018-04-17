const trigger = require('./trigger');


// Test: Dry Run Should return Status Code 204
test('invokeLambdaFunction Should Retrun 204 Code', () => {
    expect.assertions(1);
    const EVENT_TYPE = 'DryRun';
    const body = {
        'keyword': 'Build & Test', // Food Name
        'startYear': '2018'
      }
    return trigger.invokeLambdaFunction(body, EVENT_TYPE).then(res => expect(res.StatusCode).toEqual(204));
});