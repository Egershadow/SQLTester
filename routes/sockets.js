var express             = require('express');
var router              = express.Router();
var config              = require('../libs/config');

//logging
var intel               = require('intel');
var log                 = require('../libs/log')('console', intel.DEBUG);


router.get('/',  function(req, res) {

    res.json({
        socket : config.get('socketAddress')
    });
});


module.exports = router;
