const {v4: uuid} = require('uuid');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
  const body = await ctx.request.body;
  const token = uuid();
  const userExists = await User.findOne({email: body.email});
  if (userExists) {
    ctx.status = 400;
    ctx.body = {errors: {email: 'Такой email уже существует'}};
    return;
  }
  const user = await User.create({
    email: body.email,
    displayName: body.displayName,
    verificationToken: token,
  });
  await user.setPassword(body.password);
  await user.save();
  await sendMail({
    template: `confirmation`,
    locals: {token},
    to: body.email,
    subject: 'Подтвердите почту',
  });

  ctx.status = 200;
  ctx.body = {status: 'ok'};
};

module.exports.confirm = async (ctx, next) => {
  const body = await ctx.request.body;
  const user = await User.findOneAndUpdate({verificationToken: body.verificationToken},
      {verificationToken: undefined});
  if (!user) {
    ctx.status = 400;
    ctx.body = {error: 'Ссылка подтверждения недействительна или устарела'};
  } else {
    ctx.status = 200;
    ctx.body = {
      token: body.verificationToken,
    };
  }
};
