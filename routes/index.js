var express = require('express');
var router = express.Router();

//logging
var intel           = require('intel');
var log             = require('../libs/log')('console', intel.DEBUG);
var sendResponse    = require('../libs/response-callback');

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

router.get('/views/partials/:name', function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
});

router.get('/images/:name', function (req, res) {

    var basePath = '/Users/vadimvoytenko/Desktop/dev/University/SQLTester/public/images/';
    //reading image from storage
    require('fs').readFile(basePath + req.params.name, function(err, img) {
        if (err) {
            log.error('Image reading failed:', err);
            sendResponse(res, 500, 'Image reading failed');
        } else {
            res.writeHead(200, {'Content-Type': 'image/png' });
            res.end(img, 'binary');
        }
    });
});


module.exports = router;