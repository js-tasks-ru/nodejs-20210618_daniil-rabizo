const url = require('url');
const http = require('http');
const path = require('path');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');
const {pipeline} = require('stream');
const server = new http.Server();
const fs = require('fs');

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (pathname.includes('/')) {
        res.statusCode = 400;
        return res.end();
      }
      if (fs.existsSync(filepath)) {
        res.statusCode = 409;
        return res.end();
      }

      const limitSizeStream = new LimitSizeStream({limit: 1000 * 1000});
      const fileWriteStream = fs.createWriteStream(filepath);
      pipeline(req, limitSizeStream, fileWriteStream,
          (err) => {
            if (!err) {
              res.statusCode = 201;
              return res.end();
            } else {
              fs.rmSync(filepath);
              if (err instanceof LimitExceededError) {
                res.statusCode = 413;
              } else {
                res.statusCode = 500;
              }
              return res.end();
            }
          });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
