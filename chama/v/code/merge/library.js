/* global record */

'use strict';
//

//The super class for shared methods
class mutall{
    //
    //Simplifies the windows equivalent fetch method with the following 
    //behaviour.
    //1. If the fetch was successful, we return the result; otherwise the fetch 
    //fails with an exception.
    //2. The arguments are key/value pairs in the frmat {[key]:value, ...}
    //It returns the same as result as the method if the return_value is 
    //true; oherwse it returns the generated html
    static async fetch($class, $method, args=null, return_value=true){
        //
        //Verify that the class and method are defined as simple strings.
        if ($class==undefined){
            throw new mutall_error('Class not defined');
        }
        //
        if ($method==undefined){ 
            throw new mutall_error(`Method for ${$class} not defined`);
        }    
        //
        //Prepare to collect the data to send to the server
        const formdata = new FormData();
        //
        //Add to the form the class to create objets on the server
        formdata.append('class', $class);
        //
        //Add the methods to exceute on the class
        formdata.append('method', $method);
        //
        //Check if there are defined arguments.
        if (args!==null){
            //
            //Convert the arguments into an array of of key/value pairs, so that
            //the output looks likes: [[key1, value1], [key2, value2],...]
            const pairs = Object.entries(args);
            //
            //Loop through all the key value pair array and append pairs to formdata
            pairs.forEach(pair=>{
                //
                //Destructure the key/value pair
                const [key, value] = pair;
                //
                //If the value is an object then convert it to json string
                const value2 = typeof value === 'object' 
                    ? JSON.stringify(value)
                    : value;
                //
                //Add to form data
                formdata.append(key, value2);
            });
        }    
        //
        //Formulate the request, including the sql to send the form data using
        //a post mehod
        const init = {
            method:'post',
            body:formdata
        };
        //
        //Fetch and wait for the response, using the (shared) index file
        const response = await fetch('index.php', init);
        //
        //Get the text from the response. This can never fail
        const text = await response.text();
        //
        //Prepare to convert the text to json, setting ok to true if succesful
        //....
        let ok, result, html;
        //
        //The output is expected to be a json string that has the follwing 
        //patter: {ok, result, html} where result, if ok, is the data of 
        //available choices. The json might fail
        try{
            //Try to convert the text into json
            const output = JSON.parse(text);
            //
            //Destructure the output; the html go lost
            ({ok, result, html} = output);
       }
        //
        //Invalid json;this must be an error
        catch(ex){
            //
            //The returned text cannot be converted to a json sring; it msut be
            //an error
            ok=false;
            //
            result = text;
        }
        //
        //Test to see if the data retrival was successful or not. If not report 
        //the error.
        if (!ok)throw new mutall_error(result);
        //
        //Return the requested output
        return return_value ? result: html;
    }
    
}

//Our error extensions alters the user first.
class mutall_error extends Error{
    //
    constructor(msg){
        //
        //Alert us about this error
        const win = window.open();
        //
        win.document.write(msg);
        //
        //Throw the error as usual
        super(msg);
    }
}

//Is a mutall object that models a database class. Its key feature is the 
//collection of entities.
export class database extends mutall{
    //
    //A collection of entotes for this dataase
    entities=[];
    //
    //Construct the database from the given static database structure imported
    //from PHP
    constructor(static_dbase){
        //
        //Initialize the parent so thate we can access 'this' object
        super();
        //
        //Why does 'Object.assign(this, static_dbase)' complain about 'this'?; 
        let this_= this;
        //
        //Offload all the properties in the static structure o this new database
        Object.assign(this_, static_dbase);
        //
        //Activate the entities collection
        this.activate_entities();
    }
    //
    //Activate the static entities collection.
    
    activate_entities(){
        //
        //Loop through all the static entities and activate each one of them
        for(let ename in this.entities){          
            //
            let static_entity = this.entities[ename];
            //
            //Create the active entity, passing this database as the parent
            let active_entity = new entity(this, static_entity);
            //
            //Replace the static with the active entity
            this.entities[ename] = active_entity;
        }
    }
    //
    //present the database interms of ellipses for entities and lines for relations
    present() {
        //
        //Create the svg  element 
        const div = document.createElement('div');
        //
        //Append all the graphic in entities as children from the entities which 
        //contain a group with an ellipse, text and the attributes  
        for (let key  in this.entities){
            //
            //Get the entity referenced by the key
             let entity= this.entities[key];
             //
             //Get the presentation from the individual entities
             entity.present(div);
        }
        
       return div;
    }    
    //
    //Returns the entot if is found; otherwise it throws an exception
    get_entity(ename){
        //
        const entity = this.entities[ename];
        //
        if (entity === undefined){
            //
            throw new mutall_error(`Entity ${ename} is not found`);
        }
        else{
            return entity;
        }
    }
    
}

//An entity is a mitall object that models the table of a relational database
class entity extends mutall{
    //
    //Construct an entity using:-
    //a) the database to be its parent through the has-a hierarchy
    //b) the static information typically obtained using a s sever-side scripting
    //language, e.g. PHP
    constructor(dbase, static_entity){
        //
        //Initialize the parent so thate we can access 'this' object
        super();
        //
        //Offload the properties of the static structure (including the name)
        Object.assign(this, static_entity);
        //
        //The parent database where this entot is defiend
        this.dbase=dbase;
        //
        //Use the static data to derive javascript column objects
        this.columns = this.activate_columns();
        //
        //Define the sql used for uniquely identifying a record of this entity
        //in a friendly way. The result of this sql is used for driving a record
        //selector. The sql is derived when needed. 
        this.id_sql_ = null;
        //
        //Defne the identification index fields in terms of column objects. This
        //cannot be done at concstruction time (becase the order of building 
        //dataase.entities is not guranteed to follow dependency). Hense the 
        //use of a getter
        this.ids_ = null;
        //
        //This entity's relational dependency.
        this.dependency_ = null;
        //
        //fill all he entities with coodinates
        this.fill_coodinates();
        //
    }
    
    //
    //sets the oodinates both the cx and the cx 
    fill_coodinates(){
        //test if the comment is undefined
        if (this.comment.cx=== null || this.comment.cy === undefined){
         // Get the coodinates from a random value 
          this.cx= Math.floor(Math.random()*3000);
          this.cy= Math.floor(Math.random()*1200);
          //for deburging 
          this.color= 'green';
        //
        }
       //
       //Test if the coodinates are set else set a random value
       else{
            //Set the coodinates of the ellipse from the comment
           this.cx = parseInt(this.comment.cx);
           this.cy= parseInt(this.comment.cy);
           //for deburging        
            //Get the indexed column names
            const index_names = Object.values(this.indices);
            //
            //If red the entity does not have indexes
            if( index_names.length === 0){
               this.color="red"; 
            }
           //
           //If yellow the entity has indexes
           else{
             this.color= 'yellow';
           }
      }
        
    }

    
    //Activate the columns of this entity
    activate_columns(){
        //
        let columns = [];
        //
        //Loop through all the static columns and activate each of them
        for(let cname in this.columns ){
            //
            //Get the static column
            let static_column = this.columns[cname];
            //
            //Define a dynamic column
            let dynamic_column;
            switch(static_column.type){
                //
                case "primary": 
                    dynamic_column = new column_primary(this, static_column);
                    break;
                case "attribute": 
                    dynamic_column = new column_attribute(this, static_column);
                    break;
                case "foreign":
                    dynamic_column = new column_foreign(this, static_column);
                    break;
                default:
                    alert (`Unknow column type {static_column.type}`);
            }
         //
        //Replace the static column with the dynamic one
        columns[cname] = dynamic_column;
        }
        return columns;
    }
    
    //Defne the identification index fields in terms of column objects. This
    //cannot be done at concstruction time (becase the order of building 
    //dataase.entities is not guranteed to follow dependency). Hense the 
    //use of a getter.
    get ids(){
        //
        //Return a copy if the ides are already avaible
        if (this.ids_!==null) return ids_;
        //
        //Define ids from first principles
        //
        //Use the first index of this entity. The static index imported from 
        //the server has the following format:-
        //{ixname1:[fname1, ...], ixname1:[....], ...} 
        //We cont know the name of the first index, so we cannot access directly
        //Convert the indices to an array, ignoring the keys as index name is 
        //not important; then pick the first set of index fields
        const fnames = Object.values(this.indices)[0];
        //
        //Convert the field names to columns which habe the following format
        //{name1:column1, name2:col2, ...}
        const ids = fnames.map(fname=>this.columns[fname]);
        //
        //Return the idenfication columns.
        return ids;
    }
    
    //Get the sql used for uniquely identifying a record of this entity
    //in a friendly way. The result of this sql is used for driving a record
    //selector. The sql is derived when needed -- hence the getter. 
    get id_sql(){
        //
        //Return an old copy if it already exists
        if (this.id_sql_!==null) return this.id_sql_;
        //
        //Derive the sql from first principles.
        //
        //Compile all the entities referenced by the relations, starting with an
        //fresh map which tracks the associated measured relations for each
        //entity .
        const refs = new Map();
        //
        //Be careful that we don't get into an endless loop (due to bad data 
        //modelling), so use an empty stack to starck tracking visited relations. 
        const stack = [];
        //
        //Comple the referenced tables, refs, iteratively
        this.compile_id_refs(stack, refs);
        //
        //Use both this and the referenced tables in relations to formulate 
        //the id expression
        const idxp = this.get_idxp(refs);
        //
        //Use the relations to formulate the join expression
        const joinxp =this.get_joinxp(refs);
        //
        //Formulate a backticked entity name
        const ename = '`' + this.name + '`';
        //
        //Formulate and set the complete selector sql. Note the trailing space
        //after each clause. You may want to consider using lists, rather than
        //concantenation to address this issue.
        this.id_sql_ = 
            `select `
                //
                //Return the primary key field of teh selector
                +`${ename} as primarykey, `
                //
                //Add the user friendly identifier
                + `${idxp} as id `
            +`from `
                //This entoty drives the query
                + `${ename} `
                //
                //The joins are for needed for resolving references in the 
                //select expression
                + `${joinxp} `;
        //
        //Return the selector sql
        return this.id_sql_;
    } 
    
    
    //Review the records of this entity
    review(){
        //
        //There is a selected entity open a new window passing the entiy name and 
        //the current dbname as the argumnts 
        let $win = window.open(`page_record.php?ename=${this.name}&dbname=${this.dbase.name}`); 
        //
        //Set this database as a property of this window for access in the opened window 
        $win.__dbase__= this.dbase;
    }
    //
    //
    create_td(){
        //
        //Create a tr for creating a record in this entity 
        //'<tr onclick='record.select(this)' id='${this.name;}'></tr>';
        const tr = document.createElement('tr');
        tr.setAttribute('id',`${this.name}`);
        tr.setAttribute('onclick', 'record.select(this)');
        //
        //Loop through the columns appending td in each
        Object.values(this.columns).forEach(column=>{
            //
            //Append all the td generated at the column level that vary depending
            //on the type of the column.
            tr.appendChild(column.create_td());
        });
        //
        //return the tr
        return tr;
    }
    
    //
    //Update the records for this entity 
    async update(data){
       //
       //Get the primary key which is the index
       const pr= data[0];
       //
       //Get the column names 
       const columns= Object.values(this.columns);
       //"
       for(let i=0; i<data.length; i++){
        //
        //Formulate the update statement
       const sql = `UPDATE ${this.name} ${columns[i+1]}=${data[i+1]} where ${columns[0]}=${data[0]}`;
       }
       //Execute the sql in the server side 
       await mutall.fetch('database', 'query', {sql});

    }
    
     //Returns the relational dependency of this entity based on foreign keys
    get dependency(){
        //
        //Test if we already know the dependency. If we do just return it...
        if (this.dependency_!==null) return this.dependency_;
        //
        //...otherwise calculate it from 1st principles.
        //
        //Destructure the identification indices. They have the following format:-
        //[{[xname]:[...ixcnames]}, ...]
        //
        //Select the first index's colun names
        const ixcnames = Object.values(this.indices)[0];
        //
        //Get the foreign key column names used for identification.
        const columns = Object.values(this.columns).filter(column =>{
            //
            //Test if the column is foreign and is part of the identification index
            const x = column.constructor===column_foreign;
            const y = ixcnames.includes(column.name);
            return  x && y;
            }        
        );
        //
        //Test if there are no foreign key columns, return 0.
        if(columns.length === 0){
            this.dependency_ = 0;
        }
        else{
            //Map cname's entity with its dependency. 
            const dependencies = columns.map(column=>{
                //
                //Get the referenced entity name
                const ename = column.ref_table_name;
                //
                //Get the actual entity
                const entity = this.dbase.get_entity(ename);
                //
                //Get the referenced entity's dependency.
                return entity.dependency;
            });
            //
            //Get the foreign key entity with the maximum dependency, x.
            const max_dependency = Math.max(...dependencies);
            //
            //Set the dependency
            this.dependency_ = max_dependency + 1;
        }
        //
        //The dependency to return is x+1
        return this.dependency_;
    }
    //
    //Presents the content of an ellipse including the attributes 
    present(svg){
        //
        //set the radius of the elipse as rx and the ry while the dy is the diference
        //between text in a tspan
        const dy= 20, ry= 50;  
        //
        //Get the group which is a graphic representation of the ellipse and 
        //its attribute 
        this.group = this.get_group(ry); 
        //
        //Append  the attributes of an entity
        //
        //
        //Get all the column attributes contained in this entity 
        const attributes = Object.values(this.columns).filter(column=>{
           return column.constructor.name==='alterable_attribute';
        });
        //Get the number of the attributes in this entity 
        const count= attributes.length;
        //
        //create a text inorder to append all the attributes as a tspan
        let text= document.createElement('text');
        //
        //Set the attributes of the text
        text.setAttribute( 'x', `${this.cx}`);
        text.setAttribute( 'y',`${this.cy-dy*(count-1)-ry-dy}`);
        text.setAttribute( 'font-size', "30px");
        text.setAttribute( 'fill', "black");
        //text.setAttribute( 'id', "");
        //
        //Append the tspans from the column attributes
        attributes.forEach(column=>column.present(text, dy));
        //Append the text containing attributes to the entity group
        this.group.appendChild(text);
        //
        //Append the graphical entity group to the svg
        svg.appendChild(this.group);
        //
        //Append the this entity's relations' to the svg element as lines
        // 
        //Collect the foreign key columns for this entity.
        const columns = Object.values(this.columns).filter(column => {
            //
            //Test if the column is foreign and return  the condition
            return column.constructor.name==='alterable_relation';
        });
        //
        //loop through the foreign column and call the methord set line 
        columns.forEach(column=>{
            //invoke the function to set the line with the svg as a parameter
            column.set_line(svg);
         });
         //Test if the entity is visible to construct its group
        const visible= this.is_visible();
        //
        //continue with the presentation if true
        if (visible===false){
           this.group.classList.add( "hide");
        }
    }
    //
    //Test if the entity is visible or invisible as set by the user 
    //and sets the property  visible of this entity aas either true or false 
    is_visible(){
      //
      //Get the comment that contains the user inputs 
      const comment = this.comment.visible; 
      //
      //If it is set to true set the attribute of visibility to true
      if(comment==="true" || comment===true){
          //
          //Create a visible property of this entity and set it to true 
          this.visibility=false;
          return false;
      }
      //
      //if the cmment is undefined, null or even set to  false it is set to false 
      else {
          //
          //create a property of vsible 
          this.visibility=true;
          return true;
      }
    }
    //
    //Returns the  graphic group containig html ellipse (to represent an entity)
    //a text (which represents the name of the entity
    get_group(ry){
        //
        //Create teh group element
        const group= document.createElement('g');
        group.setAttribute('id', `${this.name}_group`);
        //
        //set the radii of the ellipse. 
        const rx =100; 
        //Populate the group tag with children
        group.innerHTML=
               //ellipse coodinates
                `<ellipse 
                    fill="${this.color}" 
                    cx="${this.cx}" 
                    cy="${this.cy}" 
                    rx="${rx}" 
                    ry="${ry}" 
                    id="${this.name}" 
                    class="draggable"
                    newx= "0"
                    newy= "0"
                    ondblclick="$page_graph.edit_selected()"
                /> </ellipse>`
                //Label the ellipse with the name of this entity
                +`<text  
                    x='${this.cx}' 
                    y='${this.cy}'
                    text-anchor='middle'    
                    fill='blue'  font-size ="35px"
                     id="_${this.name}"
                   >${this.name} 
                   
               </text>`;
       //
       //Return the group tag
       return group;
    }
    
    //Compile a map of all the entities (and her descendants) that are 
    //referenced by the identification relations of this entity. To avoid 
    //getting into an endless loop, we use a stack (list) to track visited 
    //relations. 
    compile_id_refs(stack, refs){
        //
        //Get the identification foreign key columns of this entity
        const relations = 
            this.ids.filter(relation=>relation instanceof column_foreign);
        //
        //Verify that none of these relations will lead to endless looping.
        //This ocurrs when the relation references a table which is a home to
        //one of the relations in the stack
        //
        //Collect all home entities from the stack.
        const homes = stack.map(relation=>relation.entity);        
        //
        //Test endless looping for each of the relations, stopping and reporting
        //the potential.
        relations.forEach(relation=>{
            //
            //Test whether the referenced entity is already a home in the stack
            if (homes.includes(relation.ref)){
                //
                //Formulate the relation name
                const rname = `{relation.entity.name}.{relation.name}`;
                //
                //Formulate the comma separated stack path, where r is a 
                //relation in the stack;
                const path = 
                    stack.map(r=>`{r.entity.name}.{r.name}`).join(", ");
                //
                //Compile error message
                const msg = 
                `This relation {rname} will cause path {path} to be cyclic`;
                //
                //This is a poor modelling error. Let the user now 
                alert(msg);
                //
                //...let the programmer know.
                throw new Error(msg);
            }
            //
            //There is no looping
            //
            //Add the relation to the refs map, incluidng the (stack length) 
            //distance from the originating entity. The map is indexd by entity
            //relation.ref which was derievd from ref_table_name.
            relation.add_to_refs(refs, stack.length);
        });
        //
        //Continue compiling the immediate descendants of this entity.
        relations.forEach(relation=>{
            //
            //Add this relation to the stack for the next iteration
            const new_stack = [...stack, relation];
            //
            //Use the relations referenced entirt to do a re-compile.
            relation.ref.compile_id_refs(new_stack, refs);
    
        });
        
    }
    
    
    //Use the given map of referenced entities to formulate the innner join 
    //expression whose component parts have the following format:-
    //INNER JOIN ref ON home1.ref = ref.ref AND home2.ref = ref.ref...
    //where homei is the i'th entity that is the home of some relation.
    get_joinxp(refs){
        //
        //Convert the map to an array which has the following format:-
        //[[entity, {relations:relations, distance:distance}], [...], ...]
        const refs_array = [...refs.entries()];
        //
        //Sort the referenced entities, ordering them by the maximum distance of 
        //the entity  meaured from this one
        refs_array.sort((ref1,ref2)=>{
            //
            //Destructre ref1 and 2 to reveal the maximum distanace of the
            //referenced entity from this one. The entity and relations are
            //immaterial. Ref has the structure: [entity, {relations, distance}]
            const 
                //Ignnore the destrucctered entity and relation.
                [, {distance:distance1}] = ref1,
                [, {distance:distance2}] = ref2;
            //
            //Return the comparison, negative, 0 or positive.
            return distance1 - distance2;
        });
        //
        //Use the sorted referenced entities to build the join expression from
        //'anded' sub-expressions.
        const joinxp = refs_array.map(ref_member=>{
            //
            //Destructure the ref to reveal the referenecd entity, the relations
            //that reference it, and the maximium distance of the entity from 
            //this one
            const [entity, {relations, distance}]  = ref_member;
            //
            //Formulate the referenced entity name, backticked ready for use
            //in an sql statement
            const ref =  "`" + entity.name + "`";
            //
            //Use the relations to formulate 'ands' sub-expressions
            const ands = relations.map(relation=>{
                //
                //Formulate the 'and' subexpression
                //
                //Get the entity that is the home of the relation
                const home = "`" + relation.entity.name + "`";
                //
                //Formulate the and sb-expession. 
                const and = `${home}.${ref}=${ref}.${ref}`;
                //
                //Return teh and
                return and;
                //
                //Separate the sub-expression with the AND operator 
            }).join(' AND '); 
            //
            //Formulate and return the join expression
            return `inner join ${ref} on ${ands}`;
        //
        //Use a hard return to separate the joinxps tto form the complete 
        //expression.
        }).join("\n");
        //
        //Return the complete join expression.
        return joinxp;
    }
    
    //Use this entity and those in the given referenced entity map to formulate 
    //the identification expression for this entity
    get_idxp(refs){
        //
        //Add this entity to those, i.e., the keys, of reference map. (Recause
        //the ref map is indecxed by entities).
        const entities = [this,...refs.keys()];
        //
        //Convert each entity into an sub-id formulated from aattributes only, 
        //joining the sub-ids with a slash(/) separator
        const id_parts = entities.map(entity=>{
            //
            //Get the identification columns of the entity. Remember that 
            //column is an object (not an array)
            const columns = Object.values(entity.ids);
            //
            //Select the attributes only
            const attributes = 
                columns.filter(column=>{
                    //
                    //The 1st condition for an identifer is that the column 
                    //is an attribute
                    let cond = column instanceof column_attribute;
                    //
                    //The 2nd condition is that column's input is not a boolean.
                    cond = cond && !(column.input instanceof input_checkbox);
                    //
                    return cond;
            });
            //
            //Formulate the attributes sub-exptession. The structure of the 
            //desired expresion is 
            //  concat(fname1, "-", fname2, "-", ...)
            //where teh dash(-) is used to separatte the sub-expresion components
            const subxp = attributes.map(attr=>{
                //
                //Formulate the field name from the entity and column names. We
                //need the sql expression like : `client`.`name`. Using plus(+) 
                //to concatenation confuses dot (.) as a number -- leading to
                //Nan -- hence the use of the concat function. 
                const fname = "".concat(
                    "`", entity.name, "`"
                    ,"."
                    , "`",  attr.name,  "`"
                );
                //
                //Return the formated field name
                return fname;
            //
            //The saparator is ', "-", '
            }).join(', "-", ');
            //
            //Return the sub expression
            return subxp;
        });
        //
        //Filter the empty bits; the separate the subexpressions with 
        //the pattern: ', "/", '
        const idxp = id_parts.filter(x=>x!=="").join(', "/", ');
        //
        //The returned expression is a concat function of the derived expression
        return `concat(${idxp})`;
    }
}

//Modelling the column of a table. This is an absract class. 
class column extends mutall{
    //
    //The class constructor that has entity parent and the json data input 
    //needed for defining it. Typically this will have come from a server.
    constructor(parent, static_column){
        //
        //Initialize the parent so thate we can access 'this' object
        super();
        //
        //Offload the stataic column properties to this column
        Object.assign(this, static_column);
        //
        this.entity = parent;
        //
        //Primary kys are speial; we neeed to identofy thm. By default a column
        //is not a primary key
        this.is_primary = false;
        //
        //The visible view of a is defined to be null. It cannot be set duriing
        //construction because we don't have the data to view yet.
        this.view=null;
    }
    
    //
    //Displays a column in the label format 
    display(body){
        //
        //Create the label tag as a view since it is the visible layout of the column
        this.view = document.createElement('label');
        //
        //The text content is the name of this column
        this.view.textContent = this.name;
        //
        //Get the proper input for this column eg text, checkbox, button, ant the text area
        let input = this.get_input();
        //
        //Make the input visible
        this.view.appendChild(input);
        //
        //
       //Append the label to the body
        body.appendChild(this.view);
    }
    //
    //This is an abstract class, so, the column extensions must defined their 
    //values
    get value(){
        throw new Error(`This column ${this.name} must define how it gets its value`);
    }
    
    //Returns the value of a column fom the given values. This is valid only
    //for attributes ad foreign keys
    lookup_value(values){
        throw new Error('Canot lookup value of column '+ this.name);
    }
        
}

//Modelling the non user-inputable primary key field
class column_primary extends column{
    //
    //The class contructor must contain the name, the parent entity and the
    // data (json) input 
    constructor(parent, data){
        //
        //The parent colum constructor
        super(parent, data);
        //
        //This is a primary key; we need to specially identify it.
        this.is_primary = true;
    }
    
    //Primary columns are not dislayes
    display(body){}
    inputs(body){}
    
    //
    //
    //
    //popilates the td required for creation of data as a button with an event listener 
    create_td(){
        //
        //Create the td to be returned
        const td= document.createElement('td');
        //
        //Set the attributes
        td.setAttribute("name", `${this.name}`);
        td.setAttribute("type", `primary`);
        td.textContent=``;
        //
        return td;
    }
    
}

//This class models colums to which the user can input data, it excludes 
//that for managing for primary keyis.
class column_input extends column{
    //
    constructor(parent, data){
        //
        //The parent constructor
        super(parent, data);
        //
        //Set the input type of this attribute using its name and size. This
        //is what makes this column different from others. 
        //The input class is simply a wrapper of a basic element needed for
        //supporting data entry/display for this column. It is used together
        //with the create view method
        this.input = this.get_input();
        //
        //The view of is a (complex) dom element comprising of a span and input
        //children. To mak it visible, it must be attached to some parent; 
        //otherwise de-tach it
        this.view=this.create_view();
    }
    
    //Create the view of an input column, which is a dom element comprising of 
    //a span and input children. To make it visible, it must be attached to 
    //some parent; otherwise detach to hide it.
    create_view(){
        //
        //The view of a column is a dom labl label element with 2 children
        const view = document.createElement('label');
        //
        //The first view child is a span of the column name. 
        const span = document.createElement('span');
        //
        //Append the span to the label and set its content to this column's name.
        //Eventually the name it will be replaced with a more friendly title .
        view.appendChild(span).textContent = this.name;
        //
        //The second view element is obtained from this column's input wrapper.
        //
        //Get the dom element of this input object
        const element = this.input.element;
        //
        //Append the element to this column's view
        view.appendChild(element);
        //
        //Retur the view
        return view;
    }
    
}

//Modellig foreign key field as an inputabble column.
class column_foreign extends column_input{
    //
    //Construct a foreign key field using :-
    //a) the parent entity to allow navigation throuhgh has-a hierarchy
    //b) the static (data) object containing field/value, typically obtained
    //from the server side scriptig using e.g., PHP.
    constructor(parent, data){
        //
        //Save the parent entity and the column properties
        super(parent, data);
        //
        //The referenced entity of this relation will be determined from the 
        //referenced table name on request, i.e., using a getter. Here we only
        //define the property so that it is visible from the navigator.
        this.ref; 
    }
    //
    inputs(body){
        //
        //Create the label tag as a view since it is the visible layout of the column
        this.view = document.createElement('label');
        //
        //The text content is the name of this column
        this.view.textContent = this.name;
        //
        //Get the proper input for this column eg text, checkbox, button, ant the text area
        let input = document.createElement('button');
        //
        //Make the input visible
        this.view.appendChild(input);
        //
        //
       //Append the label to the body
        body.appendChild(this.view);
    }
    //
    //Returns the type of this relation as either a has_a or an is_a inorder to 
    //present diferently using diferent blue for is_a and black for has_a
    get_type(){
       //
       //Test if the type is undefined 
       //if undefined set the default type as undefined 
       if(this.comment.type===undefined || this.comment.type===null){
           //
           //set the default value 
           const type= 'has_a';
           return type;
       }
       //
       //There is a type by the user return the type
       else{
           const type= this.comment.type.type;
           return type;
       }
    }
    //
    //relation presentation 
    set_line(svg){
        const comment = this.comment;
         //create a circle to show the start of the relation
        const circle =document.createElement('circle');
        //
        //
        //Get the referenced entity 
        const end_entity = this.entity.dbase.entities[this.ref_table_name];
        //
        //create the start and the end entities using  kev intersection format
        //
        //Define the coordinates of the ellipse centers for the start  
        const start = new KldIntersections.Point2D(this.entity.cx, this.entity.cy);
        //
        //plot the ellipse using the kld intersectiion library 
         const end = new KldIntersections.Point2D(end_entity.cx, end_entity.cy);
         //
         //Ploting the intersections using the kev_intersection library 
         const start_ellipse = KldIntersections.ShapeInfo.ellipse(start.x, start.y, 100, 50);

         //Define the end ellipse
         const end_ellipse = KldIntersections.ShapeInfo.ellipse(end.x, end.y, 100, 50);
         //
         //Draw a line from the center of circle 1 to t
         const line = KldIntersections.ShapeInfo.line(start.x, start.y, end.x, end.y);
         //
         //Get the intersections of the line and circles
         const intersection1 = KldIntersections.Intersection.intersect(start_ellipse, line);
         const intersection2 = KldIntersections.Intersection.intersect(end_ellipse, line);
         //
         //Retrieve the intersection points, p1 and p2
         const p1 = intersection1.points[0];
         const p2 = intersection2.points[0];
         //
         //deburging
         //    console.log(`the intesection ${p1} at ${this.entity.name}and ${p2} at ${this.ref_table_name}`);
         //
         //Construct the line tag
         this.line = document.createElement('line');

         //
         //set the line attributes
         if (p1===null || p1===undefined){
             console.log(`similar coordinates at ${this.entity.name} and ${this.ref_table_name} ` );
             //
             //no presentation of the line will take place
         }
         //
         //If the coordinates are correctly alligned with no similarity present the relation
         else{
            this.line.setAttribute('x1', p1.x);
            this.line.setAttribute('y1', p1.y);
            this.line.setAttribute('x2', p2.x);
            this.line.setAttribute('y2', p2.y);
            this.line.setAttribute('class', 'static');
            this.line.setAttribute('id', `${this.entity.name}.${this.ref_table_name}`);
            //
           //set the attributes of the circle
           circle.setAttribute('cx',p1.x);
           circle.setAttribute('cy',p1.y);
           circle.setAttribute('r', '10');
           circle.setAttribute('fill', 'green');
           circle.setAttribute('id', `${this.entity.name}_${this.ref_table_name}`);
           //
           //Get the type of the relation so as to give a stroke color to it
           const type= this.get_type();
           if (type==='is_a'){
               this.line.setAttribute('stroke', 'red');
           }
           //
           //
           else{
               this.line.setAttribute('stroke', 'black');
           }
            //
            //Append the line and circle to the svg
            svg.appendChild(this.line);
            svg.appendChild(circle);
         }
       const visible=end_entity.is_visible();
        //
        //Test if the referenced entity is visible
        //If visible continue with the presentation 
        if (visible===false){
            this.line.classList.add( "hide");
            circle.classList.add("hide");
        } 
        const vis=this.entity.is_visible();
       //
       if (vis===false){
            this.line.classList.add( "hide");
            circle.classList.add("hide");
        } 
    }
           
    //The referenced entity of this relation will be determined from the 
    //referenced table name on request, hence the getter property
    get ref(){
        //
        //Let n be table name referenced by this foreign key column.
        const n = this.ref_table_name;
        //
        //Return the referenced entity using the has-hierarchy
        return this.entity.dbase.entities[n];
    }
    
    //Returns the input of a foreign key field as a clickable button
    get_input(){
        //
        //Create an input object based on the input element. Note the the proper
        //use of the dollar($) to distinguish variables from classes
        const $input = new input('input');
        //
        //The input element of a foreign key is a button
        $input.element.setAttribute('type', 'button');
        //
        //Add the click listener to the input button to enable capturing of 
        //foreign key data.
        $input.element.addEventListener('click', async()=>{
            //
            //Get the basic identification sql from the reference entity.
            const sql = this.ref.id_sql
                //
                //Add support for pagination. 
                +` limit 10 offset 1`;
            //
            //Select a record from all this column's entity records
            const output = await column_foreign.select_record(this, sql);
            //
            //Destructure the output were ok is a bollean indicator, primary key
            //is ovios and id is the identication name expression of the 
            //selected record.
            const {ok, primarykey, id} = output;
            //
            //Test the selection was successful (or canceled). Do nothing if it 
            //was canceled.
            if (ok){
                //
                //The Output is a vailid selection. Update this foreign key column
                //
                //Set the column's value
                this._value = primarykey;
                //
                //Set the visible button's value to teh retrned id;
                $input.value = id;
            }
        });
        //
        //Return the input variable (not class)
        return $input;
    }  
    
    //Select a record (from the given database name using the given sql) from a 
    //list and return both its primary and identification keys if successful.
    static async select_record(relation, sql){
        //
        //Assuming the user is already logged in, add the database name to open 
        //on the server
        const name = relation.entity.dbase.name;
        //
        //Fetch and wait for the response, using the (shared) index file
        const result = await mutall.fetch('database', 'get_sql_data', {name, sql});
        //
        //Use the result -- which ian array of records whose member structiire is
        //{primarykey, id} where the properties are the two key pieces 
        //of a record identifier -- the primary key value and its user friendly
        //representtaion.
        const selection = await column_foreign.get_selection(relation, result);
        //
        //Return the selection, which has the formaat: {ok, primarykey, id}
        return selection;
    }
    
    //Use a selector page to choose and return a record from this foreign 
    //key's referenced table. The choice is an array of the the 2 key 
    //identifiers of a record: its primary key value and the user friendly version
    static async get_selection(relation, choices){
        //
        //Open a new window with a popup-size specifications.
        const win = window.open("page_selector.php");
        //
        //Define a selection window property. Do not interfere with the normal
        //window propeties -- hence the symbol approach which is guaranted to
        //be a unique identiier. All functions defiend within this one have 
        //access to the symbol. 
        const selection = Symbol('selection');
        //
        //Add a window load listener and wait for the load.
        await (async()=>new Promise(resolve=>win.onload = resolve))();
        //
        //When a selection is made, the user clicks on the return field of
        //the page selector. The current seletion is set on the window object
        //
        //Get the return field button
        const return_field = win.document.querySelector('#return_field');
        //
        //Add the the clck listener to the return field
        return_field.onclick = ()=>{
            //
            //Get the current table row
            const tr = win.document.querySelector('[current]');
            //
            //Retrieve the primary key and id
            const primarykey = tr.getAttribute('primarykey');
            //
            //The id is the text content of the first child of the tr
            const id =tr.children[0].textContent;
            //
            //Set it to the window
            win[selection]={primarykey, id};
            //
            //Now close teh window.
            win.close();
        };
        //
        //Get the article tag of the selector page for attaching the selecetion
        //choices
        const article = win.document.querySelector('article');
        //
        //Attach a table tag to the article
        const table = win.document.createElement('table');
        article.appendChild(table);
        //
        //Attach a header row to the table. 
        const tr = win.document.createElement('tr');
        table.appendChild(tr);
        //
        //There will be as many header fields as the columns of the reference 
        //table of teh given relation, i.e., foreign key field.
        for(const column in relation.ref.columns){
            //
            //Create a header field
            const td = win.document.createElement('th');
            //
            //Set its text content of the name of the column
            td.textContent = column.name;
            //
            //Attach the td to the tr
            tr.appendChild(td);
        };
        //
        //Loop through the record choices  and attach each one of them to the 
        //table.
        choices.forEach(row=>{
            //
            //Formulate a dom record from the row of values
            //
            //Desctructure the row values to recognise the primary and id keys
            const {primarykey, id} = row;
            //
            //Create a tr element
            const tr = win.document.createElement('tr');
            //
            //Set the primary key of the table row
            tr.setAttribute('primarykey', primarykey);
            //
            //The tr is also selectatble and once selected it makes it current
            tr.onclick = ()=>{
                //
                //Remove current attribute from all the trs
                //
                //Set his tr as current
                tr.setAttribute('current', 'true');
                
            };
            //
            //Create a td element
            const td = document.createElement('td');
            td.textContent = id;
            //
            //Attach the td to tr
            tr.appendChild(td);
            //
            //Attach the record element to the table
            table.appendChild(tr);
        });
        //
        //Wait for user to close the selector window
        await (async()=>new Promise(resolve=>win.onbeforeunload=resolve))();
        //
        //Test if teh user made a selection or canceled the process
        if (typeof win[selection]!=='undefined'){
            //
            //Destructrure the window selection
            const {primarykey, id} = win[selection];
            //
            //A selection was done. return it
            return {ok:true, primarykey:primarykey, id:id};
            
        }else{
            //
            //The selection was cancelled. Return false
            return {ok:false};
        }
    }
    
    //The value of a foreign key is stored locally
    get value(){
        return this._value;
    }
    
    //
    //popilates the td required for creation of data as a button with an event listener 
    create_td(){
        //
        //Create the td to be returned
        const td= document.createElement('td');
        //
        //Set the inner html of this td 
        td.setAttribute('type', 'foreign');
        td.setAttribute('name', `${this.name}`);
        td.setAttribute('ref', `${this.ref_table_name}`);
        td.setAttribute('id', `0`);
        td.setAttribute('title', `["0",null]`);
        td.setAttribute('onclick', `record.select_td(this)`);
        //
        //Set the text content to the name of this column 
        td.textContent=`${this.name}`;
        //
        //return the td
        return td;
    }
    
    //The value of a foreign key is stored locally
    set value(value){
        this._value=value;
    }
    
    //Add this relation to the given map of referenced entities and their 
    //measured relations
    add_to_refs(refs, new_distance){
        //
        //Check if the entity refereced by ths relatiion exists in the map
        if(refs.has(this.ref)){
            //
            //The key exists: update it
            //
            //Retrieve the map value
            const value = refs.get(this.ref);
            //
            //Destructure to retrieve the relatoins and overall distance of 
            //the referenced entity
            const {relations, old_distance} = value;
            //
            //Update the old distance to the new one, if the new one is greater
            //than the old one
            const new_distance = 
                new_distance>old_distance ? new_distance:old_distance;
            //
            //Update the map
            refs.set(this.ref, {relations:[...relations, this], distance:new_distance});
        }
        //
        //The key is new. Add the relation as teh fist mebmber of a list
        //and the initial entoty distance. It will be updated as we add other
        //relations that reference the indexing entty, this.ref
        else{
            refs.set(this.ref,{relations:[this], distance:new_distance});
        }
    }
    
    //
     //Returns the value of a column fom the given values. This is valid only
    //for attributes ad foreign keys. See method save_2_dbaase()
    lookup_value(attributes, result){
        //
        //A match was found. Return the value
        result.value = {type:'foreign', text:this.ref_table_name};
        return true;
    }
    
    //Returns true if the referecced table name of tis foreign key field is
    //mentioned in the inputs where
    //inputs = [{ename, values}, ...]
    //Ignore the attribut names as it is relevat only for attribute fields
    is_mentioned(inputs, attr_names){
        //
        //Get the referenced table entity anme
        const ename = this.ref_table_name;
        //
        //Find any input which matches the reference table name  
        const input = inputs.find(input=>input.ename === ename);
        //
        //This column is mentione if the matching input can be found
        return input!==undefined;
    }
}
    
//Its instance contains all (inputable) the columns of type attribute 
class column_attribute extends column_input{
    //
    //The column must have a name, a parent column and the data the json
    // data input 
    constructor(parent, data){
        //
        //The parent constructor
        super(parent, data);
    }
    //
    //Returns the attribute as a graphical tspan for presentation purposes
    present(text, dy){
        //
        //Create a tspan and set all the attributes
        const tspan= document.createElement('tspan');
        tspan.setAttribute('dy', dy);
        tspan.setAttribute('x', this.entity.cx);
        tspan.setAttribute('id', `${this.entity.cx}.${this.name}`);
        tspan.textContent= this.name;
        //
        //Apend the tspan to the text
        text.appendChild(tspan);
    }
    inputs(body){
        //
        //Create the label tag as a view since it is the visible layout of the column
        this.view = document.createElement('label');
        //
        //The text content is the name of this column
        this.view.textContent = this.name;
        //
        //Get the proper input for this column eg text, checkbox, button, ant the text area
        let input = this.get_input();
        //
        //Get the input element
        let input_tag= input.element;
        //
        //Make the input visible
        this.view.appendChild(input_tag);
        //
        //
       //Append the label to the body
        body.appendChild(this.view);
    }
    //Returns the input object of this attribute column depending on its name 
    //and size.
    //Returns the input object of this attribute column depending on its name 
    //and size.
    get_input(){
        //If the column name has a is_ prefix, then assume it is a checkbox
        if(this.name.startsWith('is_')){
           return new input_checkbox();
        }
        //
        //If the field length is 1 characater, then assume it is a checkbox
        if(this.length===1){
           return new input_checkbox();
        }
        //
        //If the length is more than 100 characters, then assume it is a textarea
        if(this.length>100){
           return new input_textarea();
        }
        //If the column name is 'description', then its a text area
        if(this.name==='description'){
           return new input_textarea();
        }
        //
        //By default a column is an unspecialised input
        return new input();
    }
    
    //The value of an attribute comes directly from its input
    get value(){
        return this.input.value;
    }
    
    //
    //popilates the td required for creation of data as a button with an event listener 
    create_td(){
        //
        //Create the td to be returned
        const td= document.createElement('td');
        //
        //Set the inner html of this td 
        td.setAttribute('type', 'attribute');
        td.setAttribute('name', `${this.name}`);
        td.setAttribute('onclick', `record.select_td(this)`);
        td.innerHTML='<div contenteditable tabindex="0"></div>';             
        //
        return td;
    }
    
    
    
    //Returns the value of a column fom the given values. This is valid only
    //for attributes ad foreign keys. See method save_2_dbaase()
    lookup_value(attributes, result){
        //
        //Find a value that matches the name of this column
        const found = attributes.find(attribute=>{
            //
            //Destructure the attribute to reveal its name
            const {attrname} = attribute;
            return attrname===this.name;
        });
        //
        //Do we requre to format the value, strings as quoted and numbers not?
        //NO. SELECT * where X=1 is the same as SELECT * where X='1' 
        //
        if (found!==undefined){
            //
            //A match was found. Return the value
            result.value = {type:'attribute', text:found.value};
            //
            return true;
        }
        else{
            return false;
        }
    }
    
    //Returns true if this attribute's name is mentioned in the given attribute 
    //names. Ignore the inputs; is needed for resolving foreign key fields.
    is_mentioned(inputs, attr_names){
        return attr_names.includes(this.name);
    }
    
}

//This class supports capturing and displaying of data for a column using a
//input or textarea element.  
class input extends mutall{
    //
    //Create an html element by the given tag name. The defaukt is input
    constructor(name='input'){
        //
        //Initialize the parent so thate we can access 'this' object
        super();
        //
        //Define the named element, typically an input or text area
        const element = document.createElement(name);
        //
        //By default, the type is text
        element.setAttribute('type','text');
        //
        //Set the input element
        this.element = element;
    }
    
    //Setting the value of an element
    set value(value){
        this.element.value = value; 
    }
    
    //getting teh value of teh element
    get value(){
        return this.element.value; 
    }
    
    
}

//Text area models variable length inputs
class input_textarea extends input{
    //
    constructor(){
        super('textarea');
    }
    
    //Set the value of a text area
    set value(value){
        this.element.textContent = value; 
    }
    
    //Get the value of a text area
    get value(){
        return this.element.textContent; 
    }
    
}

//Modelling the (boolean) input checkbox
class input_checkbox extends input{
    //
    constructor(){
        //
        super('input');
        //
        //Override the type attribute of the super input element
        this.element.setAttribute('type', 'checkbox');
    }
    
    //Setting a ceheckbox value
    set value(value){
        //
        if (value){
            //
            //Set the checked attrubute
            this.element.setAttribute('checked', 'true');
        }
        else{
            //
            //Remove the checked attribute
            this.element.removeAttribute('checked');
        }
    }
    
    //The value of a checkbox depends on the check status
    get value(){
        return this.element.is_checked?  1: 0;
    }
    input(){
       return  this.element;
    }
}
