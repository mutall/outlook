"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 
//Resolve the outlook config so as to extend it. s 
var config_js_1 = __importDefault(require("../../../outlook/v/code/config.js"));
// 
//Export the extended config local to the rentize.
var config = /** @class */ (function (_super) {
    __extends(config, _super);
    function config() {
        var _this = _super.call(this) || this;
        //
        //Subject
        _this.subject = ['student', 'general_school'];
        //
        //The id of this application; if not given, we use this 
        //constructors name
        _this.id = "school";
        //
        //The window application's url; if  not provided, we use that of
        //the current window
        _this.url = "";
        //
        //Image associated with this app 
        _this.image = "";
        //
        //The full trademark name of the application
        _this.trade = "School Systems for exams and accounting";
        //
        //For advertising purposes
        _this.tagname = "";
        // 
        //Overide the application database.
        _this.app_db = "general_school";
        // 
        //The maximum number of records that can be retrieved from 
        //the server using one single fetch. Its value is used to modify 
        //the editor sql by  adding a limit clause 
        _this.limit = 30;
        return _this;
    }
    return config;
}(config_js_1.default));
exports.default = config;
