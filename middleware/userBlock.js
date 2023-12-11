const { User } = require('../config/model');

module.exports = async function isBlocked(req, res, next) {
  try {
    console.log('first call');
    console.log(req.body.email);
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.render('userlogin', { error: 'User not found' });
    }

    if (user.status === false) {
      return res.render('userlogin', { error: 'User is blocked' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.render('userlogin', { error: 'Internal server error' });
  }
};
