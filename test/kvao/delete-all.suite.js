'use strict';

const bdd = require('../helpers/bdd-if');
const helpers = require('./_helpers');
const should = require('should');

module.exports = function(dataSourceFactory, connectorCapabilities) {
  var supportsDeleteAll = 'deleteAll' in dataSourceFactory().connector;

  bdd.describeIf(supportsDeleteAll, 'deleteAll', function() {
    let CacheItem;
    beforeEach(function unpackContext() {
      CacheItem = helpers.givenCacheItem(dataSourceFactory);
    });

    it('removes all key-value pairs for the given model', function() {
      return helpers.givenKeys(CacheItem, ['key1', 'key2'])
        .then(() => CacheItem.deleteAll())
        .then(() => CacheItem.keys())
        .then((keys) => {
          should(keys).eql([]);
        });
    });

    it('does not remove data from other existing models', function() {
      var AnotherModel = dataSourceFactory().createModel('AnotherModel');
      return helpers.givenKeys(CacheItem, ['key1', 'key2'])
        .then(() => helpers.givenKeys(AnotherModel, ['key3', 'key4']))
        .then(() => CacheItem.deleteAll())
        .then(() => CacheItem.keys())
        .then((keys) => {
          should(keys).eql([]);
        })
        .then(() => AnotherModel.keys())
        .then((keys) => {
          should(keys).eql(['key3', 'key4']);
        });
    });
  });
};
