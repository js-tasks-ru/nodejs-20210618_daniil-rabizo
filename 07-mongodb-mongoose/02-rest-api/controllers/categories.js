const category = require('../models/Category');
module.exports.categoryList = async function categoryList(ctx, next) {
  const dbCategories = await category.find({}).populate('subcategory').exec();
  const result = dbCategories.map((category) => {
    return {
      id: category._id,
      title: category.title,
      subcategories: category.subcategories.map((subcategory) => {
        return {
          id: subcategory._id,
          title: subcategory.title,
        };
      }),
    };
  });
  ctx.body = {
    categories: result,
  };
  await next();
};
