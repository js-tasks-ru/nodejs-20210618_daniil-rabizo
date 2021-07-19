function responceUnathorizedError(ctx, errorMessage) {
  ctx.status = 401;
  ctx.body = {error: errorMessage};
}


async function mustBeAuthenticated(ctx, next) {
  if (!ctx.request.originalUrl.includes('/api')) {
    return next();
  }
  const authorizationHeader = ctx.request.get('Authorization');
  if (!authorizationHeader) {
    return responceUnathorizedError(ctx, 'Пользователь не залогинен');
  }
  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    return responceUnathorizedError(ctx, 'Неверный аутентификационный токен');
  }
  await next();
}

module.exports = {
  mustBeAuthenticated,
  responceUnathorizedError,
};
