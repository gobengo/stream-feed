var Feed = require('stream-feed');
var mocks = require('activity-mocks').toArray();

function createActivity(id) {
    var a = Object.create(mocks[Math.floor(Math.random() * mocks.length)]);
    a.id = id || Math.random();
    return a;
}

var feed = new Feed([1,2,3,4,5].map(createActivity));

feed.toHTML = function () {
    var html = this.map(renderActivity).join('');
    return html;
};

feed.on('add', function () {
    console.log('feed length', feed.length);
    console.log('feed html is', feed.toHTML());    
});

// write straight in (add)
[1,2,3,4,5].forEach(function () {
    feed.write(createActivity());
});
// write to more
[1,2,3,4,5].forEach(function () {
    var a = createActivity();
    a.verb = 'more-posted';
    feed.more.write(a);
});

console.log('initial load. Waiting 2s to fetchMore');

setTimeout(function () {
    feed.fetchMore(5);
}, 2000);

function renderActivity(activity) {
    return "<h1>verb: {{verb}}</h1>\n".replace('{{verb}}', activity.verb);
}

