"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var sync = require("./sync");
var route_1 = require("./route");
var app = express();
sync.init()
    .then(startApplicationServer)
    .catch(function (e) {
    console.log('error occurred during startup', e);
    process.exit(1);
});
function startApplicationServer(err) {
    if (err) {
        console.log('error starting sync server:');
        throw err;
    }
    console.log('Sync initialised');
    app.use('/sync', route_1.default);
    app.get('/', function (req, res) {
        res.send('Sample application is running!');
    });
    app.listen(3000, function (err) {
        if (err)
            throw err;
        console.log('\nExample app listening on port 3000!');
        console.log('\nRun the following from a terminal to get records via sync:');
        console.log('curl http://localhost:3000/sync/messages -X POST --data \'{"fn": "syncRecords"}\' -H "content-type:application/json"\n');
    });
}
//# sourceMappingURL=server.js.map