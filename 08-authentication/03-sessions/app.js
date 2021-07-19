const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const Session = require('./models/Session');
const {v4: uuid} = require('uuid');
const handleMongooseValidationError = require('./libs/validationErrors');
const {mustBeAuthenticated, responceUnathorizedError} = require('./libs/mustBeAuthenticated');
const {login} = require('./controllers/login');
const {oauth, oauthCallback} = require('./controllers/oauth');
const {me} = require('./controllers/me');

const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = {error: err.message};
    } else {
      console.error(err);
      ctx.status = 500;
      ctx.body = {error: 'Internal server error'};
    }
  }
});

app.use(async (ctx, next) => {
  ctx.login = async function(user) {
    const token = uuid();
    await Session.create({token, lastVisit: new Date(), user: user._id});
    return token;
  };

  await next();
});

const router = new Router({prefix: '/api'});

router.use(async (ctx, next) => {
  const header = ctx.request.get('Authorization');
  if (!header) return next();

  return next();
});

router.post('/login', login);

router.use(mustBeAuthenticated);
router.use(async (ctx, next) => {
  const authorizationHeader = ctx.request.get('Authorization');
  const token = authorizationHeader.split(' ')[1];
  let session = null;
  try {
    session = await Session.findOne({token}).populate('user').exec();
    if (!session) {
      return responceUnathorizedError(ctx, 'Неверный аутентификационный токен');
    }
    await session.updateOne({lastVisit: new Date()}).exec();
  } catch (error) {
    return responceUnathorizedError(ctx, 'Неверный аутентификационный токен');
  }
  ctx.user = {
    email: session.user.email,
    displayName: session.user.displayName,
  };
  await next();
});

router.get('/oauth/:provider', oauth);
router.post('/oauth_callback', handleMongooseValidationError, oauthCallback);

router.get('/me', me);

app.use(router.routes());

// this for HTML5 history in browser
const fs = require('fs');

const index = fs.readFileSync(path.join(__dirname, 'public/index.html'));
app.use(async (ctx) => {
  if (ctx.url.startsWith('/api') || ctx.method !== 'GET') return;

  ctx.set('content-type', 'text/html');
  ctx.body = index;
});

module.exports = app;
