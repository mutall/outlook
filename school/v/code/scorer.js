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
exports.panel = void 0;
var schema = __importStar(require("../../../library/v/code/schema"));
var io_1 = require("../../../outlook/v/code/io");
var outlook_1 = require("../../../outlook/v/code/outlook");
var create_1 = __importDefault(require("./create"));
//
//A panel is a targeted section of a view. It can be painted 
//independently
var panel = /** @class */ (function (_super) {
    __extends(panel, _super);
    //
    function panel(
    //
    //The CSS to describe the targeted element on the base page
    css, 
    //
    //The base view on that is the home of the panel
    base) {
        var _this = 
        //The ur is that of the base
        _super.call(this, base.config, base.url) || this;
        _this.css = css;
        _this.base = base;
        _this.anchor = _this.get_anchor();
        return _this;
    }
    //
    //Use this css to get the anchor element where this pannel is painted.
    panel.prototype.get_anchor = function () {
        //
        //Get the targeted element. It must be only one
        var targets = Array.from(this.document.querySelectorAll(this.css));
        //
        //There must be a target    
        if (targets.length == 0)
            throw new schema.mutall_error("No target found with CSS " + this.css);
        //
        //Multiple targets is a sign of sn error
        if (targets.length > 1)
            throw new schema.mutall_error("Multiple targets found with CSS " + this.css);
        //
        //The target must be a html element
        if (!(targets[0] instanceof HTMLElement))
            throw new schema.mutall_error("\n      The element targeted by CSS " + this.css + " must be an html element");
        //
        //Set teh html element and continue painting the panel
        return targets[0];
    };
    Object.defineProperty(panel.prototype, "win", {
        //
        //The window of a panel is the same as that of its base view, 
        //so a panel does not need to be opened
        get: function () {
            return this.base.win;
        },
        enumerable: false,
        configurable: true
    });
    return panel;
}(outlook_1.view));
exports.panel = panel;
//
//
var lister = /** @class */ (function (_super) {
    __extends(lister, _super);
    //
    // 
    function lister(css, base, udf_meta) {
        var _this = _super.call(this, css, base) || this;
        _this.udf_meta = udf_meta;
        _this.table = create_1.default(_this.anchor, 'table', {});
        // 
        //Create the thead
        create_1.default(_this.table, "thead", {});
        // 
        //Create the tbody
        create_1.default(_this.table, "tbody", {});
        return _this;
    }
    // 
    lister.prototype.paint = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, Ifuel;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, this.paint_header()];
                    case 2:
                        _a.header = _b.sent();
                        return [4 /*yield*/, this.get_fuel()];
                    case 3:
                        Ifuel = _b.sent();
                        //
                        return [4 /*yield*/, this.paint_body(Ifuel)];
                    case 4:
                        //
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    lister.prototype.paint_body = function (Ifuel) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    // 
    //Loop over all the ifuel to create barrel
    lister.prototype.for = function (, Ibarrel, of, Ifuel) {
        // 
        var body_barrel = new barrel(this);
        body_barrel.tins = [];
        // 
        for (var _i = 0, _a = this.header; _i < _a.length; _i++) {
            var htin = _a[_i];
            // 
            //Create jthe data tins 
            var Tin = new tin(Barrel);
            // 
            //The general io for an sql is read only
            Tin.Io = new io_1.readonly(Tin.anchor);
            Tin.Io.value = Ibarrel[htin.dposition];
            // 
            // 
            body_barrel.tins.push(Tin);
        }
        body_barrel.paint();
    };
    return lister;
}(panel));
// 
var scroller = /** @class */ (function (_super) {
    __extends(scroller, _super);
    // 
    //;
    function scroller(base, css, Udf_meta) {
        var _this = _super.call(this, css, base, Udf_meta) || this;
        _this.Udf_meta = Udf_meta;
        return _this;
    }
    // 
    scroller.prototype.paint_header = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, dcolumns, c_columns, Barrel, _i, c_columns_1, col, Tin;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // 
                        //At this point we need to get the sql.
                        _b = this;
                        return [4 /*yield*/, this.get_sql()];
                    case 1:
                        // 
                        //At this point we need to get the sql.
                        _b.sql = _c.sent();
                        dcolumns = this.exec("database", [this.sql.dbname], "get_sql_metadata", [this.sql.stmt]);
                        c_columns = this.udf_meta === undefined
                            ? dcolumns
                            : dcolumns.map(function (col, dposition) {
                                // 
                                //Save the column data position
                                col.dposition = dposition;
                                // 
                                //Get any metadata from the udf that matches the name of this colum
                                var udf = _this.udf_meta[col.name];
                                if (udf !== undefined) {
                                    // 
                                    //Add the user defined metadata to the column
                                    Object.assign(col, udf);
                                }
                            });
                        // 
                        //Sort the columns by order of ascending user position
                        c_columns.sort(function (a, b) {
                            var _a, _b;
                            // 
                            //If the user defined position is not provided then use the data one.
                            //Get the user defined position of a 
                            var pa = (_a = a.uposition) !== null && _a !== void 0 ? _a : a.dposition;
                            // 
                            //Get the user position of b 
                            var pb = (_b = b.uposition) !== null && _b !== void 0 ? _b : b.dposition;
                            // 
                            //Return the comparison result.
                            if (pa === pb)
                                return 0;
                            if (pa > pb)
                                return 1;
                            return -1;
                        });
                        Barrel = new barrel(this);
                        // 
                        //Step through all the columns and display each one of them
                        for (_i = 0, c_columns_1 = c_columns; _i < c_columns_1.length; _i++) {
                            col = c_columns_1[_i];
                            Tin = new tin(col.name, col.dposition, Barrel);
                            // 
                            //Ofload all column data to the tin
                            Object.assign(Tin, col);
                            // 
                            Tin.Io = new io_1.readonly(Tin.anchor);
                            Tin.Io.value = col.name;
                            (_a = Barrel.tins) === null || _a === void 0 ? void 0 : _a.push(Tin);
                        }
                        Barrel.paint();
                        return [2 /*return*/, Barrel];
                }
            });
        });
    };
    scroller.prototype.get_fuel = function () {
        return this.exec("database", [""], "get_sql_data", [this.sql]);
    };
    return scroller;
}(lister));
// 
// 
var metamod = /** @class */ (function (_super) {
    __extends(metamod, _super);
    // 
    function metamod(base, css, caller) {
        var _this = _super.call(this, css, base) || this;
        _this.caller = caller;
        return _this;
    }
    // 
    // 
    metamod.prototype.paint_header = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hbarrel;
            return __generator(this, function (_a) {
                hbarrel = new barrel(this);
                // 
                //Populatr the barrel with the ton based oon the columns names 
                hbarrel.tins = ["cname", "order", "hidden", "region", "size"]
                    .map(function (name, index) {
                    // 
                    //Create the new tin 
                    var Tin = new tin(hbarrel);
                    // 
                    //Add the name and the datapositon properties
                    Tin.name = name;
                    Tin.dposition = index;
                    Tin.uposition = index;
                    return Tin;
                });
                // 
                //Return the  promised barrel 
                return [2 /*return*/, hbarrel];
            });
        });
    };
    // 
    //Paint the  body
    metamod.prototype.paint_body = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, col_metadata, Barrel, _b, _c, htin, Tin;
            return __generator(this, function (_d) {
                // 
                //loop through the  array of colmetadata
                for (_i = 0, _a = this.caller.col_metadata; _i < _a.length; _i++) {
                    col_metadata = _a[_i];
                    Barrel = new barrel(this);
                    // 
                    //Loop through the header tins
                    for (_b = 0, _c = this.header.tins; _b < _c.length; _b++) {
                        htin = _c[_b];
                        Tin = new tin(Barrel);
                        // 
                        //Populate tin with value and io data.
                        this.populate_tin(Tin, htin, col_metadata);
                        Barrel.tins.push(Tin);
                    }
                    Barrel.paint();
                }
                return [2 /*return*/];
            });
        });
    };
    // 
    // 
    metamod.prototype.populate_tin = function (
    /*body_tin*/ Tin, 
    /*header_tin*/ htin, column_meta) {
        // 
        // 
        var anchor = Tin.anchor;
        var Udf_meta = this.udf_meta[htin.name];
        switch (htin.name) {
            case "cname":
                Tin.Io = new io_1.readonly(anchor);
                Tin.Io.value = htin.name;
                break;
            case "order":
                Tin.Io = new io_1.input("number", anchor);
                Tin.Io.value = Udf_meta.uposition === undefined ? Tin.dposition : Udf_meta.uposition;
                break;
            case "hidden":
                Tin.Io = new io_1.checkbox(anchor);
                Tin.Io.value = this.get_hidden_status();
                //Udf_meta.hidden === undefined ? false : Udf_meta.hidden;
                break;
            case "region":
                Tin.Io = new io_1.select(anchor, ["page", "verticles", "horizantals", "intersects"]);
                Tin.Io.value = Udf_meta.region === undefined ? "horizontals" : Udf_meta.region;
                break;
            case "size":
                Tin.Io = new io_1.input("number", anchor);
                Tin.Io.value = Udf_meta.size === undefined ? metadata.len : Udf_meta.size;
                break;
        }
        // 
        return Tin;
    };
    return metamod;
}(lister));
// 
// 
var tin = /** @class */ (function () {
    // 
    // 
    function tin(Barrel) {
        this.Barrel = Barrel;
        this.anchor = create_1.default(this.Barrel.get_parent().document, "td", {});
    }
    tin.prototype.paint = function () {
        this.Barrel.anchor.appendChild(this.anchor);
        this.Io.paint();
    };
    return tin;
}());
// 
var barrel = /** @class */ (function () {
    function barrel(Lister) {
        this.Lister = Lister;
        //
        //The first time we create a barrel it has an empty list of tins 
        //that are filled at a latter stage.
        this.tins = [];
        this.anchor = create_1.default(Lister.table.tBodies[0], "tr", {});
    }
    // 
    // 
    barrel.prototype.paint = function () { this.tins.forEach(function (Tin) { return Tin.paint(); }); };
    // 
    barrel.prototype.get_parent = function () { return this.Lister; };
    return barrel;
}());
// 
var scorer = /** @class */ (function (_super) {
    __extends(scorer, _super);
    // 
    // 
    function scorer(css, base) {
        var _this = this;
        var sql = 'select * from result';
        _this = _super.call(this, css, base, sql) || this;
        return _this;
    }
    scorer.prototype.create_tins = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, ifuel, xheaders;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(type === 'header')) return [3 /*break*/, 3];
                        return [4 /*yield*/, _super.prototype.create_tins.call(this, 'header')];
                    case 1:
                        headers = _a.sent();
                        return [4 /*yield*/, this.exec("database", [this.config.app_db], "get_sql_data", ["select * from test_meta"])];
                    case 2:
                        ifuel = _a.sent();
                        xheaders = Array.from(this.expand_headers(headers, ifuel));
                        // 
                        // 
                        return [2 /*return*/, xheaders];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    scorer.prototype.expand_header = function (headers, test_ifuel) {
        var _i, headers_1, tin_1, _a, test_ifuel_1, topic, _b, _c, _d, test_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _i = 0, headers_1 = headers;
                    _e.label = 1;
                case 1:
                    if (!(_i < headers_1.length)) return [3 /*break*/, 12];
                    tin_1 = headers_1[_i];
                    if (!(tin_1.cname !== 'tests')) return [3 /*break*/, 3];
                    return [4 /*yield*/, tin_1];
                case 2:
                    _e.sent();
                    return [3 /*break*/, 11];
                case 3:
                    _a = 0, test_ifuel_1 = test_ifuel;
                    _e.label = 4;
                case 4:
                    if (!(_a < test_ifuel_1.length)) return [3 /*break*/, 11];
                    topic = test_ifuel_1[_a];
                    _b = [];
                    for (_c in topic["tests"])
                        _b.push(_c);
                    _d = 0;
                    _e.label = 5;
                case 5:
                    if (!(_d < _b.length)) return [3 /*break*/, 8];
                    test_1 = _b[_d];
                    return [4 /*yield*/, new tin_1(test_1)];
                case 6:
                    _e.sent();
                    _e.label = 7;
                case 7:
                    _d++;
                    return [3 /*break*/, 5];
                case 8: return [4 /*yield*/, new tin_1()];
                case 9:
                    _e.sent();
                    _e.label = 10;
                case 10:
                    _a++;
                    return [3 /*break*/, 4];
                case 11:
                    _i++;
                    return [3 /*break*/, 1];
                case 12: return [2 /*return*/];
            }
        });
    };
    return scorer;
}(scroller));
// 
// 
var metamod1 = /** @class */ (function (_super) {
    __extends(metamod1, _super);
    // 
    function metamod1(base, css, data, udf_meta, dbname) {
        var _this = _super.call(this, css, base, udf_meta) || this;
        _this.data = data;
        _this.dbname = dbname;
        return _this;
    }
    // 
    // 
    metamod1.prototype.create_tins = function (type, Barrel) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 
                //
                if (type === "header")
                    return [2 /*return*/, ["cname", "order", "hidden", "region", "size"].map(function (name, index) { return new tin(name, index, Barrel); })
                        // 
                        //The tin is of type body
                    ];
                return [2 /*return*/];
            });
        });
    };
    // 
    // 
    metamod1.prototype.create_barrels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var col_metadata;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec("database", [this.dbname], 'get_sql_metadata', [this.sql])];
                    case 1:
                        col_metadata = _a.sent();
                        // 
                        //Map the col metadata to produce promised barrels 
                        return [2 /*return*/, col_metadata.map(function (metadata) { return _this.create_barrel(metadata); })];
                }
            });
        });
    };
    // 
    //Compiles and returns a barrel from a specified metadata
    metamod1.prototype.create_barrel = function (metadata) {
        var _this = this;
        // 
        var Barrel = new barrel(this);
        //
        var tins = this.headers.map(function (htin, dposition) { return _this.create_tin(htin, metadata, Barrel, dposition); });
        var tr = create_1.default(this.table.tBodies[0], "tr", {});
        return Barrel;
    };
    // 
    // 
    metamod1.prototype.create_tin = function (htin, metadata, Barrel, dposition) {
        //
        var Tin = new tin(htin.name, dposition, Barrel);
        // 
        // 
        var anchor = Tin.anchor;
        var Udf_meta = this.udf_meta[htin.name];
        switch (htin.name) {
            case "cname":
                Tin.Io = new io_1.readonly(anchor);
                Tin.Io.value = htin.name;
                break;
            case "order":
                Tin.Io = new io_1.input("number", anchor);
                Tin.Io.value = Udf_meta.uposition === undefined ? Tin.dposition : Udf_meta.uposition;
                break;
            case "hidden":
                Tin.Io = new io_1.checkbox(anchor);
                Tin.Io.value = Udf_meta.hidden === undefined ? false : Udf_meta.hidden;
                break;
            case "region":
                Tin.Io = new io_1.select(anchor, ["page", "verticles", "horizantals", "intersects"]);
                Tin.Io.value = Udf_meta.region === undefined ? "horizontals" : Udf_meta.region;
                break;
            case "size":
                Tin.Io = new io_1.input("number", anchor);
                Tin.Io.value = Udf_meta.size === undefined ? metadata.len : Udf_meta.size;
                break;
        }
        // 
        return Tin;
    };
    return metamod1;
}(lister));
//
//
var theme = /** @class */ (function (_super) {
    __extends(theme, _super);
    // 
    // 
    function theme(base, css, subject, udf_meta) {
        var _this = _super.call(this, base, css, udf_meta) || this;
        _this.subject = subject;
        return _this;
    }
    // 
    //
    theme.prototype.get_sql = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sql_meta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.exec("editor", this.subject, "describe", [])];
                    case 1:
                        sql_meta = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return theme;
}(scroller));
var tabulator = /** @class */ (function (_super) {
    __extends(tabulator, _super);
    // 
    // 
    function tabulator(base, css, sql_, udf) {
        var _this = _super.call(this, base, css, udf) || this;
        _this.sql_ = sql_;
        return _this;
    }
    // 
    // 
    tabulator.prototype.get_sql = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sql_];
            });
        });
    };
    return tabulator;
}(scroller));
