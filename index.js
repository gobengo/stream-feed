'use strict';

module.exports = Feed;

var through = require('through2');
var Writable = require('stream').Writable;
var extend = require('util-extend');
var inherits = require('inherits');
var More = require('stream-more');
var noBufferOpts = { highWaterMark: 0, lowWaterMark: 0, objectMode: true };
var Collection = require('ampersand-collection');

/**
 * A Feed of things (henceforth 'items').
 * It's a Readable. And will read out any additions to the feed
 *   (whether by real-time updates or fetching of 'more')
 * You can request that more be added to the feed. .fetchMore() along a cursor
 */
function Feed(items) {
  var maxId = 0;
  Collection.call(this, items, {
    model: function (props) {
      props = Object.create(props);
      props.id = props.id || maxId++;
      return props;
    }
  });
  Writable.call(this, { objectMode: true });
  // pipe a model stream into here
  this.more = new More({
    objectMode: true,
    lowWaterMark: 0,
    highWaterMark: 0
  });
}
inherits(Feed, Writable);

/**
 * Feed is a Writable. It can be .write-ed to
 * @example
 * feed.write(thing, errback)
 */
extend(extend(Feed.prototype, Writable.prototype), {
  // handle writes (Writable)
  _write: function (item, encoding, done) {
    this.add(item);
    done();
  }
});

/**
 * It's a Collection
 */
Object.defineProperties(extend(extend(Feed.prototype, Collection.prototype), {
  initialize: function (items) {
    // init!
  },
  fetchMore: function (amount, errback) {
    errback = errback || function () {};
    var self = this;
    var remaining = amount;
    if ( ! remaining) {
      return errback();
    }
    // could maybe be done with a stream-slice/limit
    this.more.on('data', function waitForMore(model) {
      self.add(model);
      remaining--;
      if ( ! remaining) {
        self.more.removeListener('data', waitForMore)
        errback();
      }
    });
    this.more.setGoal(amount);
  }
}), {
  // .length reflects accurate length of Collection
  length: {
    get: function () {
      return this.models.length;
    }
  },
  // because ampersand-collection sets this convention
  isCollection: {
    value: true
  }
});

