const twit = require('twit');
const worker = require('worker_threads');
const workerpool = require('workerpool');
const pool = workerpool.pool();


// ADD YOUR key, secret, token and token secret from https://developer.twitter.com/en/apps
const twitterConfig = require('./keys.json');
twitterConfig.timeout_ms = 60 * 1000; // optional HTTP request timeout to apply to all requests.
const twitInstance = new twit(twitterConfig);

const emojiFrequencyHash = {};
const hashtagFrequencyHash = {};
let tweetCount = 0;
let imageCount = 0;

let urlCount = 0;
let emojiCount = 0;
const timeStart = Date.now();
let expandedUrlCount = 0;
const stream = twitInstance.stream('statuses/sample', { language: 'en' })

const emojiHash = require('./emoji-hash.json');

const { containsEmoji,
  containsUrls,
  getHashtags,
  logger
} = require('./helpers/index.js');

const {
  imageRegExp,
  hashRegExp,
  urlRegExp
} = require('./helpers/regexps.js');

const clear = require('clear');

setInterval(() => {
  clear();
  logger({
    tweetCount,
    urlCount,
    imageCount,
    emojiCount,
    expandedUrlCount,
    emojiFrequencyHash,
    hashtagFrequencyHash,
    timeStart
  })
}, 100);

stream.on('tweet', (tweet) => { // Executed on every tweet
  tweetCount++;

  // Counting URLs
  const urls = containsUrls(tweet.text, urlRegExp);
  if (urls.length > 0) urlCount++;

  // Counting images
  for (let url of urls) {
    if (url.match(imageRegExp)) {
      imageCount++;
    } else {
      pool.exec((link) => { // Unshorten/expand original URL
        const uu = require('url-unshort')()
        return uu.expand(link);
      }, ['http://' + url])
        .then(expandedUrl => {
          if (expandedUrl) {
            expandedUrlCount++;
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
          let hexOfChar = char.charCodeAt(0).toString(16);
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

}) // end of stream
