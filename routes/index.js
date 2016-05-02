var express = require('express');
var router = express.Router();

//logging
var intel           = require('intel');
var log             = require('../libs/log')('console', intel.DEBUG);

//var sendResponse        = require('../libs/response-callback');

router.get('/',  function(req, res) {
    res.render('index',
        { title : 'Home' }
    )
});

router.get('/auth',  function(req, res) {
    res.render('auth',
        { title : 'Authorization' }
    )
});

router.get('/partials/:name', function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
});


module.exports = router;