var express = require('express');
var router = express.Router();

var index = require('./index');
router.use('/', index);

var api = require('./api');
router.use('/api/v1/', api);


module.exports = router;