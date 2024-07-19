const router = require("express").Router();
const passport = require("passport");

router.post('/spotify', passport.authenticate('spotify', {
  scope: ['user-read-email', 'user-read-private','user-read-playback-state'
  ],
  showDialog: true
}));

router.post('/spotify/callback', passport.authenticate('spotify', {
  failureRedirect: '/',
  successRedirect: '/success'
}));

router.post('/logout', (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
