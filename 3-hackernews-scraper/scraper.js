var request = require('request'),
    db = require('./db'),
    API_END_POINT_MAX_ITEM = 'https://hacker-news.firebaseio.com/v0/maxitem.json',
    API_END_POINT_NEW_ARTICLES = 'http://localhost:3000/newArticles',
    TIMEOUT_POLLING = 30000;

startPolling();

function startPolling() {
    fetchAndWriteArticles();
    setTimeout(startPolling, TIMEOUT_POLLING);
}

function fetchAndWriteArticles() {
    var maxItem = db.getMaxItem();
    request.get(API_END_POINT_MAX_ITEM, function (err, data, body) {
        var newMaxItem = parseInt(body, 10);
        db.setMaxItem(newMaxItem);
        if(!maxItem) {
            fetchAndWriteArticleWithId(newMaxItem);
        } else {
            for(var i = maxItem; i <= newMaxItem; ++i) {
                fetchAndWriteArticleWithId(i);
            }
        }

        if(maxItem !== newMaxItem) {
            request.post(API_END_POINT_NEW_ARTICLES);
        }
    });
}

function fetchAndWriteArticleWithId(id) {
    request.get(_getApiEndPointForArticle(id), function (err, data, body) {
        db.writeArticle(JSON.parse(body));
    });
}

function _getApiEndPointForArticle(id) {
    return 'https://hacker-news.firebaseio.com/v0/item/' + id + '.json'
}
