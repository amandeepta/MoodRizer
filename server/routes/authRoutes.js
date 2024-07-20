const router = require("express").Router();
const passport = require("passport");

router.get('/spotify', passport.authenticate('spotify', {
  scope: ['user-read-email', 'user-read-private','user-read-playback-state'
  ],
  showDialog: true
}));

router.get('/spotify/callback', passport.authenticate('spotify', {
  failureRedirect: '/',
  successRedirect: 'http://localhost:5173/main'
}));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
