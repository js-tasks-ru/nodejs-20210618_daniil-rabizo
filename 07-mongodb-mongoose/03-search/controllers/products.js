const productDb = require('../models/Product');

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


module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const searchText = ctx.request.query.query;
  const productsDb = await productDb.find({$text: {$search: searchText}}).exec();
  ctx.body = {products: productsDb ? productsDb.map(_mapDbProductToProductDTO) : []};
};
