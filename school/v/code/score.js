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
var sql_js_1 = __importDefault(require("./sql.js"));
var app = __importStar(require("../../../outlook/v/code/app.js"));
var school_js_1 = __importDefault(require("./school.js"));
var theme_js_1 = require("./theme.js");
var crud = __importStar(require("./crud.js"));
/**
 * helps to keep track of all the visited exams,subject,year, stream and grade
 * for easier monitaring and saving
 */
var visit = /** @class */ (function () {
    function visit() {
        this.exams = new Set();
        this.subjects = new Set();
        this.year = new Set();
        this.stream = new Set();
        this.grades = new Set();
    }
    return visit;
}());
var visited = /** @class */ (function () {
    function visited() {
        this.create = new visit();
    }
    return visited;
}());
//
//This is a baby page that is not used for collecting data 
var exam = /** @class */ (function (_super) {
    __extends(exam, _super);
    // 
    //To create this view we include the mother  window and the score 
    //product to be manipulated.
    function exam(
    // 
    //The mother of this baby 
    mother, 
    //
    //The product under unvestigation 
    product, 
    // 
    //The action to be done in the score page 
    action) {
        var _this = 
        // 
        _super.call(this, mother, "score.html") || this;
        _this.mother = mother;
        _this.product = product;
        _this.action = action;
        //
        //Keep track of the visited options for easier monitaring
        _this.visited = new visited();
        _this.set_panels();
        return _this;
    }
    Object.defineProperty(exam.prototype, "stream", {
        // 
        //Get the 
        get: function () {
            return this.stream_selector.value;
        },
        // 
        //set the stream of the exam under study
        set: function (name) {
            this.stream_selector.value = name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(exam.prototype, "grade", {
        // 
        //Get the level of the class 
        get: function () { return this.grade_selector.value; },
        // 
        //set the name of the exam 
        set: function (name) { this.grade_selector.value = name; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(exam.prototype, "subject", {
        // 
        //Get the subject 
        get: function () { return this.subject_selector.value; },
        // 
        //set the subject 
        set: function (name) {
            this.subject_selector.value = name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(exam.prototype, "exam", {
        // 
        //Get the name of the exam 
        get: function () { return this.exam_selector.value; },
        // 
        //set the name of the exam 
        set: function (name) { this.exam_selector.value = name; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(exam.prototype, "year", {
        // 
        //Get the name of the exam 
        get: function () { return this.year_selector.value; },
        // 
        //set the name of the exam 
        set: function (name) { this.year_selector.value = name; },
        enumerable: false,
        configurable: true
    });
    exam.prototype.administer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // 
                    //Start with the parent administer routin
                    return [4 /*yield*/, _super.prototype.administer.call(this)];
                    case 1:
                        // 
                        //Start with the parent administer routin
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 
    //Sets the panels that are required for this view the panel include the 
    //welcome panel and the the modified sql theme panel 
    exam.prototype.set_panels = function () {
        // 
        //Create the service
        var product = school_js_1.default.current.products.get("manage_exams");
        var Products = new app.products({ "manage_exams": product });
        // 
        //Create the service pannel
        var service = new app.services(this, Products);
        this.panels.set("service", service);
    };
    // 
    //Set the relevant sql for this page based on the sql. 
    exam.prototype.take_action = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sql, _a, test_1, Theme;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sql = '';
                        _a = this.action;
                        switch (_a) {
                            case "create": return [3 /*break*/, 1];
                            case "edit": return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 7];
                    case 1:
                        if (!this.check()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.create()
                            // 
                        ];
                    case 2:
                        test_1 = _b.sent();
                        // 
                        if (test_1 === null)
                            return [2 /*return*/];
                        sql = test_1;
                        _b.label = 3;
                    case 3: return [3 /*break*/, 8];
                    case 4:
                        if (!this.check()) return [3 /*break*/, 6];
                        return [4 /*yield*/, school_js_1.default.current.exec("school", [school_js_1.default.current.id], "get_subject_scores", [this.subject, this.stream, this.exam, this.grade])];
                    case 5:
                        sql = _b.sent();
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        sql = "select * from student";
                        _b.label = 8;
                    case 8:
                        Theme = new sql_js_1.default(sql, this, "#content", "general_school");
                        this.panels.set("theme", Theme);
                        Theme.paint();
                        this.theme = Theme;
                        return [2 /*return*/];
                }
            });
        });
    };
    // 
    //Users are not allowed to change the grade,subject, stream,exam before they save their data 
    exam.prototype.create_condition = function () {
        if (this.visited.create.exams.has(this.exam)
            || this.visited.create.grades.has(this.grade)
            || this.visited.create.stream.has(this.stream)
            || this.visited.create.year.has(this.year)
            || this.visited.create.subjects.has(this.subject))
            return false;
        // 
        //Set the current options
        this.visited.create.exams.add(this.exam);
        this.visited.create.grades.add(this.grade);
        this.visited.create.stream.add(this.stream);
        this.visited.create.year.add(this.year);
        this.visited.create.subjects.add(this.subject);
        // 
        //Return a false if no data 
        return true;
    };
    // 
    //Creates a new worksheet of a particular subject where the teacher/staff is allowed to
    //enter the scores.
    //This function returns the sql that retrieves the students of the selected class with
    //an empty section where they can fill in the marks
    exam.prototype.create = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.create_condition()) return [3 /*break*/, 2];
                        return [4 /*yield*/, school_js_1.default.current.exec("school", ["kaps"], "get_student", [this.stream, this.grade, this.year])];
                    case 1:
                        sql = _a.sent();
                        return [2 /*return*/, sql];
                    case 2:
                        alert("save your data before doing any changes");
                        return [2 /*return*/, null];
                }
            });
        });
    };
    // 
    //
    exam.prototype.get_result = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    // 
    //Returns true if all the parameters needed to create a theme panel are set 
    exam.prototype.check = function () {
        // 
        //To get the subjects we need the stream, grade, year 
        if (this.stream_selector.value === undefined || this.stream_selector.value === "") {
            alert("Please select a stream");
            return false;
        }
        if (this.grade_selector.value === undefined || this.grade_selector.value === "") {
            alert("Please select a class");
            return false;
        }
        if (this.subject_selector.value === undefined || this.subject_selector.value === "") {
            alert("Please select a subjects");
            return false;
        }
        if (this.year_selector.value === undefined || this.year_selector.value === "") {
            alert("Please select a year");
            return false;
        }
        return true;
    };
    // 
    //Overide the default way of showing a panel to only show the service pannel untill
    //the user selects the parameters needed for the theme pannel
    exam.prototype.show_panels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, panel;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.panels !== undefined)) return [3 /*break*/, 4];
                        _i = 0, _a = this.panels.values();
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        panel = _a[_i];
                        // 
                        //do not paint the theme pane 
                        if (panel instanceof sql_js_1.default)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, panel.paint()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // 
                        //Create the input selector for the name, stream, grade and subject.
                        this.exam_selector = this.get_element("exam");
                        this.grade_selector = this.get_element("grade");
                        // 
                        //Initialize the subject and popilate it with the available subjects
                        this.subject_selector = this.get_element("subject");
                        // 
                        //Initialize the stream selector and populate it with the relevant stream
                        this.stream_selector = this.get_element("stream");
                        this.year_selector = this.get_element("year");
                        return [2 /*return*/];
                }
            });
        });
    };
    return exam;
}(crud.page));
exports.default = exam;
// 
//models a single score and the various parameters required to make a score valid 
var score = /** @class */ (function (_super) {
    __extends(score, _super);
    function score() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return score;
}(theme_js_1.theme));
