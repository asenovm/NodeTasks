var http = require('http'),
    node_uuid = require('node-uuid'),
    _ = require('underscore'),
    chirps = [],
    users = [];

function requestHandler(req, res) {
    console.log('url is' + req.url);
    if(req.method === 'GET') {
        if (req.url === '/all_chirps') {
            retrieveAllChirps(res);
        } else if (req.url.indexOf('/my_chirps') >= 0) {
            retrieveMyChirps(req, res);
        }
    } else if(req.method === 'POST') {
        if(req.url === '/chirp') {
            createChirp(req, res);
        } else if(req.url === '/register') {
            registerUser(req, res);
        }
    } else if(req.method === 'DELETE' && req.url === '/chirp') {
        deleteChirp(req, res);
    }
}

function deleteChirp(req, res) {
    readPayload(req, function (payload) {
        var chirp = JSON.parse(payload),
            id = chirp.chirpid,
            key = chirp.key;

        var toDelete = _.find(chirps, function (chirp) {
            return chirp.id === id;
        });

        chirps = _.difference(chirps, toDelete);
    });
}

function registerUser(req, res) {
    readPayload(req, function (payload) {
        var user = JSON.parse(payload);
        user.key = createUniqueId();
        sendSuccessResponse(res);
        res.end(JSON.stringify(user));
    });
}

function createUniqueId() {
    return node_uuid.v4();
}

function readPayload(req, callback) {
    var payload = '';

    req.on('data', function (chunk) {
        payload += chunk;
    });
    
    req.on('end', function () {
        callback(payload);
    });
}

function createChirp(req, res) {
    readPayload(req, function (payload) {
        var chirp = JSON.parse(payload);
        chirp.id = createUniqueId();

        chirps.push(chirp);

        sendSuccessResponse(res);
        res.end(JSON.stringify(chirp));
    });
}

function retrieveMyChirps(req, res) {
    var key = req.url.split('?')[1].split('=')[1],
        selfChirps = _.filter(chirps, function (chirp) {
            return chirp.key === key;
        });

    sendSuccessResponse(res);
    res.end(JSON.stringify(selfChirps));
}

function retrieveAllChirps(res) {
    console.log('retrieve all chirps is called!');
    sendSuccessResponse(res);
    res.end(JSON.stringify(chirps));
}

function sendSuccessResponse(res) {
    res.writeHead(200, 'OK', {
        'Content-Type': 'application/json'
    });
}

var server = http.createServer(requestHandler);
server.listen(8080);