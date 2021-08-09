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
exports.scroll = void 0;
//
//This file is intended to contain all the scrolling functionality that 
//retrieves a constrained limit number of records from the database
//in the direction  of tghe scroll. 
//It was to be implemented as an interface but interfaces do not have 
//implemented methods
var outlook = __importStar(require("../../../outlook/v/code/outlook.js"));
var server = __importStar(require("../../../library/v/code/server.js"));
var schema = __importStar(require("../../../library/v/code/schema.js"));
var fuel = __importStar(require("./fuel.js"));
// 
// 
var scroll = /** @class */ (function (_super) {
    __extends(scroll, _super);
    // 
    //To create a scrollable pannel er need to describe the css where the 
    //content is to be painted and the mother where this pannel is housed.
    function scroll(css, base, dbname) {
        var _this = _super.call(this, css, base) || this;
        _this.dbname = dbname;
        /**
         * The scrolling variables
         */
        //
        //The offset of the records that are visible in the page 
        //both top and bottom i.e within scrolling without loading 
        //more data in the purple part of our boundary diagram
        _this.view = { top: 0, bottom: 0 };
        // 
        //This is the limit number of records that can be retrieved and 
        //constrained by the extreme boundery the blue part of the 
        //blue region of our map
        _this.joint = { top: 0, bottom: 0 };
        // 
        //The data mpdel derived from this sql.
        _this.Fuel = null;
        // 
        //This is the display mode that is used in controlling the usage of the scrollong keys
        _this.display_mode = "normal";
        return _this;
    }
    Object.defineProperty(scroll.prototype, "extreme", {
        //
        //This is the offset that indicates the last retrievable record 
        //i.e., the green part of our scroll diagram.
        get: function () {
            return { top: 0, bottom: this.max_records };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(scroll.prototype, "document", {
        // 
        // 
        get: function () {
            // 
            return this.base.document === null ? window.document : this.base.document;
        },
        enumerable: false,
        configurable: true
    });
    //
    //This is an onchange event listener that highlights
    //this field, i.e., td, to indicate that it will be
    //considered for saving.
    scroll.mark_as_edited = function (evt) {
        //
        //initialize the element.
        var element;
        // 
        //If the element is wat was passed as a parameter continue
        if (evt instanceof HTMLElement) {
            element = evt;
        }
        // 
        //Check if the event target is a html element to avoid the error on 
        //event element.
        else if (evt.target instanceof HTMLElement) {
            element = evt.target;
        }
        // 
        //This event was not caused by a html element 
        else {
            return;
        }
        //
        // 
        //Do nothing if the element is null 
        if (element === null)
            return;
        //
        //Stop any bubblig up
        window.event.stopPropagation();
        //
        //Get the td that houses the element and mark it as edited.
        var td = page.get_td(element);
        td.classList.add("edited");
        //
        //Get the first cell of the row (that contains this td) and 
        //mark it as edited.
        var pri = td.parentElement.children[0];
        pri.classList.add("edited");
        // 
        //Update the output of this io
        var pos = [page.current.theme.key, td.parentElement.rowIndex, td.cellIndex];
        //
        //get the td' io
        var io = theme.theme.ios.get(String(pos));
        //
        //Do the transfer to update inputs
        io.update_outputs();
    };
    // 
    //Reorders the columns of the table to a given user defined structure 
    scroll.prototype.reorder = function () {
        // 
        //Get the table that was used to reorder 
        var table = this.get_element("position");
        // 
        //Compile the position data.
        this.position = {};
        // 
        //Set the  newly specified positions 
        var tbody = table.children;
        var cnames = tbody[0];
        var positions = tbody[1];
        //
        //Loop through the tbody row formuta
        for (var index = 0; index < tbody[0].cells.length; index++) {
            // 
            //Get the user input position 
            var pos = parseInt(positions.cells[index].textContent);
            var cname = cnames.cells[index].textContent;
            this.position[pos] = cname;
        }
        // 
        //Clear the tbody of the target element 
        var crud_table = this.get_element("table_crud");
        crud_table.querySelector("tbody").innerHTML = "";
        this.Fuel.show_header(crud_table.querySelector("thead"));
        this.Fuel.paint();
    };
    //
    //Hide the selected column by controling the styling 
    scroll.prototype.hide = function () {
        //
        //Get the selected th
        var th = this.target.querySelector(".TH");
        if (th === null) {
            alert("please select a column");
            return;
        }
        //1. Get the index of the selected th
        var index = th.cellIndex;
        //
        //2.Retrieve the rule declaration associated with this index
        //    
        //2.1 retrieve the style tag.
        var style_sheet = this.get_element('columns').sheet;
        if (style_sheet === null)
            throw new Error("styleshhet not found");
        //
        //2.1 Retreieve the rule declaration with this index
        var declaration = style_sheet.cssRules[index].style;
        //
        //2.2 Change the display property to none
        declaration.setProperty("display", "none");
    };
    //
    //Show the columns that are already hidden.
    scroll.prototype.unhide = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sheet, ths, all_headings /*Array<[cellIndex, cellname]>*/, hidden_columns /*Array<[cellIndex, cellname]>*/, visible_columns /*Array<cellIndex>*/;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sheet = this.get_element('#columns').sheet;
                        if (sheet === null)
                            throw new Error();
                        ths = document.querySelectorAll("th");
                        all_headings = Array.from(ths)
                            .map(function (th) { return [th.cellIndex, th.textContent]; });
                        hidden_columns = all_headings.filter(function (_a) {
                            var i = _a[0];
                            //
                            //Get the i'th rule declaration.
                            var declaration = sheet.cssRules[i].style;
                            //
                            //Get the display property.
                            var display = declaration.getPropertyValue("display");
                            //
                            //If the property is found return true
                            return display !== "";
                        });
                        return [4 /*yield*/, select_visible_columns(hidden_columns)];
                    case 1:
                        visible_columns = _a.sent();
                        //Show the hidden columns.
                        visible_columns.forEach(function (i) {
                            //
                            //Get the declaration of the i'th rule 
                            var declaration = sheet.cssRules[i].style;
                            //
                            //remove the display none property
                            declaration.removeProperty("display");
                            declaration.removeProperty("background-color");
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    //Initialize the crud style for managing the hide/show feature 
    //of columns
    scroll.prototype.initialize_styles = function (col_names) {
        //
        //Get the columns style sheet
        var sheet = this.get_element("columns").sheet;
        //
        //loop through all the columns and set the styling for each column
        col_names.forEach(function (_col, index) {
            //
            //Change  the index to a 1-based
            var index1 = index + 1;
            //
            //Create the rule for supporting styling of a header and its matching
            //fields the same way.
            //e.g When hiding th:nth-child(2), td:nth-child(2){ display:none}
            var rule = "th:nth-child(" + index1 + "), td:nth-child(" + index1 + "){}";
            //
            //Insert the rule to the style sheet.
            sheet.insertRule(rule, index);
        });
    };
    //
    //Load the table rows and adjust the  boundaries depending
    //on the outcome type.
    scroll.prototype.execute_outcome = function (outcome, request) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, adjust, fresh, tbody;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = outcome.type;
                        switch (_a) {
                            case "nothing": return [3 /*break*/, 1];
                            case "adjust": return [3 /*break*/, 2];
                            case "fresh": return [3 /*break*/, 4];
                            case "out_of_range": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 1: 
                    //this.scroll_into_view(request,"center")
                    return [3 /*break*/, 8];
                    case 2:
                        adjust = outcome;
                        //
                        //Load the body from the offset and in the outcome direction.
                        return [4 /*yield*/, this.load_body(adjust.start_from, adjust.dir)];
                    case 3:
                        //
                        //Load the body from the offset and in the outcome direction.
                        _b.sent();
                        //
                        //Now adjust the view direction to the outcome value.
                        this.view[adjust.dir] = adjust.adjusted_view;
                        //this.scroll_into_view(request,"start")
                        return [3 /*break*/, 8];
                    case 4:
                        fresh = outcome;
                        tbody = this.document.querySelector("tbody");
                        // 
                        //There must be a table on this page.
                        if (tbody === null)
                            throw new schema.mutall_error("tbody not found");
                        // 
                        //Empty the table body.
                        tbody.innerHTML = "";
                        // 
                        //Reset the view boundaries to {0,0} before 
                        //loading a fresh page.
                        this.view = { top: 0, bottom: 0 };
                        //
                        //Load the new page starting from the view top, 
                        //in the forward direction.
                        return [4 /*yield*/, this.load_body(fresh.view_top, "bottom")];
                    case 5:
                        //
                        //Load the new page starting from the view top, 
                        //in the forward direction.
                        _b.sent();
                        //
                        //Reset the boundaries after loading a fresh 
                        //page.
                        this.view.top = fresh.view_top;
                        this.view.bottom = fresh.view_bottom;
                        return [3 /*break*/, 8];
                    case 6: 
                    //              alert(
                    //                  `Request is out of range bacause it fails this test 
                    //                  ${this.extreme.top} <=${request} < ${this.extreme.bottom}`
                    //              );
                    return [3 /*break*/, 8];
                    case 7: throw new schema.mutall_error("The outcome of type \n                        " + outcome.type + " is not known");
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    //
    //Populate our table body with new rows 
    //starting from the given offset and direction.
    scroll.prototype.load_body = function (offset /*:int*/, dir /*:mytop | bottom*/) {
        return __awaiter(this, void 0, void 0, function () {
            var h, constrained_limit, Ifuel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //
                        //Range-GUARD:Ensure that offset is outside of the view for loading to be valid.
                        if (this.within_view(offset))
                            throw new schema.mutall_error("The requested offset " + offset + " \n                is already in view \n                " + this.view.top + " -- " + this.view.bottom + ", \n                so a new load is not valid.");
                        h = Math.abs(this.view[dir] - this.extreme[dir]);
                        constrained_limit = h < this.config.limit ? h : this.config.limit;
                        return [4 /*yield*/, this.query(offset, constrained_limit)];
                    case 1:
                        Ifuel = _a.sent();
                        // 
                        //Display this fuel to make it visible
                        return [4 /*yield*/, this.show(Ifuel, offset)];
                    case 2:
                        // 
                        //Display this fuel to make it visible
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 
    //Sets the ifuel and displays it in the required procedure 
    scroll.prototype.show = function (Ifuel, offset) {
        return __awaiter(this, void 0, void 0, function () {
            var tbody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tbody = document.querySelector("tbody");
                        if (!(this.Fuel === null)) return [3 /*break*/, 3];
                        this.Fuel = new fuel.fuel(Ifuel, this.sql, this, offset);
                        return [4 /*yield*/, this.Fuel.activate()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.Fuel.paint(tbody, offset)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        // 
                        //Paint the newly obtained records
                        this.Fuel.activate(Ifuel, offset);
                        this.Fuel.paint(tbody, offset);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    //
    //Clears the target of its content inorder to allow others to be painted 
    scroll.prototype.clear = function (header) {
        // 
        //Reset the boundaries
        this.view.top = 0;
        this.view.bottom = 0;
        // 
        //Clear the target elment
        this.target.innerHTML = "";
        // 
        //Reset the fuel
        this.Fuel = null;
    };
    //
    //This is a scroll event listener to retrive the previous or next 
    //page of data depending in the position of the scroll button.
    scroll.prototype.myscroll = function () {
        //
        //Let tbody be the scrollable element
        //const tbody = document.querySelector("tbody")!;
        // 
        //For now the scrollable element is the content 
        var tbody = this.get_element("content");
        //
        //Get the scroll top as a rounded integer (not truncated)
        //to ensure that the scroll height and the client height are 
        //always equal to or greater than the scroll height when we are at 
        //the bottom of the scroll. 
        var scrollTop = Math.round(tbody.scrollTop);
        //
        //Decide whether to retrieve new records or not
        if (scrollTop < 3) {
            //
            //Retrieve records that are above the top view boundary 
            //This is equivalent to clicking the previous button
            this.retrieve_records("top");
        }
        else if (scrollTop + tbody.clientHeight >= tbody.scrollHeight) {
            //
            //Retrieve records that are below the bottom view boundary
            //This is equivalent to clicking the next button 
            this.retrieve_records("bottom");
        }
        else {
            //
            //Ignore the scrolling
        }
    };
    //
    //This is an event listener that retrieves limit number of 
    //records from the server depending on the given direction.
    //The retrieved records are in the blue area of our scroll map.
    scroll.prototype.retrieve_records = function (dir) {
        return __awaiter(this, void 0, void 0, function () {
            var offset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //
                        //If the direction is away from the top view boundary, 
                        //the offset becomes joint 
                        if (dir === "top") {
                            //
                            //The offset is the joint top boundary if we are scrolling upwards.
                            offset = this.get_joint("top");
                        }
                        //
                        else {
                            //
                            //The offset is the bottom view boundary if we are 
                            //scrolling downwards.
                            offset = this.view.bottom;
                        }
                        //
                        //Retrieve and display $limit rows of data starting from the 
                        //given offset/request subject to the available data.
                        return [4 /*yield*/, this.goto(offset)];
                    case 1:
                        //
                        //Retrieve and display $limit rows of data starting from the 
                        //given offset/request subject to the available data.
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    //Test if offset is within joint boundaries
    scroll.prototype.within_joint = function (request) {
        //
        //We are within the joint boundaries if...
        var condition = 
        //
        //.. offset is between the top and 
        //bottom joint boundaries.
        request >= this.get_joint("top")
            && request < this.get_joint("bottom");
        return condition;
    };
    // 
    //Test if offset is within extremes and return true otherwise false.
    scroll.prototype.within_extreme = function (request) {
        //
        //extreme top condition should always 
        //be set otherwise you get a runtime error.
        //if extreme top is undefined throw an error.
        return request >= this.extreme.top
            && request < this.extreme.bottom;
    };
    //
    //Test if offset is within view boundaries
    scroll.prototype.within_view = function (req) {
        //
        //We are within  view if...
        return true //true is for appeasing the IDE.
            //
            //...the top view is set...
            && this.view.top !== null
            //
            //...and the offset is between the top 
            //and bottom view boundaries.
            && req >= this.view.top
            && req < this.view.bottom;
    };
    //
    //Return the joint boundary given the direction The top joint boundary
    // is a maximum of limit records from the top view boundary. The 
    // bottom joint boundary is a maiximum of limit records from the 
    // view[bottom]. see the scroll map 
    // http://206.189.207.206/pictures/outlook/scroll_2020_10_10.ppt
    scroll.prototype.get_joint = function (dir /*top|bottom*/) {
        //
        //
        var raw_boundary = 
        //
        //The referenced view boundary
        this.view[dir]
            //
            //The maximum range
            + this.config.limit
                //
                //Accounts for the direction 
                * (dir === "top" ? -1 : +1);
        //
        //Return a constrained boundary
        return this.within_extreme(raw_boundary)
            ? raw_boundary : this.extreme[dir];
    };
    //
    //
    //Fetch the real data from the database as an array of table rows.
    scroll.prototype.query = function (offset, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var dbname, complete_sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dbname = this.dbname === undefined ? this.config.app_db : this.dbname;
                        complete_sql = 
                        //
                        //Main sql
                        this.sql
                            //
                            //Paginate results.
                            + (" LIMIT " + limit + " OFFSET " + offset);
                        return [4 /*yield*/, server.exec("database", 
                            //
                            //dbase class constructor arguments
                            [dbname], 
                            //
                            "get_sql_data", 
                            //
                            //The sql stmt to run
                            [complete_sql])];
                    case 1: 
                    //
                    //Use the sql to query the database and get results as array of row objects.
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //
    //Select the row whose primary key is the given one.
    //and makes sure that it is in the view 
    scroll.prototype.select_nth_row = function (pk) {
        // 
        //Row selection is valid only when the pk is set
        if (pk === undefined)
            return;
        //
        //1. Get the row identified by the primary key. 
        var tr = document.querySelector("#r" + pk);
        //
        //Ensure that a row with this pk exists
        if (tr === null) {
            alert("No tr found with row id " + pk);
            return;
        }
        //
        //2. Select the row.
        scroll.select(tr);
        //
        //3.Bring the selected row to the center of the view.
        tr.scrollIntoView({ block: "center", inline: "center" });
    };
    //
    //
    scroll.prototype.scroll_into_view = function (request, position) {
        // 
        //Get the row index 
        var rowIndex = request - this.view.top;
        // 
        //Use the index to retrieve the row 
        var table = this.get_element("table_crud");
        var tr = table.rows[rowIndex];
        //
        //Ensure that a row with this pk exists
        if (tr === null) {
            alert("No tr found with rowIndex " + rowIndex);
            return;
        }
        //
        //Bring the selected row to the top of the view.
        tr.scrollIntoView({ block: position, inline: "center" });
    };
    //
    //Select the given th and highlights all the tds below it 
    scroll.prototype.select_column = function (evt) {
        // 
        //Get the row that evoked this event 
        var th = evt.target;
        // 
        //If there was no element selected return 
        if (th === null)
            return;
        //
        //0. Get the column stylesheet named column from the current document.
        var style = this.get_element("columns").sheet;
        // 
        //Die if the stylesheet was not found
        if (style === null)
            throw new schema.mutall_error("Stylesheet for 'columns' not known");
        //
        //1.Dehighlight the current column selection.
        //1.1 Get the currently selected column.There may be none.
        var col = this.target.querySelector(".TH");
        //
        //1.2 If there`s one, get its index.
        if (col !== null) {
            //
            //The index from which we are removing the highlight
            var index1 = col.cellIndex;
            //
            //1.3 Use the index to remove the background color from the matching rule
            //Remember there are as many css rules as there are columns.
            //
            //a) Get the rule that matches the index.
            var rule1 = style.cssRules[index1];
            rule1.style.cssText;
            //
            //b) Remove the background property.
            rule1.style.removeProperty("background-color");
        }
        //
        //2.Select the given th in the standard version.
        scroll.select(th);
        //
        //3.Highlight the td cells below the th.
        //
        //3.1 Get the index of the th i.e., column to be highlighted.
        var index2 = th.cellIndex;
        //
        //3.2 Use the index to get the css rule from column stylesheet.
        var rule2 = style.cssRules[index2];
        //
        //3.3 Set  the background color of the rule to lightgreen.
        rule2.style.setProperty("background-color", "lightgreen");
    };
    //
    //Ensure that the given tag is the only selected one 
    //of the same type
    scroll.select = function (tag) {
        //
        //Get the tagname 
        var tagname = tag.tagName;
        //
        //1. Declassifying all the elements classified with 
        //this tagname.
        var all = document.querySelectorAll("." + tagname);
        Array.from(all).forEach(function (element) {
            return element.classList.remove(tagname);
        });
        //
        //3.Classify this element 
        tag.classList.add(tagname);
    };
    //
    //
    //Retrieve and display $limit rows of data starting from the 
    //given offset/request, subject to the available data.
    scroll.prototype.goto = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var goto_element, value, outcome /*:"nothing"|"adjust"|"fresh"*/;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (request === undefined) {
                            // 
                            //Check whether a request is specified in the goto element 
                            if ((goto_element = document.querySelector('#goto')) !== null) {
                                value = goto_element.value;
                                //
                                //Get the users request as an integer
                                request = parseInt(value);
                            }
                            else {
                                //
                                //Set it to 0
                                request = 0;
                            }
                        }
                        //
                        //It is an error if the request is above the top extreme boundary.
                        if (request < this.extreme.top)
                            throw new schema.mutall_error("Goto: A request " + request + "\n            must be positive");
                        outcome = this.get_outcome(request);
                        //
                        //Load the table rows and use the scrolling outcome to update the 
                        //boundaries
                        return [4 /*yield*/, this.execute_outcome(outcome, request)];
                    case 1:
                        //
                        //Load the table rows and use the scrolling outcome to update the 
                        //boundaries
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //
    //Determine which scrolling outcome we need depending on the requested offset.
    scroll.prototype.get_outcome = function (request) {
        //
        //NOTHING: If the request is within view, do 
        //nothing.i.e., no loading of new rows or adjusting 
        //current view boundaries.
        if (this.within_view(request))
            return { type: "nothing" };
        //
        //ADJUST: If request is within the joint boundaries, 
        //load a fresh copy and adjust either the top or bottom
        //boundaries depending on the request direction.
        if (this.within_joint(request)) {
            //
            //The direction is top if the 
            //request is above the top boundary.
            var dir = request < this.view.top
                ? "top" : "bottom";
            //
            //The top or bottom boundaries 
            //should be adjusted to this value.
            var adjusted_view = this.get_joint(dir);
            //
            //Adjust the top boundary
            var start_from = dir === "top"
                ? this.get_joint(dir) : this.view[dir];
            //
            //Return the view boundary adjustment outcome.
            return { type: "adjust", dir: dir, start_from: start_from, adjusted_view: adjusted_view };
        }
        //
        //FRESH: If the request is within extremes, 
        //load a fresh outcome, i.e., clear current tbody, 
        //load new rows and adjust the views.
        if (this.within_extreme(request)) {
            //
            //Constrain  the request to the extreme top.
            var view_top = request < this.extreme.top
                ? this.extreme.top : request;
            //
            //The bottom is always $limit number of rows
            //from the top, on a fresh page.
            var y = view_top + this.config.limit;
            //
            //Constrain the bottom to the extreme bottom. 
            var view_bottom = y > this.extreme.bottom
                ? this.extreme.bottom : y;
            return { type: "fresh", view_top: view_top, view_bottom: view_bottom };
        }
        //
        //OUT OF RANGE: The request is out of range.
        return { type: "out_of_range", request: request };
    };
    // 
    //Saves io instances that created this theme table saved as a map 
    //indexed by their position in a thematic oanel
    scroll.ios = new Map();
    return scroll;
}(outlook.panel));
exports.scroll = scroll;
