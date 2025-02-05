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

// Routes

app.get('/', function (req, res) {
  if (req.session.userinfo) {
    // When logged in, display a dashboard of information.
    require('./appman').getAllByUser(req.session.userinfo.username, function (apps) {
      res.render('dashboard', {
        locals: {
          title: messages.get('my-dashboard'),
          userinfo: req.session.userinfo,
          apps: apps
        }
      });
    });
  } else {
    res.redirect('/login');
  };
});

app.all('/test', function (req, res) {
  res.send(util.inspect(req));
});app.all('/post',function(req,res){res.send('<form method="POST" action="/post"><div class="flash block-flash info-flash"><div class="message">Are you sure you want to authenticate the application <a href="/apps/U0M1TEIJKiBAhv0LCHFvwgpA_fk" target="_blank"><strong>._.</strong></a>? If you do, <strong>._.</strong> will have access to your personal data.</div><div class="choices"><input type="submit" name="yes" value="Yes"/><input type="submit" name="no" value="No" class="normal-button"/></div></div></form>'+util.inspect(req)+'</pre>');});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}

/* vim: set ts=2 sw=2 nocin si: */
