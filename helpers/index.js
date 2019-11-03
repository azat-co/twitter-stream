module.exports.containsEmoji = (text) => {
  const emojiData = require('emoji-data');
  const emojis = emojiData.scan(text);
  return emojis;
}

module.exports.containsUrls = (text, urlRegExp) => {
  const urls = text.match(urlRegExp) || [];
  return urls;
}
module.exports.getHashtags = (text, hashRegExp) => {
  const hashtag = text.match(hashRegExp) || [];
  return hashtag;
}

const emojiData = require('emoji-data');

module.exports.logger = (data) => {

  console.log('Total stream tweet count:', data.tweetCount);
  const timeNow = Date.now();
  const tweetPerSecond = data.tweetCount / ((timeNow - data.timeStart) / 1000);
  console.log('Avg per second:', (tweetPerSecond).toFixed(2));
  console.log('Avg per minute:', (60 * tweetPerSecond).toFixed(2));
  console.log('Avg per hour:', (60 * 60 * tweetPerSecond).toFixed(2));
  console.log('Tweets that contain a URL: %s%', ((data.urlCount / data.tweetCount) * 100).toFixed(2));
  console.log('Expanded/unshortened URLs: %s', data.expandedUrlCount);
  console.log('Tweets that contain link to pic or instagram: %s%',
    ((data.imageCount / data.tweetCount) * 100).toFixed(2));
  console.log('Tweets that contain an emoji: %s%', ((data.emojiCount / data.tweetCount) * 100).toFixed(2));
  // console.log(emojiFrequencyHash)
  console.log('Top emojis', Object.keys(data.emojiFrequencyHash)
    .sort((a, b) => (data.emojiFrequencyHash[a] < data.emojiFrequencyHash[b]) ? 1 : -1)
    .slice(0, 10)
    .map((emojiUni) => emojiData.from_unified(emojiUni).render()));
  const hashtags = Object.keys(data.hashtagFrequencyHash);
  console.log('Top hashtags (out of %s)', hashtags.length,
    hashtags
      .sort((a, b) => (data.hashtagFrequencyHash[a] < data.hashtagFrequencyHash[b]) ? 1 : -1)
      .slice(0, 10));
  return true;
}