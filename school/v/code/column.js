//
import * as server from "../library/v/code/server.js"

//
// Append a new column to the end of the current table.
export function append_column(){

    //A: Create the column on the view page

    //references the table created in html.
    const tbl = document.getElementById('my-table');

    //get the position where to insert the column
    const position=3;

    //Read each row to append the corresponding number of cells in the column.
    for(let i=0; i< tbl.rows.length; i++){

        //insert the cell at the requested position
        const cell=tbl.rows[i].insertCell(position);

        //Adding the text content to the cell
        cell.textContent='New Column';
    }
//Add the new column into Outlook
const sql = "ALTER TABLE apparent ADD COLUMN new_data varchar(50)";
    //Formulate the sql string
    //
    const dbase = app.current.dbase;
    //
    //table.add_column(){

        //
        dbase.entities["apparent"].columns[new_data]=new attribute(new_data);
    
    
    //Add more constraints to define the column

    
    // 
    //Execute the sql in the server
    server.exec("database",["db_test"],"query",[sql]);
}
alert("alert");