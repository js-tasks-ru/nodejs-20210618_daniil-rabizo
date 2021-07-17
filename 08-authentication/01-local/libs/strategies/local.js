const LocalStrategy = require('passport-local').Strategy;
const userDb = require('../../models/User');
module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    async function(email, password, done) {
      const user = await userDb.findOne({email: email}).exec();
      if (!user) {
        return done(null, false, 'Нет такого пользователя');
      }
      const isPasswordCorrect = await user.checkPassword(password);
      if (!isPasswordCorrect) {
        return done(null, false, 'Неверный пароль');
      } else {
        return done(null, user, null);
      }
    },
);
