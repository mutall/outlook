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
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
//
//Allows methods on this page to talk to the server
var server = __importStar(require("../../../library/v/code/server.js"));
//
//Resolve the schema classes, viz.:database, columns, mutall e.t.c. 
var schema = __importStar(require("../../../library/v/code/schema.js"));
//
var io = __importStar(require("../../../school/v/code/io.js"));
// 
var scroll_js_1 = require("./scroll.js");
//
//These are pages based on a particular subject as its theme 
var theme = /** @class */ (function (_super) {
    __extends(theme, _super);
    // 
    //
    function theme(
    //
    //The database and entity name that is displayed in this 
    //theme panel.
    subject, 
    // 
    //The css for retrieving the html element where to display 
    //the theme's subject record.
    css, 
    // 
    //The view page that is the home of this panel 
    base, 
    // 
    //An optional selection of the first record 
    selection) {
        var _this = _super.call(this, css, base) || this;
        _this.subject = subject;
        _this.css = css;
        _this.base = base;
        _this.selection = selection;
        return _this;
    }
    //
    //Paint the content panel with editable records of the subject
    theme.prototype.continue_paint = function () {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, idbase, col_names, sql, max_record, pk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, server.exec(
                        //
                        //The editor class is an sql object that was originaly designed 
                        //to return rich content for driving the crud page.
                        "editor", 
                        //
                        //Constructor args of an editor class are ename and dbname 
                        //packed into a subject array in that order.
                        this.subject, 
                        //
                        //Method called to retrieve editor metadata on the editor class.
                        "describe", 
                        //
                        //There are no method parameters
                        [])];
                    case 1:
                        metadata = _a.sent();
                        idbase = metadata[0], col_names = metadata[1], sql = metadata[2], max_record = metadata[3];
                        //
                        //Set the metadata properties
                        this.sql = sql;
                        this.col_names = col_names;
                        this.max_records = parseInt(max_record);
                        //
                        //Activate the static php database.
                        this.dbase = new schema.database(idbase);
                        //
                        //Initialize the crud style for managing the hide/show feature 
                        //of columns
                        this.initialize_styles(col_names);
                        if (this.selection !== undefined)
                            pk = this.selection.pk;
                        return [4 /*yield*/, this.goto(pk)];
                    case 2:
                        _a.sent();
                        //
                        //Select the matching row and scroll it into view.
                        this.select_nth_row(pk);
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    //Return the io structure associated with the given td
    theme.prototype.get_io = function (meta) {
        //
        //Destructure the subject to get the entity name; its the 
        //first component. 
        var ename = this.subject[0];
        // 
        //Get the column name that matches this td. 
        var col_name = meta.name;
        //
        //Get the actual column from the underlying database.
        var col = this.dbase.entities[ename].columns[col_name];
        //
        //Create and return the io for this column.
        var Io = io.create_io(this, col);
        // 
        return Io;
    };
    Object.defineProperty(theme.prototype, "sql", {
        // 
        // 
        get: function () {
            if (this.sql_ !== undefined)
                return this.sql_;
            // 
            //Otherwise throw an exception this is because a getter property cannot be asynchronous 
            //hence this property was required before it was set.
            throw new schema.mutall_error("property sql cannot be obtains before the continue paint");
        },
        // 
        // 
        set: function (s) {
            this.sql_ = s;
        },
        enumerable: false,
        configurable: true
    });
    // 
    //Saves io instances that created this theme table saved as a map 
    //indexed by their position in a thematic oanel
    theme.ios = new Map();
    return theme;
}(scroll_js_1.scroll));
exports.theme = theme;
