const twit = require('twit');
const worker = require('worker_threads');
const workerpool = require('workerpool');
const pool = workerpool.pool();
const emojiHash=require('./emoji-hash.js');

const twitInstance = new twit({
  consumer_key: 'CDbHmvzpaY52o8FRk5YYBegLk',
  consumer_secret: 'COnUcLoSPCiJsiVDfGGwqN0W4LTg8ad3NODau3aQ53ZQmMuABC',
  access_token: '341552391-h30rIwyKnAxTHFt86bKX5ZaFeYRzmfOF5JbaPyJC',
  access_token_secret: 'idwqMTstgYrcerrL43XwYD1EXOJMTdQxvGKHu5UUSiNU8',
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
});

let tweetCount = 0;
let urlCount = 0;
const d1 = Date.now();
const stream = twitInstance.stream('statuses/sample', { language: 'en' })

const {
  Worker,
  isMainThread,
  parentPort,
  workerData
} = require('worker_threads');
const emojiData = require('./emoji.json');

const containsEmoji = (text) => {
  for (let char of text) {
    let hexOfChar=char.charCodeAt(0).toString(16);
    if (emojiHash[hexOfChar]) {
      return true;
    }
  }
  return false;
}

const containsUrl = (text) => {
  console.log(text)
  const urlRegExpression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  const urlRegExp = new RegExp(urlRegExpression);

  if (text.match(urlRegExp)) return true;
  return false;
}

if (isMainThread) {

  stream.on('tweet', (tweet) => {
    tweetCount++;
    console.log(tweetCount);
    const d2 = Date.now();
    const tweetPerSecond = tweetCount / ((d2 - d1) / 1000);
    console.log('Avg per second:', (tweetPerSecond).toFixed(2));
    console.log('Avg per minute:', (60 * tweetPerSecond).toFixed(2));
    console.log('Avg per hour:', (60 * 60 * tweetPerSecond).toFixed(2));

    pool.exec(containsUrl, [tweet.text])
      .then((result) => {
        console.log('result', result); // outputs 7
        if (result) urlCount++;
        console.log('Percent of tweets that contain a URL:', ((urlCount / tweetCount) * 100).toFixed(2));
      })
      .exec(containsEmoji, [tweet.text])
      .then(()=>{

      })
      .catch((err) => {
        console.error(err);
      })
    // .then(function() {
    //   pool.terminate(); // terminate all workers when done
    // });

    // const worker = new Worker(__filename, {
    //   workerData: 'hola'
    // });
    // worker.on('message', (message) => {
    //   console.log(message)
    // });
    // worker.on('error', (error) => {
    //   console.error(error);
    //   process.exit(1);
    // });
    // worker.on('exit', (code) => {
    //   if (code !== 0) {
    //     console.error(`Worker stopped with exit code ${code}`);
    //     process.exit(1);
    //   }
    // });
  });
}
else {
  // const { parse } = require('some-js-parsing-library');
  // const script = workerData;
  // parentPort.postMessage(parse(script));
  console.log(workerData);
  parentPort.postMessage('hey');

}
