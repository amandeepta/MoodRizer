const { getAccessControl } = require('../controllers/getAccessControl')
const express = require('express');
const router = express.Router();


router.get('/access', getAccessControl)

module.exports = router;