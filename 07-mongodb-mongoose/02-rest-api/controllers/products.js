const product = require('../models/Product');

const _mapDbProductToProductDTO = (dbProduct) => {
  return {
    id: dbProduct._id,
    title: dbProduct.title,
    images: dbProduct.images,
    category: dbProduct.category,
    subcategory: dbProduct.subcategory,
    price: dbProduct.price,
    description: dbProduct.description,
  };
};

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const dbProducts = await product.find({subcategory: ctx.request.query.subcategory}).exec();

  const result = dbProducts.length ? dbProducts.map(_mapDbProductToProductDTO) : [];

  ctx.body = {
    products: result,
  };
  await next();
};

module.exports.productList = async function productList(ctx, next) {
  const dbProducts = await product.find({subcategory: ctx.request.query.subcategory}).exec();

  const result = dbProducts.length ? dbProducts.map(_mapDbProductToProductDTO) : [];

  ctx.body = {
    products: result,
  };
  await next();
};

module.exports.productById = async function productById(ctx, next) {
  const dbProduct = await product.findById(ctx.request.params.id).exec();
  if (!dbProduct) {
    ctx.status = 404;
    ctx.body = 'product not found';
    return;
  }
  ctx.body = {
    product: _mapDbProductToProductDTO(dbProduct),
  };
  await next();
};


