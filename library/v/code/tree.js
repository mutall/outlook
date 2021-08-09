"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
exports.browser = exports.leaf = exports.branch = exports.node = void 0;
// 
//Resolve the popup class used by the browser popup window 
var outlook = __importStar(require("outlook/v/code/outlook.js"));
//Modelling branches and leaves as nodes
var node = /** @class */ (function () {
    //
    function node(name, parent) {
        //
        //Save the properies of this node
        this.parent = parent;
        //
        //Every node has a name
        this.name = name;
        //
        //The id of this node comprises of two parts 
        //full name of the parend and the name of this node 
        //
        //The full name of the parent is either its path or the 
        //root folder  
        var parent_path = this.parent === null ? "/" : this.parent.path;
        // 
        //Set the full name of this node.
        this.path = parent_path + "/" + this.name;
        //
        //Save this node in the collection indexed by its full name.
        node.members.set(this.path, this);
    }
    //
    //Create a node, given the static version.
    node.create = function (Inode, parent) {
        //
        //Activate a branch
        if (Inode.class_name === "branch") {
            //
            //This must be a branch. Create one and return
            return new branch(Inode, parent);
        }
        //
        //Destructure the node to reveal the name, popultaion etc
        //
        //Return a leaf
        return new leaf(Inode, parent);
    };
    //
    //Highlights the selected node on the navigation panel and updates the content
    // panel (depending on the node type)
    node.select = function (elem) {
        //
        //0. Ensure the selection was done from the navigation panel
        //
        var nav = document.querySelector('#nav');
        //
        //1. Highlight the selected element
        //
        //1.1 Remove whatever was selected before, assuming that there can be only 1 selection
        //
        if (nav === null)
            throw Error('Navigation panel not found');
        //
        //Get the current selected element
        var selection = nav.querySelector('.selected');
        //
        //Remove the selection, if any
        if (selection !== null)
            selection.classList.remove('selected');
        //
        //1.2 Select the given element
        elem.classList.add('selected');
        //
        //2. Update the content panel, dependig on the node type.
        this.show_content_panel();
    };
    // 
    //The collection of all the nodes that are members 
    //of this tree 
    node.members = new Map();
    return node;
}());
exports.node = node;
//Modelling a branch as a node that has children.
var branch = /** @class */ (function (_super) {
    __extends(branch, _super);
    //
    //Use a static node to construct a branch (object)
    function branch(Inode, parent) {
        var _this = 
        //
        //Initialze the parent constructor
        _super.call(this, Inode.name, parent) || this;
        //
        //The icon filename to be used for  representing all branches
        _this.icon = "Normal.ico";
        //
        //Start populating the children prperty
        //
        //There must be a chidren property in the static node
        //
        //Get the children node
        var children = Inode.children;
        //
        if (children === undefined)
            throw new Error('This node is not a branch');
        //
        //Go through each child and convert it to a node
        _this.children = children.map(function (child) { return node.create(child, _this); });
        return _this;
    }
    //
    //Toggling is about opening the branch children (if they are closed) or closing
    //them if they are open.
    branch.toggle = function (name) {
        //
        //
        //Get the children node.
        var children_node = this.get_child_node(name);
        //
        //Esatblish if the children node is open
        var children_is_open = !children_node.hidden;
        //
        //Test if the childre brnch is open
        if (children_is_open) {
            //
            //Close them
            //
            //Hide the children node
            children_node.hidden = true;
        }
        else {
            //Open them
            //
            //Unhide the children node
            children_node.hidden = false;
        }
    };
    //Returns the chil html elemen of this node
    branch.get_child_node = function (name) {
        //
        var parent = document.querySelector(name);
        //
        if (parent === null)
            throw new Error("Node named " + name + " cannot be found");
        //
        var child_node = parent.querySelector('.children');
        if (child_node === null)
            throw new Error('Child node not found');
        //
        return child_node;
    };
    //Returns the html of branch
    branch.prototype.get_html = function () {
        //
        //leaf html
        var branch_html = "\n\n                <div id=\"" + this.path + "\" class=\"folder\">\n                    <div class=\"header\">\n                        <button  \n                            onclick=\"branch.toggle('" + this.name + "')\"\n                            class=\"btn\">+</button>\n                        <div onclick=\"node.select(this)>\n                            <img src=\"images/" + this.icon + "\"/>\n                            <span>" + this.name + "</span>\n                        </div>\n                    </div>\n                    <div class=\"children hide\">\n                        " + this.get_children_html() + "\n                    </div>\n                </div>\n               ";
        return branch_html;
    };
    //
    //Get the html of the children as a strin representation for display in a dom
    branch.prototype.get_children_html = function () {
        //
        //begin with an empty string for the children
        var html = "";
        //
        //loop through all the children adding their html to this string
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            //
            //adding the html by string concatenation
            var child_ = child.get_html();
            html += child_;
        }
        //
        //return the combined string
        return html;
    };
    return branch;
}(node));
exports.branch = branch;
//A leaf is a node that has no children
var leaf = /** @class */ (function (_super) {
    __extends(leaf, _super);
    function leaf(Inode, parent) {
        //
        return _super.call(this, Inode.name, parent) || this;
    }
    //The htl code for a leaf
    leaf.prototype.get_html = function () {
        return "\n            <div id=\"" + this.name + "\" class=\"file container\" onclick=\"node.select(this)>\n                <span>" + this.name + "</span>\n            </div>\n            ";
    };
    return leaf;
}(node));
exports.leaf = leaf;
// 
//A popoup quiz page for browsing the servers directory.
var browser = /** @class */ (function (_super) {
    __extends(browser, _super);
    // 
    function browser(
    // 
    //The target represents the type of the path to return
    //from this popup.
    target, 
    // 
    //This is the browser template  
    url, 
    // 
    //The static partialy enriched node 
    Inode, 
    //
    //This path defines those folders that will be enriched with  
    //children
    initial) {
        var _this = _super.call(this, url) || this;
        _this.target = target;
        _this.Inode = Inode;
        _this.initial = initial;
        return _this;
        // 
        //The two pannel
    }
    // 
    //Ensure that a user has selected a file or path. 
    browser.prototype.check = function () {
        //
        //Get the selected node
        var selected_div = this.document.querySelector(".selected");
        //
        //Reject this promise if no node is currently selected
        if (selected_div === undefined) {
            // 
            //Alert the user 
            alert("Please select a " + this.target);
            // 
            //Fail gracefully 
            return false;
        }
        //
        //Get the corresponding node 
        var selected_node = node.members.get(selected_div.id);
        //Get its full name 
        this.full_name = selected_node.path;
        // 
        //A successful selection
        return true;
    };
    // 
    //Return the selected full name. 
    browser.prototype.get_result = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.full_name];
            });
        });
    };
    // 
    //Show the pannels of this browser.
    browser.prototype.show_panels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var Node, html, nav, path_node;
            return __generator(this, function (_a) {
                Node = node.create(this.Inode, null);
                html = Node.get_html();
                nav = this.get_element("nav");
                // 
                //Change the inner html 
                nav.innerHTML = html;
                path_node = this.open_initial_path();
                // 
                //
                // 
                //Select the initial path.
                //(hopefully this paints the content panel)
                Node.show_content_panel();
                return [2 /*return*/];
            });
        });
    };
    // 
    //Unhide the children of the rich folders(branches). 
    browser.prototype.open_initial_path = function () {
        // 
        // Opening an initial path is valid only when 
        //when are one.
        if (this.initial === undefined)
            return null;
        // 
        //Get the initial (logical) node.
        var path_node = node.members.get(this.initial);
        //
        // Initialize the while loop.
        var Node = path_node;
        //
        //Loop through all the rich folders using this 
        //initial path and unhide their children.
        while (Node !== null) {
            // 
            //Test whether this node is a branch
            if (Node instanceof branch) {
                // 
                //Unhided this node's children.
                // 
                //Get the children html element. Its an immediate child of the 
                //the element identified by this node's path.
                var element = this.document
                    .querySelector("#" + Node.path + ">.children");
                // 
                //Unhide the element.
                element.classList.remove("hide");
            }
            // 
            //Update the looping node to its parent
            Node = Node.parent;
        }
        //
        return path_node;
    };
    return browser;
}(outlook.popup));
exports.browser = browser;
