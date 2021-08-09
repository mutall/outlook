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
        while (_) try {
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
exports.__esModule = true;
exports.inner_working = void 0;
//Get the schema and capture library for saving purpose.
//
//just after a user has logged in..do this,
//check dbase:get fed in user
//refence db
var schema_1 = require("../../../schema/schema");
//Define the output type. i.e., the record to save
//const output = Array<string>;
var inner_working = /** @class */ (function () {
    //
    function inner_working() {
        //
    }
    //Take us to the home page
    inner_working.prototype.cancel = function (current_history) {
        //
        //Get the home history length from the session storage.
        var hl = parseInt(sessionStorage['home_length']);
        //
        //Calculte the backward change to the home postion, i.e, delta.
        var delta = hl - current_history;
        //
        //Home is delta steps away (backwards).
        history.go(delta);
    };
    //Update the storage with the given milk item. Each item is an array with the 
    //following components. [dbase, ename, cname, value]
    inner_working.prototype.update_storage = function (item) {
        //
        //Retrieve the milk from session storage
        var milk_str = sessionStorage['milk'];
        //
        //Unstringify the milk
        var milk = JSON.parse(milk_str);
        //
        //Add the item into the milk.
        milk.push(item);
        //
        //Change the milk back to json
        var milk_str2 = JSON.stringify(milk);
        //
        //Update the storage
        sessionStorage['milk'] = milk_str2;
    };
    inner_working.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var classname, method, record_to_save, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        classname = '\\capture\\record';
                        method = 'export';
                        record_to_save = { milk: Array, format: 'label' };
                        return [4 /*yield*/, schema_1.mutall.fetch(classname, method, record_to_save)];
                    case 1:
                        result = _a.sent();
                        //
                        //
                        return [2 /*return*/, result];
                }
            });
        });
    };
    inner_working.prototype.check_dbase = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var user_input, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user_input = { email: email };
                        return [4 /*yield*/, fetch('http://localhost/chama/v/login/login.php', {
                                method: 'POST',
                                //header: {'Content-Type': 'application/json'},
                                body: JSON.stringify(user_input)
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return inner_working;
}());
exports.inner_working = inner_working;
