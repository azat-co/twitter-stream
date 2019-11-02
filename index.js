const twit = require('twit');
const worker = require('worker_threads');
const workerpool = require('workerpool');
const pool = workerpool.pool();


const twitInstance = new twit({
  consumer_key: 'CDbHmvzpaY52o8FRk5YYBegLk',
  consumer_secret: 'COnUcLoSPCiJsiVDfGGwqN0W4LTg8ad3NODau3aQ53ZQmMuABC',
  access_token: '341552391-h30rIwyKnAxTHFt86bKX5ZaFeYRzmfOF5JbaPyJC',
  access_token_secret: 'idwqMTstgYrcerrL43XwYD1EXOJMTdQxvGKHu5UUSiNU8',
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
});

const emojiFrequencyHash={};
let tweetCount = 0;
let imageCount = 0;

let urlCount = 0;
let emojiCount = 0;
const d1 = Date.now();
const stream = twitInstance.stream('statuses/sample', { language: 'en' })
const emojiData = require('emoji-data');

const {
  Worker,
  isMainThread,
  parentPort,
  workerData
} = require('worker_threads');

const containsEmoji = (text) => {
  const emojiData = require('emoji-data');
  const emojiHash=require('../../../emoji-hash.json');

  // console.log(emojiData.scan(text).length)'
  const emojis=emojiData.scan(text);
  return emojis;
}
const containsUrls = (text) => {
  const urlRegExpression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  const urlRegExp = new RegExp(urlRegExpression);
  const urls=text.match(urlRegExp) || [];
  return urls;
}


if (isMainThread) {

  stream.on('tweet', (tweet) => {
    tweetCount++;
    console.log('Total stream tweet count:', tweetCount);
    const d2 = Date.now();
    const tweetPerSecond = tweetCount / ((d2 - d1) / 1000);
    console.log('Avg per second:', (tweetPerSecond).toFixed(2));
    console.log('Avg per minute:', (60 * tweetPerSecond).toFixed(2));
    console.log('Avg per hour:', (60 * 60 * tweetPerSecond).toFixed(2));
    console.log('Tweets that contain a URL:', ((urlCount / tweetCount) * 100).toFixed(2));
    console.log('Tweets that contain link to pic or instagram:', ((imageCount / tweetCount) * 100).toFixed(2));
    console.log('Tweets that contain an emoji: %s%', ((emojiCount / tweetCount) * 100).toFixed(2));
    console.log('Top emojis', Object.keys(emojiFrequencyHash)
      .sort((a, b)=> (emojiFrequencyHash[a]>emojiFrequencyHash[b])?1:-1)
      .slice(0,10)
      .map((emojiUni)=>emojiData.from_unified(emojiUni).render()));

    pool.exec(containsUrls, [tweet.text])
    .then((urls)=>{
      if (urls.length>0) urlCount++;
      const imageRegExpression = /(pic.twitter|instagram)\.com/ig;
      const imageRegExp = new RegExp(imageRegExpression);
      let uu = require('url-unshort')();
      for (let url of urls) {
        uu.expand('http://'+url)
        .then(url => {
          if (url) console.log(`Original url is: ${url}`);
          if (url.match(imageRegExp)) {
            imageCount++;
          }
          // no shortening service or an unknown one is used
          // else console.log('This url can\'t be expanded');
        })
        .catch(err => console.log(err));
      }
      // return false;
    })
      // .then((result)=>{
      //   if (result) {
      //     imageCount++;
      //   }
      // })
      .catch((err) => {
        console.error(err);
      })
    pool.exec(containsEmoji, [tweet.text])
      .then((emojis)=>{
        for (let emoji of emojis) {
          if (emojiFrequencyHash[emoji.unified]) {
            emojiFrequencyHash[emoji.unified]+=1;
          } else {
            emojiFrequencyHash[emoji.unified]=1;
          }
        }
        if (emojis.length>0) {
          return true;
        }
        // else { // the emoji-data module misses some emojis so we go thru the list from emoji-data
        //   for (let char of text) {
        //     let hexOfChar=char.charCodeAt(0).toString(16);
        //     if (emojiHash[hexOfChar]) {
        //       return true;
        //     }
        //   }
        //   return false;
        // }
      })
      .then((result)=>{
        // console.log('contains emoji', result, tweet.text)
        if (result) {
          emojiCount++;
        } else {
        }

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
  // console.log(workerData);
  // parentPort.postMessage('hey');

}
