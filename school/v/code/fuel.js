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
exports.tin = exports.barrel = exports.fuel = void 0;
var create_js_1 = __importDefault(require("./create.js"));
//
// 
//This class models the fuel retrieved from the server as a class model. this ia particulary 
//useful when we want to display this model in the various formats
//This class extends an Map where the barels are identified by the offset values they were 
//derived with in the database.
var fuel = /** @class */ (function (_super) {
    __extends(fuel, _super);
    // 
    //To create a barrel we need the ifuel that is used.
    function fuel(
    // 
    //These are the records retrieved from the database 
    records, 
    // 
    //The metadata used to describe the fuel.  
    metadata, 
    // 
    //This is the scrollable theme panel that generated this fuel.
    host, 
    // 
    //This is the offset of the first record in this sql.
    offset) {
        var _this = _super.call(this) || this;
        _this.records = records;
        _this.metadata = metadata;
        _this.host = host;
        _this.offset = offset;
        // 
        //This fuel can only be displayed as a label or a table by default it 
        //is a table
        _this.display = "tabular";
        // 
        //Set the columns names involved that.
        _this.col_names = _this.metadata.map(function (meta) { return meta.name; });
        return _this;
    }
    // 
    //Converts the static list of the records into barrels making them members of this 
    //array coz currently this array is empty. This method is also called when there 
    //is need to expand this array with more data hence the method is public and has an 
    //optional Ifuel with it
    fuel.prototype.activate = function (ifuel, start) {
        var _this = this;
        //
        //The records to be activated can either come from the constructor or as a 
        //parameter
        var records = ifuel === undefined ? this.records : ifuel;
        var offset = start === undefined ? this.offset : start;
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
            _this.set(map_index, new barrel(rec, _this, map_index));
        });
    };
    //
    //Construct the header row and append it to the thead.
    fuel.prototype.show_header = function (thead) {
        var _this = this;
        // 
        //paint these columns in a user defined form if set 
        //  
        //clear the current text content of the thead 
        thead.innerHTML = "";
        //
        //Header should look like this
        //The primary key column will also serve as the multi line selector
        //<tr>
        //  <th id="todo" onclick="select_column(this)">Todo</th>
        //        ...
        //</tr>
        //Construct the th and attach it to the thead.
        var tr = create_js_1.default(thead, "tr", {});
        // 
        // 
        //paint the header in the used defined format is isset 
        if (this.host.position !== undefined) {
            this.reorder(tr);
            return;
        }
        else {
            // 
            //For debuging and prove of concept 
            this.populate_order_section();
            //
            //2. Loop through each to create the table headers  matching the example above
            this.col_names.forEach(function (col_name) {
                //
                //Create the th element using this panel document with the column name as the
                //id and the text content 
                var th = create_js_1.default(tr, "th", {
                    id: "" + col_name, textContent: "" + col_name, onclick: function (evt) { return _this.host.select_column(evt); }
                });
            });
        }
    };
    // 
    //Paints the header in a user defined format 
    fuel.prototype.reorder = function (tr) {
        var _this = this;
        // 
        //Get the order of painting 
        var position = Object.keys(this.host.position);
        // 
        //sort the positions in an accending order 
        position.sort(function (a, b) { return a - b; });
        // 
        //paint using that order 
        position.forEach(function (pos) {
            // 
            //Get the cname at this position 
            var cname = _this.host.position[pos];
            // 
            // 
            create_js_1.default(tr, "th", { textContent: cname, onclick: function (evt) { return _this.host.select_column(evt); } });
        });
    };
    // 
    //Populate a table that allows user to enter the various positions on how they want the 
    //columns laid out in the display.
    fuel.prototype.populate_order_section = function () {
        var _a, _b;
        // 
        //Get the element where this table is to be displayed 
        var element = this.host.get_element("position");
        //
        //Create an element to display the column names allowing users to add any display
        //metadata.
        var tr = create_js_1.default(element, "tr", {});
        (_a = this.col_names) === null || _a === void 0 ? void 0 : _a.forEach(function (col) { return create_js_1.default(tr, "td", { textContent: col, contentEditable: "true" }); });
        //  
        //Add the tr for user interactions. 
        var tr2 = create_js_1.default(element, "tr", {});
        (_b = this.col_names) === null || _b === void 0 ? void 0 : _b.forEach(function (col, index) { return create_js_1.default(tr2, "td", { textContent: "" + index, contentEditable: "true" }); });
    };
    //
    //Ensure that the given tag is the only selected one 
    //of the same type
    fuel.select = function (tag) {
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
    //This fuel paints by looping through the barrels and painting it in a particular 
    //html element.
    //The offset shows from which index the barrel should start painting.
    fuel.prototype.paint = function (element, offset) {
        return __awaiter(this, void 0, void 0, function () {
            var start, el, Tag, index, bar;
            return __generator(this, function (_a) {
                start = offset === undefined ? this.offset : offset;
                el = element === undefined ? this.host.target : element;
                // 
                //If the display is tarbular paint the head and the tag is the tbody.
                if (this.display === "tabular") {
                    this.show_header(this.host.document.querySelector("thead"));
                    Tag = this.host.document.querySelector("tbody");
                }
                // 
                //If the display is tarbular create a div and attach it to the element 
                else {
                    Tag = create_js_1.default(el, "div", { className: "fuel" });
                }
                // 
                //Paint the fuel from the given offset 
                for (index = start; index < this.size; index++) {
                    bar = this.get(index);
                    if (bar === undefined)
                        throw new Error("barrel at offset " + offset + " is undefined");
                    //
                    //Allow every barrel to paint itsself
                    bar.paint(Tag);
                }
                return [2 /*return*/];
            });
        });
    };
    return fuel;
}(Map));
exports.fuel = fuel;
// 
//Models a complete record as retrieved from the database by a given sql.
//This barrel extends a map which stores all the tins inside indexing them by 
//"offset,cname" the offset they were retrieved with in the database and the 
var barrel = /** @class */ (function (_super) {
    __extends(barrel, _super);
    // 
    //To create a vessel we need the fuel
    function barrel(
    // 
    //This is the static collection of the tins as an object 
    items, 
    //
    //The bigger fuel collection
    parent, 
    // 
    //The offset of this barrel in the database 
    offset) {
        var _this = _super.call(this) || this;
        _this.items = items;
        _this.parent = parent;
        _this.offset = offset;
        // 
        //Activate these static tins into tins. This method talks to the 
        //server to obtain the tins metadata hence asynchronous executed 
        //using an iif function.
        _this.activate();
        return _this;
    }
    // 
    //The activation of the static tins to tins required population of its 
    //metadata this is incase these tins were derived from a random sql.
    barrel.prototype.activate = function () {
        // 
        //Construct the the collection of tins 
        for (var index = 0; index < this.parent.metadata.length; index++) {
            var col_matadata = this.parent.metadata[index];
            var colname = Object.keys(this.items)[index];
            var data = Object.values(this.items)[index];
            this.set(colname, new tin(this, col_matadata, data));
        }
    };
    // 
    //Paints this barrel by default as a table this method can be overidden to 
    //change the mode of display
    barrel.prototype.paint = function (el) {
        var _this = this;
        //
        //Set the anchor
        if (el instanceof HTMLElement)
            this.anchor = el;
        // 
        //Get the element to attach this display
        var element = el === undefined ? this.anchor : el;
        // 
        //Element used for the display of this barrel
        var tag;
        if (this.parent.display === "tabular") {
            // 
            //Create the element that represents this barrel by default this is a tr
            //any other format can overide this 
            tag = create_js_1.default(element, 'tr', { id: "r." + this.offset });
        }
        else {
            var elem = create_js_1.default(element, 'div', { id: "r." + this.offset, classname: "card" });
            tag = create_js_1.default(elem, "div", { className: "card-body" });
        }
        // 
        //Paint the tins in user defined format if specified
        if (this.parent.host.position !== undefined) {
            // 
            //Get the order of painting 
            var position = Object.keys(this.parent.host.position);
            // 
            //sort the positions in an accending order 
            position.sort(function (a, b) { return a - b; });
            // 
            //paint using that order 
            position.forEach(function (pos) {
                // 
                //Get the cname at this position 
                var cname = _this.parent.host.position[pos];
                // 
                //Get the tin in this position it must be defined
                var tin = _this.get(cname);
                // 
                //Paint the tin 
                tin === null || tin === void 0 ? void 0 : tin.paint(tag);
            });
        }
        else {
            //Loop through the tin appending each this element
            this.forEach(function (Tin) { return Tin.paint(tag); });
        }
        // 
        //Return the elemnt created.
        return tag;
    };
    return barrel;
}(Map));
exports.barrel = barrel;
// 
//this models the basic data
var tin = /** @class */ (function () {
    // 
    //The io that aids in the data entry of this tin;
    function tin(parent, meta_data, data) {
        this.parent = parent;
        this.meta_data = meta_data;
        this.data = data;
        this.name = this.meta_data.name;
        this.io = this.parent.parent.host.get_io(meta_data);
    }
    // 
    // 
    //Paint this tins content inorder to display it as a html
    //by default this  content is pasted at the 
    tin.prototype.paint = function (element) {
        // 
        //The element that represents this tins io 
        var El;
        // 
        //Create the tds which is the default display for a 
        //tin 
        if (this.parent.parent.display === "tabular") {
            El = create_js_1.default(element, "td", { className: "col " + this.name });
        }
        else {
            El = create_js_1.default(element, "div", {});
        }
        // 
        //Get the io 
        this.io.show(El);
        this.io.value = this.data;
        // 
        //Set the data to the respective ios
        // 
        //Return the default element created. 
        return El;
    };
    return tin;
}());
exports.tin = tin;
