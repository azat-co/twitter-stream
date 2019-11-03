const twit = require('twit');
const worker = require('worker_threads');
const workerpool = require('workerpool');
const pool = workerpool.pool();
const clear = require('clear');

// ADD YOUR key, secret, token and token secret from https://developer.twitter.com/en/apps
const twitterConfig=require('./keys.json');
twitterConfig.timeout_ms=60 * 1000; // optional HTTP request timeout to apply to all requests.
const twitInstance = new twit(twitterConfig);

const emojiFrequencyHash = {};
const hashtagFrequencyHash = {};
let tweetCount = 0;
let imageCount = 0;

let urlCount = 0;
let emojiCount = 0;
const d1 = Date.now();
const stream = twitInstance.stream('statuses/sample', { language: 'en' })
const emojiData = require('emoji-data');
const emojiHash = require('./emoji-hash.json');

const containsEmoji = (text) => {
  const emojiData = require('emoji-data');
  const emojis = emojiData.scan(text);
  return emojis;
}

const urlRegExpression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
const urlRegExp = new RegExp(urlRegExpression);
const hashRegExpression = /(^|\B)#(?![0-9_]+\b)([a-zA-Z0-9_]{1,30})(\b|\r)/gi;
const hashRegExp = new RegExp(hashRegExpression);
const imageRegExpression = /(pic.twitter|instagram)\.com/ig;
const imageRegExp = new RegExp(imageRegExpression);

const containsUrls = (text, urlRegExp) => {
  const urls = text.match(urlRegExp) || [];
  return urls;
}
const getHashtags = (text, hashRegExp) => {
  const hashtag = text.match(hashRegExp) || [];
  return hashtag;
}

stream.on('tweet', (tweet) => {
  clear();
  tweetCount++;
  console.log('Total stream tweet count:', tweetCount);
  const d2 = Date.now();
  const tweetPerSecond = tweetCount / ((d2 - d1) / 1000);
  console.log('Avg per second:', (tweetPerSecond).toFixed(2));
  console.log('Avg per minute:', (60 * tweetPerSecond).toFixed(2));
  console.log('Avg per hour:', (60 * 60 * tweetPerSecond).toFixed(2));
  console.log('Tweets that contain a URL: %s%', ((urlCount / tweetCount) * 100).toFixed(2));
  console.log('Tweets that contain link to pic or instagram: %s%', ((imageCount / tweetCount) * 100).toFixed(2));
  console.log('Tweets that contain an emoji: %s%', ((emojiCount / tweetCount) * 100).toFixed(2));
  // console.log(emojiFrequencyHash)
  console.log('Top emojis', Object.keys(emojiFrequencyHash)
    .sort((a, b) => (emojiFrequencyHash[a] < emojiFrequencyHash[b]) ? 1 : -1)
    .slice(0, 10)
    .map((emojiUni) => emojiData.from_unified(emojiUni).render()));
  console.log('Top hashtags', Object.keys(hashtagFrequencyHash)
    .sort((a, b) => (hashtagFrequencyHash[a] < hashtagFrequencyHash[b]) ? 1 : -1)
    .slice(0, 10));

  console.log(`


**** STREAM *****`);
  console.log('Text:', tweet.text);

  // Counting URLs
  const urls = containsUrls(tweet.text, urlRegExp);
  if (urls.length > 0) urlCount++;
  console.log(`
URLs:`);
  // Counting images
  for (let url of urls) {
    if (url.match(imageRegExp)) {
      imageCount++;
    } else {
      pool.exec((link)=>{
        const uu = require('url-unshort')()
        return uu.expand(link);
      }, ['http://' + url])
        .then(expandedUrl => {
          if (expandedUrl) {
            console.log('Short to expanded/original URL: ', url, ' => ', expandedUrl);
          }
          if (expandedUrl && expandedUrl.match(imageRegExp)) {
            imageCount++;
          }
        })
        .catch(err => console.log(err));
    }
  }

  // Counting hashtags
pool.exec(getHashtags, [tweet.text, hashRegExp])
.then((hashtags) => {
  for (let hashtag of hashtags) {
    if (hashtagFrequencyHash[hashtag]) {
      hashtagFrequencyHash[hashtag] += 1;
    } else {
      hashtagFrequencyHash[hashtag] = 1;
    }
  }
})
.catch((err) => {
  console.error(err);
})
  // Counting emojis
  pool.exec(containsEmoji, [tweet.text])
    .then((emojis) => {
      for (let emoji of emojis) {
        if (emojiFrequencyHash[emoji.unified]) {
          emojiFrequencyHash[emoji.unified] += 1;
        } else {
          emojiFrequencyHash[emoji.unified] = 1;
        }
      }
      if (emojis.length > 0) {
        return true;
      }
      else { // the emoji-data module misses some emojis so we go thru the list from emoji-data
        for (let char of tweet.text) {
          let hexOfChar=char.charCodeAt(0).toString(16);
          if (emojiHash[hexOfChar]) {
            return true;
          }
        }
        return false;
      }
    })
    .then((result) => {
      if (result) {
        emojiCount++;
      } else {
      }

    })
    .catch((err) => {
      console.error(err);
    })
})
