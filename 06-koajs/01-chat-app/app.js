const path = require('path');
const Koa = require('koa');
const app = new Koa();
app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());
const Router = require('koa-router');
const router = new Router();
let clientConnections = [];

router.get('/subscribe', async (ctx, next) => {
  const promiseToResolveOnMessage = new Promise((message) => {
    clientConnections.push(message);
  });
  const message = await promiseToResolveOnMessage;
  ctx.body = message;
});

router.post('/publish', async (ctx, next) => {
  const body = await ctx.request.body;
  if (!body.message) {
    ctx.status = 400;
    ctx.body = 'message is required';
    return;
  }
  clientConnections.forEach((waitingClient) => {
    waitingClient(body.message);
  });
  clientConnections = [];
  ctx.status = 200;
});

app.use(router.routes());

module.exports = app;
