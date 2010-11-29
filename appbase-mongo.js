/* vim: set sw=2 ts=2 nocin si: */

var mongoose = require("mongoose").Mongoose,
    db = mongoose.connect('mongodb://localhost/net9-auth');

mongoose.model('App', {
  properties: ['name', 'clientid', 'secret', 'desc', { 'owners' : [] }],
  indexes:    ['name', 'clientid', 'owners']
});
var App = db.model('App');

exports.getAllByUser = function (username, callback) {
  App.find({ owners: username }).all(function (arr) {
    callback(true, arr.map(function (app) { return app.toObject(); }));
  });
};

exports.checkByName = function (appname, callback) {
  App.count({ name: appname }, function (count) {
    callback(count !== 0);
  });
};

exports.create = function (appinfo, callback) {
  var newApp = new App(appinfo);
  newApp.save(function (err) {
    if (err) callback(false, err);
    else callback(true, newApp.toObject());
  });
};

exports.getByID = function (clientid, callback) {
  App.find({ clientid: clientid }).one(function (app) {
    if (app === null) callback(false, 'app-not-found');
    else callback(true, app.toObject());
  });
};

exports.deleteByID = function (clientid, callback) {
  App.remove({ clientid: clientid }, function () {
    callback(true);
  });
};

exports.authenticate = function (clientid, secret, callback) {
  App.find({ clientid: clientid }).one(function (app) {
    if (app === null) callback(false, 'no-such-app-clientid');
    else if (app.secret !== secret) callback(false, 'wrong-secret');
    else callback(true, app.toObject());
  });
};

exports.update = function (appinfo, callback) {
  App.find({ clientid: appinfo.clientid}).one(function (app) {
    app.merge(appinfo).save(function (err) {
      if (err) callback(false, err);
      else callback(true, app.toObject());
    });
  });
};

