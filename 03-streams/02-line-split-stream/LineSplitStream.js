const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.chunkToSend = '';
  }

  _transform(chunk, encoding, done) {
    if (!chunk.toString().includes(os.EOL)) {
      this.chunkToSend += chunk;
      done();
    } else {
      const splittedChunk = chunk.toString().split(os.EOL);
      this.chunkToSend += splittedChunk.shift();
      this.push(this.chunkToSend);
      for (let i = 0; i < splittedChunk.length - 1; i++) {
        this.push(splittedChunk[i]);
      }
      this.chunkToSend = splittedChunk.pop();
      done(null);
    }
  }

  _flush(done) {
    if (!!this.chunkToSend) {
      this.push(this.chunkToSend);
    }
    this.chunkToSend = undefined;
    done();
  }

  clearCachedChunk() {
    this.chunkToSend = '';
  }
}

module.exports = LineSplitStream;
