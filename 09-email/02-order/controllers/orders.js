const Order = require('../models/Order');
const sendMail = require('../libs/sendMail');
const productMapper = require('../mappers/product');

module.exports.checkout = async function checkout(ctx, next) {
  const body = await ctx.request.body;
  const user = ctx.state.user;
  const order = await Order.create({
    user: user.id,
    product: body.product,
    phone: body.phone,
    address: body.address,
  });
  try {
    await sendMail({
      template: 'order-confirmation',
      to: user.email,
      locals: {
        id: order._id,
        product: {
          title: body.product,
        },
      },
      subject: 'Заказ принят',
    });
    ctx.status = 200;
    ctx.body = {order: order._id};
  } catch (e) {
    console.error(e);
  }
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const user = ctx.state.user;
  const ordersForUser = await Order.find({user: user.id}).populate('product');
  ctx.status = 200;
  ctx.body = {
    orders: ordersForUser.map((order) => {
      return {
        ...order,
        product: productMapper(order.product),
      };
    }),
  };
};
