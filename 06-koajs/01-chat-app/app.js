const path = require('path');
const Koa = require('koa');
const app = new Koa();
app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());
const Router = require('koa-router');
const router = new Router();
const clientConnections = {};

router.get('/subscribe', async (ctx, next) => {
  const promiseToResolveOnMessage = new Promise((resolve) => {
    ctx.state.resolveOnMessage = resolve;
  });
  const subscriptionId = Math.random().toString();
  clientConnections[subscriptionId] = ctx;
  const message = await promiseToResolveOnMessage;
  ctx.body = message;
  delete clientConnections[subscriptionId];
});

router.post('/publish', async (ctx, next) => {
  const body = await ctx.request.body;
  if (!body.message) {
    ctx.status = 200;
    return next();
  }
  Object.values(clientConnections).forEach((clientContext) => {
    clientContext.state.resolveOnMessage(body.message);
  });
  ctx.status = 200;
});

app.use(router.routes());

module.exports = app;
