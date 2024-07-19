const {createRoom, successAuth, joinRoom, playSong} = require('../controllers/room')
router.get('/success', successAuth);
  
  router.get('/create-room', createRoom);
  
  router.get('/join-room', joinRoom)
  router.get('/play-song', playSong);
  
module.exports = router;