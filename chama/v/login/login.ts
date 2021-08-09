//Get the schema and capture library for saving purpose.
//
//just after a user has logged in..do this,
//check dbase:get fed in user
//refence db
import {mutall} from "../../../schema/schema"
//
//Export function needed for saving purpose.
//
export{inner_working};
//Define the output type. i.e., the record to save
//const output = Array<string>;
class inner_working{
    //
    
    constructor(){
        //
    }
    //Take us to the home page
    public cancel(current_history:number):void{
    //
    //Get the home history length from the session storage.
    const hl = parseInt(sessionStorage['home_length']);
    //
    //Calculte the backward change to the home postion, i.e, delta.
    const delta = hl - current_history;
    //
    //Home is delta steps away (backwards).
    history.go(delta);
}

//Update the storage with the given milk item. Each item is an array with the 
//following components. [dbase, ename, cname, value]
private update_storage(item:Array<string>):void{
    //
    //Retrieve the milk from session storage
    const milk_str = sessionStorage['milk'];
    //
    //Unstringify the milk
    const milk = JSON.parse(milk_str);
    //
    //Add the item into the milk.
    milk.push(item);
    //
    //Change the milk back to json
    const milk_str2 = JSON.stringify(milk);
    //
    //Update the storage
    sessionStorage['milk']= milk_str2;   
}
async save(){
    //
    //
    const classname='\\capture\\record';
    //
    //
    const method= 'export';
    //
    //
    const record_to_save = {milk:Array, format:'label'};
    //
    const result = await mutall.fetch(classname, method, record_to_save);
    //
    //
    return result;
}

async check_dbase(email:string) {
    //
    const user_input = {email};
    //
    //Make  a server request.
    const result = await fetch('http://localhost/chama/v/login/login.php', {
        method:'POST',
        //header: {'Content-Type': 'application/json'},
        body:JSON.stringify(user_input)
        });
    }
}
            
