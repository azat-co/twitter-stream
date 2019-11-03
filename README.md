# twitter-stream

![](./screenshot.png)

Currently support following stats:

* Total stream tweet count
* Avg per second
* Avg per minute
* Avg per hour
* Tweets that contain a URL
* Expanded/unshortened URLs
* Tweets that contain link to pic or instagram
* Tweets that contain an emoji
* Top 10 emojis
* Top 10 hashtags

For example

```
Total stream tweet count: 61
Avg per second: 10.19
Avg per minute: 611.12
Avg per hour: 36667.22
Tweets that contain a URL: 32.79%
Expanded/unshortened URLs: 21
Tweets that contain link to pic or instagram: 0.00%
Tweets that contain an emoji: 8.20%
Top 10 emojis [ '😍', '😉', '💪', '🐅', '🙌' ]
Top 10 hashtags (out of 6) [
  '#JinFacts',
  '#Westies',
  '#MayWardASAPMostRequested',
  '#Palestinian',
  '#Hongkongers',
  '#FreeHongKong'
]
```


## Installation

ADD YOUR key, secret, token and token secret from https://developer.twitter.com/en/apps, then run:

```
npm i
npm start
```

## Testing

```
npm test
```


## Notes

* It might need Node 12 or 13.
* It uses shrinkwrap to avoid the `OutgoingMessage.prototype._headers is deprecated` warning.