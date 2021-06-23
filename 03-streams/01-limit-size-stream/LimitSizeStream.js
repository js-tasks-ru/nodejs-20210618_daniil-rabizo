const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit;
    this.currentLength = 0;
  }

  _transform(chunk, encoding, done) {
    const length = Buffer.from(chunk, encoding).length;
    if (this.currentLength + length > this.limit) {
      return this.emit('error', new LimitExceededError());
    }
    this.currentLength += length;
    done(null, chunk);
  }
}

module.exports = LimitSizeStream;
