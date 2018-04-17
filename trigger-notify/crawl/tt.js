const trigger = require('./trigger');

const EVENT_TYPE = 'DryRun';
const body = {
    'keyword': 'Build & Test', // Food Name
    'startYear': '2018'
  }

trigger.invokeLambdaFunction(body, EVENT_TYPE).then((res) => {
    console.log('res is', res);
});