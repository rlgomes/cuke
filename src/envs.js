"use strict";
exports.__esModule = true;
exports.resolveVariables = exports.loadEnvs = exports.findVariables = void 0;
var dotenv = require("dotenv");
var path_1 = require("path");
var fs_1 = require("fs");
function loadEnvs(path) {
    if ((0, fs_1.lstatSync)(path).isDirectory()) {
        path = (0, path_1.resolve)(path);
    }
    else {
        path = (0, path_1.resolve)((0, path_1.dirname)(path));
    }
    while (path !== process.cwd()) {
        dotenv.config({ path: "".concat(path, "/.env"), debug: Boolean(process.env.DEBUG) });
        path = (0, path_1.dirname)(path);
    }
}
exports.loadEnvs = loadEnvs;
function resolveVariables(value) {
    // construct a set of "let" statements that can expose all environment
    // variables as local variables with the same name
    var envString = '';
    for (var name_1 in process.env) {
        // using the `...` quotes allows us to put values that have any
        // number of special characters including carriage returns and
        // quotes of any other kind
        envString += "let ".concat(name_1, "=process.env['").concat(name_1, "'];\n");
    }
    // eslint-disable-next-line
    return eval("(function() { ".concat(envString, "; return `").concat(value, "`})()"));
}
exports.resolveVariables = resolveVariables;
function findVariables(value) {
    var matches = value.matchAll(/\$\{([^{}]+)\}/g);
    return Array.from(matches).map(function (match) { return match[1]; });
}
exports.findVariables = findVariables;
