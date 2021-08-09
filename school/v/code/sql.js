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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This extends the theme to allow use a defined sql
 */
// 
//Import the theme
var scroll = __importStar(require("./scroll.js"));
var io = __importStar(require("./io.js"));
var school_js_1 = __importDefault(require("./school.js"));
var fuel = __importStar(require("./fuel.js"));
// 
// 
var tabulator = /** @class */ (function (_super) {
    __extends(tabulator, _super);
    //
    //To create a tabulator theme we need the sql the mother and the css of the elements 
    //Where this theme will place its records
    function tabulator(
    // 
    //The sql that generates the data to be displayed in this 
    //pannel
    sql_, 
    //
    //The mother view where this pannel should be attached
    base, 
    //
    //The element where the content of this sql is to be put 
    css, 
    // 
    dbname, 
    // 
    //An optional selection of the first record 
    selection) {
        var _this = _super.call(this, css, base, dbname) || this;
        _this.sql_ = sql_;
        _this.selection = selection;
        // 
        //Saves io instances that created this theme table saved as a map 
        //indexed by their position in a thematic panel.
        _this.ios = new Map();
        return _this;
    }
    Object.defineProperty(tabulator.prototype, "sql", {
        // 
        //Get the sql that was set by the constructor
        get: function () { return this.sql_; },
        enumerable: false,
        configurable: true
    });
    // 
    //Paint this market place from the first selection in a lable format.
    tabulator.prototype.continue_paint = function () {
        return __awaiter(this, void 0, void 0, function () {
            var count_sql, records, ifuel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        count_sql = "select count(1) as count from (" + this.sql + ") as su";
                        return [4 /*yield*/, school_js_1.default.current.exec("database", [this.dbname], "get_sql_data", [count_sql])];
                    case 1:
                        records = _a.sent();
                        ifuel = Object.values(records)[0];
                        this.max_records = parseInt(String(ifuel["count"]));
                        return [4 /*yield*/, this.goto()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 
    //Sets the ifuel and displays it in the required procedure 
    tabulator.prototype.show = function (Ifuel, offset) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.Fuel === null)) return [3 /*break*/, 3];
                        // 
                        this.Fuel = new fuel.fuel(Ifuel, this.sql, this, offset);
                        // 
                        //Activate the fuel 
                        return [4 /*yield*/, this.Fuel.activate()];
                    case 1:
                        // 
                        //Activate the fuel 
                        _a.sent();
                        //
                        //Paint this labels to make them visible.
                        return [4 /*yield*/, this.Fuel.paint(this.target, offset)];
                    case 2:
                        //
                        //Paint this labels to make them visible.
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.Fuel.activate(Ifuel, offset)];
                    case 4:
                        _a.sent();
                        this.Fuel.paint(this.target, offset);
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    //
    //Return the io structure associated with the given td by default these io are based on the column
    //metadata.
    tabulator.prototype.get_io = function (col) {
        //
        //A column is a checkbox if...
        if (
        //
        //... its name prefixed by 'is_'....
        col.name.startsWith('is_'))
            return new io.checkbox(this);
        //
        //Images and files are assumed  to be already saved on the 
        //remote serve.
        if (["logo", "picture", "profile", "image"]
            .find(function (cname) { return cname === col.name; }))
            return new io.file(this, "image");
        //
        //If the column name is 'description', then its a text area
        if (col.name === 'description')
            new io.textarea(this);
        //
        //Time datatypes will be returned as date.
        if (["timestamp", "date", "time"]
            .find(function (dtype) { return dtype === col.native_type; }))
            return new io.input("date", this);
        //
        //The datatypes bearing the following names should be presented as images
        // 
        //
        if (col.name === ("filename" || "file"))
            return new io.file(this, "file");
        //
        //String datatypes will be returned as normal text, otherwise as numbers.
        if (["varchar", "text"]
            .find(function (dtype) { return dtype === col.native_type; }))
            return new io.input("text", this);
        if (["float", "double", "int", "decimal", "serial", "bit", "mediumInt", "real"]
            .find(function (dtype) { return dtype === col.native_type; }))
            return new io.input("number", this);
        //
        //If the length is more than 100 characters, then assume it is a textarea
        if (col.len > 100)
            return new io.textarea(this);
        if (col.native_type.startsWith("int"))
            return new io.input("number", this);
        // 
        //The default io type is read only 
        return new io.readonly(this);
    };
    return tabulator;
}(scroll.scroll));
exports.default = tabulator;
// 
//This displays the score results as a table 
