const fs=require('fs');
const emojiHash={};
const emojiArray=require('./emoji.json');
for (let emoji of emojiArray) {
  if (emoji.unified.includes('-')) {
    // emoji.unified=emoji.unified.substring(0, emoji.unified.indexOf('-'));
  }
  emojiHash[emoji.unified]=emoji;
}
console.log(emojiHash)
fs.writeFileSync('./emoji-hash.json', JSON.stringify(emojiHash, 0, 2));