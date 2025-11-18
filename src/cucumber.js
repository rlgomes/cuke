"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.Step = exports.steps = exports.initCucumber = exports.cucumber = void 0;
var api_1 = require("@cucumber/cucumber/api");
var cucumber_1 = require("@cucumber/cucumber");
var envs_1 = require("./envs");
var world_1 = require("./step-definitions/world");
var fs_1 = require("fs");
var MemoryStream = require("memorystream");
var path_1 = require("path");
var process_1 = require("process");
var debug_1 = require("debug");
var debug = (0, debug_1["default"])('cuke');
function initCucumber() {
    (0, cucumber_1.defineParameterType)({
        name: 'arg',
        // match any character but only double quotes if escaped by backslash
        regexp: /([^"\\]*(\\.[^"\\]*)*)/,
        transformer: function (value) { return value; },
        useForSnippets: false
    });
    (0, cucumber_1.setWorldConstructor)(world_1.CukeWorld);
    (0, cucumber_1.setDefaultTimeout)(30 * 1000);
}
exports.initCucumber = initCucumber;
// @ts-expect-error: 'resolveVariablesInArgs' is declared but its value is never read. [Error]
// eslint-disable-next-line
function resolveVariablesInArgs(args) {
    /// XXX need to handle the table argument types here as well
    return args.map(function (value) {
        if (value.rows !== undefined) {
            var data = value.raw();
            var rows = [];
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var row = data_1[_i];
                var newRow = [];
                for (var _a = 0, row_1 = row; _a < row_1.length; _a++) {
                    var cell = row_1[_a];
                    cell = (0, envs_1.resolveVariables)(cell);
                    newRow.push(cell);
                }
                rows.push(newRow);
            }
            return new cucumber_1.DataTable(rows);
        }
        else if (typeof value === 'string') {
            return (0, envs_1.resolveVariables)(value);
        }
        else {
            return value;
        }
    });
}
// @ts-expect-error; 'pattern' is declared but its value is never read. [Error]
function Step(pattern, options, code) {
    if (code == null && (typeof options === 'function')) {
        code = options;
        options = {};
    }
    var argsString = __spreadArray([], Array(code.length), true).map(function (_, i) { return "arg".concat(i); });
    var evalString = "\n    const { When } = require('@cucumber/cucumber')\n\n    async function wrapper(".concat(argsString.join(','), ") {\n      const resolvedVariables = resolveVariablesInArgs(Array.from(arguments))\n      await code.call(this, ...resolvedVariables)\n    }\n\n    When(pattern, options, wrapper)\n  ");
    // eslint-disable-next-line no-eval
    eval(evalString);
}
exports.Step = Step;
function cucumber(paths, options) {
    if (paths === void 0) { paths = []; }
    return __awaiter(this, void 0, void 0, function () {
        var key, cukeKey, configuration, runConfiguration, success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    debug('cucumber', paths, options);
                    process.env.OUTPUT_DIR = options.output;
                    if (!(0, fs_1.existsSync)(options.output)) {
                        (0, fs_1.mkdirSync)(options.output);
                    }
                    for (key in options) {
                        cukeKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
                        process.env["CUKE_".concat(cukeKey)] = options[key];
                    }
                    // add any --env values passed to the command line to the environment
                    options.env.forEach(function (pairs) {
                        process.env[pairs[0]] = pairs[1];
                    });
                    configuration = {
                        provided: {
                            format: [
                                "json:".concat(options.output, "/results.json"),
                                "junit:".concat(options.output, "/results.xml"),
                                "html:".concat(options.output, "/report.html"),
                                (0, path_1.join)(__dirname, 'formatters', 'console.formatter.js')
                            ],
                            backtrace: true,
                            paths: paths,
                            publish: false,
                            requireModule: ['ts-node/register'],
                            require: [
                                // load framework steps from here
                                (0, path_1.join)(__dirname, 'step-definitions/**/*.js'),
                                (0, path_1.join)(__dirname, 'step-definitions/*.js'),
                                // load custom local steps from a step-definitions directory
                                // and handle .js or .ts files
                                (0, path_1.join)((0, process_1.cwd)(), 'step-definitions/**/*.ts'),
                                (0, path_1.join)((0, process_1.cwd)(), 'step-definitions/*.ts'),
                                (0, path_1.join)((0, process_1.cwd)(), 'step-definitions/**/*.js'),
                                (0, path_1.join)((0, process_1.cwd)(), 'step-definitions/*.js')
                            ],
                            formatOptions: {
                                colorsEnabled: true,
                                theme: {
                                    'feature keyword': ['magentaBright', 'bold'],
                                    'scenario keyword': ['magentaBright', 'bold'],
                                    'step keyword': ['cyan'],
                                    'docstring content': ['green'],
                                    'docstring delimiter': ['green']
                                }
                            }
                        }
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 4, 5]);
                    return [4 /*yield*/, (0, api_1.loadConfiguration)(configuration)];
                case 2:
                    runConfiguration = (_a.sent()).runConfiguration;
                    return [4 /*yield*/, (0, api_1.runCucumber)(runConfiguration)];
                case 3:
                    success = (_a.sent()).success;
                    if (!success) {
                        throw new Error('errors running tests, see above for details');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    console.log('\nHTML report at output/report.html');
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.cucumber = cucumber;
function steps(path, options) {
    return __awaiter(this, void 0, void 0, function () {
        var configuration, runConfiguration, data, stream, success, steps, maxStepPatternLength, _i, steps_1, step;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.debug('steps', path, options);
                    configuration = {
                        provided: {
                            format: ['usage-json'],
                            backtrace: true,
                            path: path,
                            publish: false,
                            dryRun: true,
                            requireModule: ['ts-node/register'],
                            require: [
                                // load framework steps from here
                                (0, path_1.join)(__dirname, 'step-definitions/**/*.js'),
                                // load custom local steps from a step-definitions directory
                                // and handle .js or .ts files
                                (0, path_1.join)((0, process_1.cwd)(), 'step-definitions/**/*.ts'),
                                (0, path_1.join)((0, process_1.cwd)(), 'step-definitions/**/*.js')
                            ]
                        }
                    };
                    return [4 /*yield*/, (0, api_1.loadConfiguration)(configuration)];
                case 1:
                    runConfiguration = (_a.sent()).runConfiguration;
                    data = [];
                    stream = new MemoryStream();
                    stream.on('data', function (chunk) { data.push(chunk.toString()); });
                    return [4 /*yield*/, (0, api_1.runCucumber)(runConfiguration, { stdout: stream })];
                case 2:
                    success = (_a.sent()).success;
                    if (!success) {
                        throw new Error('errors running tests, see above for details');
                    }
                    steps = JSON.parse(data.join(''));
                    maxStepPatternLength = Math.max.apply(Math, steps.map(function (step) {
                        return step.pattern.length;
                    }));
                    for (_i = 0, steps_1 = steps; _i < steps_1.length; _i++) {
                        step = steps_1[_i];
                        console.log("".concat(step.pattern.padEnd(maxStepPatternLength), " # from ").concat(step.uri, ":").concat(step.line));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.steps = steps;
