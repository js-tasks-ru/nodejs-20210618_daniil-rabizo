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

  const handleInternalServerError = (res) => {
    res.statusCode = 500;
    res.end('internal server error');
  };

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
      req.on('error', () => {
        fs.rmSync(filepath);
        handleInternalServerError(res);
      }).pipe(limitSizeStream).on('error', (err) => {
        if (err instanceof LimitExceededError) {
          res.statusCode = 413;
          res.end('file is too big');
        } else {
          handleInternalServerError(res);
        }
        fs.rmSync(filepath);
      }).pipe(fileWriteStream).on('error', () => {
        fs.rmSync(filepath);
        handleInternalServerError(res);
      }).on('finish', () => {
        res.statusCode = 201;
        res.end('ok');
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
