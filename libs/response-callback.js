module.exports = function(res, code, message) {

    res.statusCode = code;
    res.json({
        message: message
    })
}

