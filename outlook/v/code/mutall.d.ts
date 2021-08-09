//Firebase dts is still not set up!!!!
var firebase;

//The following declarations are specific to the mutall library.
namespace mutall {
  //
  //Mutall label format for exporting data to a database.
  //The data has the following structure [dbname, ename, alias, cname, value].
  type dbname = string;
  type ename = string;
  type alias = Array<number>;
  type cname = string;
  type value = boolean|number|string;
  type label = Array<[dbname, ename, alias, cname, value]>;
  //
}
//
//
declare class mutall_error extends Error{
    //
    constructor(msg:string); 
}