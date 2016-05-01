var intel = require('intel');

function getLogger(filename, warnLevel) {
    if(filename != 'console') {
        var path = 'logs/' + filename + '.log';
        intel.addHandler(new intel.handlers.File(path));
    }
    intel.setLevel(warnLevel);
    return intel;
}

module.exports = getLogger;