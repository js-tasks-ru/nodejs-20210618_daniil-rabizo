const socketIO = require('socket.io');

const Session = require('./models/Session');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server);

  io.use(async function(socket, next) {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new Error('anonymous sessions are not allowed'));
    }
    const session = await Session.findOne({token}).populate('user');
    if (!session) {
      return next(new Error('wrong or expired session token'));
    }
    socket.session = session;
    next();
  });

  io.on('connection', function(socket) {
    socket.on('message', async (msg) => {
      const message = await Message.create({
        text: msg,
        date: new Date(),
        user: socket.session.user.displayName,
        chat: socket.session.user.id,
      });
      console.log('saved message', message);
    });
  });

  return io;
}

module.exports = socket;
