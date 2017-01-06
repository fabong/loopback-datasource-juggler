'use strict';

const bdd = require('../helpers/bdd-if');
const DataSource = require('../..').DataSource;
const helpers = require('./_helpers');
const kvMemory = require('../../lib/connectors/kv-memory');
const should = require('should');

module.exports = function(dataSourceFactory, connectorCapabilities) {
  // override injected data source factory
  let dataSourcefactory;
  function dataSourceFactory() {
    return new DataSource({connector: kvMemory});
  }
  const supportsDelete = 'delete' in dataSourceFactory().connector;

  bdd.describeIf(supportsDelete, 'deleteAll fallback', function() {
    let CacheItem;
    beforeEach(function unpackContext() {
      const excludeFromConnector = 'deleteAll';
      CacheItem = helpers.givenCacheItem(dataSourceFactory,
        excludeFromConnector);
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
