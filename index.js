'use-strict';

const restify = require('restify');
const fs = require('fs');

var port = Number(process.env.PORT) | 3000;

/**
 * Index view
 */
function index(req, res, cb) {

  fs.readFile('./index.html', 'utf8', function(err, file) {
    if (err) {
      res.send(500);
      return cb();
    }

    res.write(
      file
      .replace(
        /{{host}}/g,
        (req.isSecure()) ? 'https' : 'http' + '://' + req.headers.host)
    );

    res.end();

    return cb();
  });
}


/**
 * Request header parser view
 */
function reqHeaderParse(req, res, cb) {

  var data = {
    ipaddress: req.connection.remoteAddress || null,
    language: req.headers['accept-language'].split(',')[0] || null,
    software: req.headers['user-agent'].replace(/(^.*?\(|\).*$)/g, '') || null
  };

  res.send(data);

  if (cb && typeof(cb) === 'function') {
    cb();
  }
}

// Initialize server
var server = restify.createServer();

// Routes
server.get('/', index);
server.get('/api/whoami', reqHeaderParse);

// Listen on available port
server
  .on('error', function(error) {
    if (error.errno === 'EADDRINUSE') {
      console.log('Port ' + port  + ' already in use, trying another port');
      port += 1;
      this.listen(port);
    } else {
      throw error;
    }
  })
  .listen(port, function() {
    console.log('Server running on port ' + port);
  });

module.exports = server;
