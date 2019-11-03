const urlRegExpression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
const urlRegExp = new RegExp(urlRegExpression);
const hashRegExpression = /(^|\B)#(?![0-9_]+\b)([a-zA-Z0-9_]{1,30})(\b|\r)/gi;
const hashRegExp = new RegExp(hashRegExpression);
const imageRegExpression = /(pic.twitter|instagram)\.com/ig;
const imageRegExp = new RegExp(imageRegExpression);

module.exports={
  imageRegExp, hashRegExp, urlRegExp
}