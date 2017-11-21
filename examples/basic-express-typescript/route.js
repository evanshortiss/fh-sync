"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var parsers = require("body-parser");
var cors = require("cors");
var sync = require("../../fh-sync");
var router = express.Router();
router.use(cors());
router.use(parsers.json());
router.post('/:datasetId', function (req, res, next) {
    sync.invoke(req.params.datasetId, req.body, function (err, result) {
        if (err) {
            next(err);
        }
        else {
            res.json(result);
        }
    });
});
exports.default = router;
//# sourceMappingURL=route.js.map