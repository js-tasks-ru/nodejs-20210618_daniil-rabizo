const Message = require('../models/Message');

module.exports.messageList = async function messages(ctx, next) {
  const user = await ctx.user;
  const messages = await Message.find({chat: user.id});
  ctx.body = {
    messages: messages.map((message) => {
      return {
        date: message.date,
        text: message.text,
        id: message.id,
        user: message.user,
      };
    }),
  };
};
