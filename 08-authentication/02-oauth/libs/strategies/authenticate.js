const userDb = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  if (!email) {
    return done(null, false, `Не указан email`);
  }

  let user = await userDb.findOne({email: email}).exec();
  if (!user) {
    try {
      user = await userDb.create({email, displayName});
    } catch (dbError) {
      return done(dbError, false, 'Невалидный email');
    }
  }

  done(null, user, null);
};
