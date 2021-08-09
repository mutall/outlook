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
// 
//Import the theme
var scroll = __importStar(require("./scroll.js"));
var outlook = __importStar(require("../../../outlook/v/code/outlook.js"));
var fuel = __importStar(require("./fuel.js"));
var school_js_1 = __importDefault(require("./school.js"));
var create_js_1 = __importDefault(require("./create.js"));
var io = __importStar(require("./io.js"));
// 
//This is my school sytem market place where the school data is represented as 
//lables with a brief description of the school and links to their schools.
var home = /** @class */ (function (_super) {
    __extends(home, _super);
    // 
    function home(
    //The css string used to derive the elemnt where this sql will be placed 
    css, 
    // 
    //The mother view where this panel is placed.
    base, 
    // 
    //The database name that is the base of this query 
    dbname) {
        var _this = _super.call(this, css, base, dbname) || this;
        // 
        _this.Fuel = null;
        _this.sql_ = _this.get_sql_();
        return _this;
    }
    // 
    //Get the sql that was set by the constructor
    home.prototype.get_sql_ = function () {
        return ' select  `school`.`logo`, '
            + ' `school`.`id`, '
            + ' `school`.`name`, '
            + ' `school`.`address`, '
            + ' `school`.`location` '
            + ' from  `general_school`.`school` ';
    };
    Object.defineProperty(home.prototype, "sql", {
        get: function () { return this.sql_; },
        // 
        set: function (s) { this.sql_ = s; },
        enumerable: false,
        configurable: true
    });
    //
    // 
    //Paint this market place from the first selection in a lable format.
    home.prototype.continue_paint = function () {
        return __awaiter(this, void 0, void 0, function () {
            var count_sql, records, ifuel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        count_sql = "select count(1) as count from (" + this.sql + ") as su";
                        return [4 /*yield*/, school_js_1.default.current.exec("database", [this.config.app_db], "get_sql_data", [count_sql])];
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
    // 
    home.prototype.get_io = function (col) {
        return new io.input("text", this);
    };
    // 
    //Sets the ifuel and displays it in the required procedure 
    home.prototype.show = function (Ifuel, offset) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.Fuel === null)) return [3 /*break*/, 3];
                        // 
                        this.Fuel = new show(Ifuel, this.sql, this, offset);
                        // 
                        //Activate the fuel 
                        return [4 /*yield*/, this.Fuel.activate()];
                    case 1:
                        // 
                        //Activate the fuel 
                        _a.sent();
                        //
                        //Paint this labels to make them visible.
                        return [4 /*yield*/, this.Fuel.paint(this.target)];
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
    //This is the search event listener 
    //Filters the schools displayed on the market pannel and to a selected 
    //shool
    home.prototype.show_school = function (evt) {
        return __awaiter(this, void 0, void 0, function () {
            var selected, exist;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //
                        //Throw an error if this method was called without the fuel being set
                        if (this.Fuel === null)
                            throw new Error("method called before fuel isset");
                        selected = evt.target.value;
                        return [4 /*yield*/, this.Fuel.exists(selected)];
                    case 1:
                        exist = _a.sent();
                        /**
                         *
                         * 1. the accademy is already painted bring it to focus*/
                        if (exist instanceof academy) {
                            exist.focus();
                            return [2 /*return*/];
                        }
                        /*
                        * 2. Get the associated Ifuel, expand the show and bring it to focus */
                        this.Fuel.add_academy(selected);
                        return [2 /*return*/];
                }
            });
        });
    };
    return home;
}(scroll.scroll));
exports.default = home;
// 
//This home page models the school market place and hence we need to model a market.
//this promted the modeling of the fuel as stock and the barrels as items 
var show = /** @class */ (function (_super) {
    __extends(show, _super);
    // 
    function show(records, sql, host, offset) {
        var _this = _super.call(this, records, sql, host, offset) || this;
        _this.host = host;
        // 
        _this.display = 'label';
        return _this;
    }
    // 
    //Overide the show method to include the bootrap class styles keeping in mind 
    //we are only interested in the label view
    show.prototype.paint = function (element) {
        //
        //Allow every barrel to paint itsself
        this.forEach(function (bar) { return bar.paint(element); });
    };
    // 
    //Adds an academy with the given selection name 
    show.prototype.add_academy = function (selection) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, modify, ifuel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = this.host.original_sql === undefined ? this.sql : this.host.original_sql;
                        this.host.original_sql = sql;
                        modify = " where school.name= " + selection;
                        // 
                        //Modify the sql 
                        this.host.sql = sql + modify;
                        return [4 /*yield*/, this.host.query(0, 1)];
                    case 1:
                        ifuel = _a.sent();
                        //
                        //Expand this repository with the given information.
                        this.expand(-1, ifuel);
                        //
                        //Return the newly created accademy if it exists
                        return [2 /*return*/, this.exists(selection)];
                }
            });
        });
    };
    // 
    //Returns the accademy with a given name from its current repository, i.e., displayed in the show room 
    show.prototype.exists = function (selection) {
        return __awaiter(this, void 0, void 0, function () {
            var acdms, selected;
            return __generator(this, function (_a) {
                acdms = [];
                this.forEach(function (acc) { return acdms.push(acc); });
                selected = acdms.filter(function (acc) { return acc.name.data === selection; });
                // 
                //result false if none is selected
                if (selected.length === 0)
                    return [2 /*return*/, false];
                // 
                return [2 /*return*/, selected[0]];
            });
        });
    };
    // 
    //Converts the static list of the records into barrels making them members of this 
    //array coz currently this array is empty. This method is also called when there 
    //is need to expand this array with more data hence the method is public and has an 
    //optional Ifuel with it
    show.prototype.activate = function (ifuel, start) {
        return __awaiter(this, void 0, void 0, function () {
            var records, offset;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.columns === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.get_columns()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        records = ifuel === undefined ? this.records : ifuel;
                        offset = start === undefined ? this.offset : start;
                        // 
                        //Loop through the static structure of the ifuel creating barrels in each 
                        //indexing them by their offsets.
                        records.forEach(function (rec, index) {
                            // 
                            //Evaluate the offset used to derive this barrel 
                            var map_index = offset + index;
                            // 
                            //Die for now if this fuel has repeated barellels
                            if (_this.has(map_index)) {
                                // 
                                //alert the user then die 
                                alert("The fuel is overiding at idex " + map_index);
                                throw new Error("The fuel is overiding at idex " + map_index);
                            }
                            // 
                            //Add the activated tin  into this collection.
                            _this.set(map_index, new academy(rec, _this, map_index));
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return show;
}(fuel.fuel));
// 
//An accademy is an advert of a school as it appears in the market place once selected
//the accademy becomes an institution and hence allows the users to have accces of the 
//various school assets.
var academy = /** @class */ (function (_super) {
    __extends(academy, _super);
    // 
    //The short code for this accademy
    function academy(
    // 
    //This is the static collection of the tins as an object 
    items, 
    //
    //The bigger fuel collection
    parent, 
    // 
    //The offset of this barrel in the database 
    offset) {
        return _super.call(this, items, parent, offset) || this;
    }
    // 
    //The activation of the static tins to tins required population of its 
    //metadata this is incase these tins were derived from a random sql.
    academy.prototype.activate = function () {
        var _this = this;
        _super.prototype.activate.call(this);
        // 
        //Set the image, name and id tins
        var Tins = ["logo", "name", "id"].map(function (el) { return _this.find(el); });
        //
        //Assign the properties
        for (var index = 0; index < Tins.length; index++) {
            switch (index) {
                case 0:
                    this.logo = Tins[index];
                    break;
                case 1:
                    this.name = Tins[index];
                    break;
                case 2:
                    this.id = Tins[index];
                    break;
            }
        }
    };
    // 
    //Put this element into focus
    academy.prototype.focus = function () {
        this.element.scrollIntoView();
        this.element.focus();
    };
    // 
    //Returns the accademy property selected from the current collection of tins
    academy.prototype.find = function (property) {
        // 
        //convert this map into a simple array
        var Tins = [];
        this.forEach(function (element) { return Tins.push(element); });
        // 
        //Filter the tins using the name as a creiteria 
        var selected = Tins.filter(function (Tin) { return Tin.name === property; });
        // 
        //Ensure only one tin was filtered 
        if (selected.length > 1)
            throw new Error("invalid sql that returned dublicate column names");
        // 
        //return the promised tin
        return selected[0];
    };
    // 
    //
    //Converts this accademy to an institution for the user to access the various school 
    //resources
    academy.prototype.open_school = function () {
        return __awaiter(this, void 0, void 0, function () {
            var Institution;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Institution = new institution(this.parent.host);
                        // 
                        //administer the institution
                        return [4 /*yield*/, Institution.administer()];
                    case 1:
                        // 
                        //administer the institution
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 
    //Paints this barrel by default as a table this method can be overidden to 
    //change the mode of display
    academy.prototype.paint = function (el) {
        var _this = this;
        var _a;
        //
        //Set the anchor
        if (el instanceof HTMLElement)
            this.anchor = el;
        // 
        //Get the element to attach this display
        var element = el === undefined ? this.anchor : el;
        // 
        //Create the div element responsible for panting this academy
        this.element = create_js_1.default(element, "div", { className: "accademy col-md-4", tabindex: 0 });
        // 
        //The div that houses the logo and the school name used for bootrap styling
        var container = create_js_1.default(this.element, "div", { className: "full blog_img_popular" });
        // 
        //The image tag for the logo 
        create_js_1.default(container, "img", { src: String((_a = this.logo) === null || _a === void 0 ? void 0 : _a.data), className: "img-responsive" });
        // 
        //The school name as a h4
        this.header = create_js_1.default(container, "h4", { onclick: function () { return _this.open_school(); }, textContent: String(this.name.data) });
        // 
        //Return the elemnt created.
        return this.element;
    };
    return academy;
}(fuel.barrel));
// 
//An institution is a class where the user can access the various school resources via event 
//listeners.
//This class was designed to extend an app as a baby but since it cannot extend both an app 
//and a baby an institution was created that has a school.
var institution = /** @class */ (function (_super) {
    __extends(institution, _super);
    // 
    //To create this instition we need a school an the url where this school will be 
    //displayed 
    function institution(
    // 
    //The mother of this institution is the school
    mother, 
    // 
    //The id or short name for this institution
    id, 
    //
    //The name of this instutution
    name
    //
    ) {
        var _this = _super.call(this, mother) || this;
        _this.id = id;
        _this.name = name;
        // 
        //Set the pannels of this institution
        _this.set_pannels();
        return _this;
    }
    // 
    //Both the get_results and the check are requirement of the baby which by now are doing 
    //nothing
    institution.prototype.get_result = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    institution.prototype.check = function () { return true; };
    return institution;
}(outlook.baby));
