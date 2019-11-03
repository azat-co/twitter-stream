const helpers=require('../helpers/index.js');
const regexps=require('../helpers/regexps.js');
const assert=require('assert');

// Test emoji
assert.equal(helpers.containsEmoji('Try This: Text Only in Emojis 💬😃😞💬').length, 4)
assert.equal(helpers.containsEmoji('Try This: Text Only').length, 0)

// Test URLs
assert.equal(helpers.containsUrls(`Twitter. It's what's happening.
https://twitter.com › ...
From breaking news and entertainment to sports and politics, get the full story with all the live commentary.
`, regexps.urlRegExp).length, 1)
assert.equal(helpers.containsUrls(`Twitter. It's what's happening.
From breaking news and entertainment to sports and politics, get the full story with all the live commentary.
`, regexps.urlRegExp).length, 0)

// Test hashtags
assert.equal(helpers.containsUrls(`Twitter. It's what's happening.
  #UFC244',
  '#BB13QueenRashami',
  '#BB13',
  '#beastin',
  '#iKON',
  '#iKONGUDFest2019',
  '#solfestcancun',
  '#solfest',
  '#Cancun',
  '#ASAPNatinTo'
From breaking news and entertainment to sports and politics, get the full story with all the live commentary.
`, regexps.hashRegExp).length, 10)
assert.equal(helpers.containsUrls(`Twitter. It's what's happening.
From breaking news and entertainment to sports and politics, get the full story with all the live commentary.
`, regexps.hashRegExp).length, 0)
