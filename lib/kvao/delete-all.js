'use strict';

var assert = require('assert');
var async = require('async');
var asyncIterators = require('async-iterators');
var utils = require('../utils');

/**
 * Delete all keys (and values) associated to the current model.
 *
 * @options {Object} options Unused ATM, placeholder for future options.
 * @callback {Function} callback
 * @param {Error} err Error object.
 * @promise
 *
 * @header KVAO.prototype.deleteAll([options, ]cb)
 */
module.exports = function deleteAll(options, callback) {
  if (callback == undefined && typeof options === 'function') {
    callback = options;
    options = {};
  } else if (!options) {
    options = {};
  }

  assert(typeof options === 'object', 'options must be an object');

  callback = callback || utils.createPromiseCallback();

  var connector = this.getConnector();
  var self = this;
  if (typeof connector.deleteAll === 'function') {
    connector.deleteAll(this.modelName, options, callback);
  } else if (typeof connector.delete === 'function') {
    console.warn('falling back to unoptimized `deleteAll`');
    let it = connector.iterateKeys(this.modelName, {});
    asyncIterators.toArray(it, function(err, keys) {
      if (err) return callback(err);
      async.each(keys, function(key, cb) {
        connector.delete(self.modelName, key, {}, cb);
      }, callback);
    });
  } else {
    console.warn('connector does not support `deleteAll`');
    process.nextTick(callback);
  }
  return callback.promise;
};
