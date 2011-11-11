#!/usr/bin/env node

/**
 * Module dependencies.
 */

var express = require('express'),
    util = require('util'),
    messages = require('./messages/getter');
var app = module.exports = express.createServer();

// Configuration

app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'joe-king-pilot-for-hire' }));
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.router(require('./approuter')));
  app.use(express.router(require('./user/router')));
  app.use(express.router(require('./apirouter')));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.logger());
  app.all('/debug', function (req, res) {
    res.send(util.inspect(req));
  });
});

app.configure('production', function () {
  app.use(express.errorHandler()); 
});

// Helper functions for view rendering
app.helpers({
  msg: messages.get.bind(messages),
  pageTitle: function (title) {
    if (title) {
      return messages.get('page-title', title);
    } else {
      return messages.get('index-page-title');
    }
  },
  inspect: function (obj) {
    return util.inspect(obj);
  },
});

app.dynamicHelpers({
  session: function (req, res){
    return req.session;
  },
  flashArray: function (req, res) {
    // Turn this:
    //   { 'info': ['info1', 'info2'], 'error': ['error1'] }
    // into this:
    //   [ { type: 'info', message: 'info1' }
    //   , { type: 'info', message: 'info2' }
    //   , { type: 'error', message: 'error1' }]
    // for ease with view partials rendering.
    var flash = req.flash();
    var flashes = [];
    for (var key in flash) {
      flash[key].forEach(function (msg) {
        flashes.push({ type: key, message: msg });
      });
    }
    return flashes;
  },
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
