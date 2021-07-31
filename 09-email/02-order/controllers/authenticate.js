const Session = require('../models/Session');

module.exports.getSession = async function getSession(ctx, next) {
  const authorizationHeader = ctx.request.get('Authorization');
  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    ctx.status = 401;
    ctx.body = 'unauthorized';
    return;
  }
  const session = await Session.findOne({token: token}).populate('user');
  if (!session) {
    ctx.status = 401;
    ctx.body = 'unauthorized';
    return;
  }
  ctx.state.user = {
    email: session.user.email,
    displayName: session.user.displayName,
    id: session.user._id,
  };
  await next();
};
