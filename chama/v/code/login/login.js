//Get the schema and capture library for saving purpose.
//
//just after a user has logged in..do this,
//check dbase:get fed in user
//refence db
 
import{mutall} from "/schema/schema.js";
//
//Export function needed for saving purpose.
//
export{check_dbase,update_storage,cancel,save};
//Take us to the home page
function cancel(current_history){
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

//Update teh storage with the given milk item. Each item is an array with the 
//following components. [dbase, ename, cname, value]
function update_storage(item){
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
async function save(){
    //
    //
    const classname='\\capture\\record';
    //
    //
    const method='export';
    //
    //
    const data ={milk:output, format:'label'};
    //
     console.log(data);
    const result = await mutall.fetch(classname, method, data);
   
    console.log(result);
    //
    return result;
}

async function check_dbase(email) {
    //
    const user_input = {email};
    //
    //Make  a server request.
    const result = await fetch('http://localhost/chama/v/login/login.php', {
        method:'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(user_input)
    });
    console.log(await result);
}
            