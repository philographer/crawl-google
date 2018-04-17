const trigger = require('./trigger');


test('invokeLambdaFunction Test', () => {
    const EVENT_TYPE = 'DryRun';
    const body = {
        'keyword': 'Build & Test', // Food Name
        'startYear': '2018'
      }

    expect(trigger.invokeLambdaFunction(body, EVENT_TYPE)).toBe(3);
});