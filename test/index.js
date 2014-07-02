var assert = require('chai').assert;
var sinon = require('sinon');

var Feed = require('stream-feed');
var activityMocks = require('activity-mocks');

describe('stream-feed', function () {
    it('can be constructed', function () {
        var feed = new Feed();
        assert.ok(feed);
    });
    it('can be constructed with activities', function () {
        var n = 5;
        var activities = nActivities(n);
        var feed = new Feed(activities);
        assert.ok(feed);
        assert.equal(feed.length, n);
    });
    it('can be written to', function (done) {
        var n = 5;
        var activities = nActivities(n);
        var feed = new Feed(activities);
        assert.ok(feed);
        feed.write(createActivity(), function () {
            // and length is incremented
            assert.equal(feed.length, n+1);
            done();
        });
    });
    it('.map', function () {
        var n = 5;
        var activities = nActivities(n);
        var feed = new Feed(activities);
        var getVerb = function (a) { return a.verb };
        assert.sameMembers(feed.map(getVerb), activities.map(getVerb));
    });
    // ? - Perhaps just be triggered by .read()
    // but that could get complicated
    it('.fetchMore', function (done) {
        var onAdd = sinon.spy();
        var n = 5;
        var moreActivities = nActivities(n);
        var feed = new Feed();
        feed.on('add', onAdd);
        // more exists and is a writable
        assert.ok(feed.more);
        assert.ok(feed.more.writable);
        moreActivities.forEach(function (a) {
            feed.more.write(a);
        });
        // it holds onto written stuff until asked for
        assert.equal(feed.length, 0);
        feed.fetchMore(n, function () {
            assert.equal(feed.length, n);
            assert.equal(onAdd.callCount, n);
            done();
        })
    });
});

var mocks = activityMocks.toArray();
function createActivity(id) {
    var a = activityMocks.create('livefyre.sitePostCollection');
    // var a = mocks[Math.floor(Math.random() * mocks.length)];
    a.id = id;
    return a;
}

// create an array of N activities
function nActivities(n) {
    var i = 0;
    var activities = [];
    while (i < n) {
        activities.push(createActivity(i));
        i++;
    }
    return activities;
}
