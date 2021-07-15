const mongoose = require('mongoose');

const validId = async (ctx, next) => {
  const productId = ctx.request.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    ctx.status = 400;
    ctx.body = 'productId is not valid';
  } else {
    await next();
  }
};

module.exports = validId;
