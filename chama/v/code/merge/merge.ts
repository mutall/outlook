<<<<<<< HEAD
//To support declaration for the classes needed by this code that
//are implemented in php. In future these classes will 
//be locally (rather than globally) maintained.
import * as lib from "../../../../library/v/code/library";
//
//The classes in this file are auto-generated and support implemetations
//of php methods
import * as php from "./php.js";
//
export default class merger extends php.merger {
    //
    //The 2 sqls that drive he merging process
    public principal?:lib.sql;
    public minors?:lib.sql;
    //
    constructor(imerge?:lib.Imerge){
        super(imerge);
        if (imerge==undefined) this.imerge = this.get_imerge();
=======
//To support data types for this project. In future these data tyoes will 
//be locally maintained
import * as lib from "../../../../library/v/code/library";
//
//To support running of php code from javascript
import * as server from "../../../../library/v/code/server.js";
//
export default class merger implements lib.Imerge {
    //
    //Implementation of te Imebre interface
    public dbname: lib.dbname;
    public ename: lib.ename;
    public members:lib.sql;
    //
    //The 2 sqls that drive he merging process
    public principal?:lib.sql;
    public minors?:lib.sql;
    //
    constructor(imerge:lib.Imerge){
        //
        this.dbname = imerge.dbname;
        this.ename = imerge.ename;
        this.members = imerge.members;
    }
    //The main merge process
    static async run():Promise<void>{
        //
        //Get the members to merge
        const imerge:lib.Imerge = merger.get_imerge();
        //
        //Create the merger object
        const m = new merger(imerge);
        //
        //Execute the merge
        await m.execute();
>>>>>>> d6f602ee62ba568a442aa77bc3420888897c8091
    }
    //
    //Get the details of the members to merge
    get_imerge(): lib.Imerge{
        //
<<<<<<< HEAD
        //Get the dbname from the curret window document
        const dbname:string = (<HTMLInputElement>this.get_element('dbase')).value;
        //
        //Read the reference entity name
        let ename:string=(<HTMLInputElement>this.get_element('ename')).value;;
        //
        //Read the members sql
        let members:lib.sql=(<HTMLInputElement>this.get_element('member')).value;;
        //
        return {dbname, ename, members}; 
    }
    
    //
    //Merge the members of this object
    public async execute():Promise<void>{
        //
        //From the members identify the principal and the minor players.
        const players = await this.get_players();
=======
        //From the members identify the principal and the minors
        const players: {principal:lib.sql,minors:lib.sql}|null
            = await server.exec("merger",[this],"get_players",[]);
>>>>>>> d6f602ee62ba568a442aa77bc3420888897c8091
        //
        //Proceed only if the players are valid
        if(players === null){
          this.report("Merging is not necessary");
          return;
        }
        //
        //There is are principal and minor members, therefore, merging is 
        //feasible.
        //
        //Destructure the player to access the principal and the minor
        //members
        const {principal, minors}= players;
        //
        //Save the principal and minors to this object for referencing 
        //elsewhere.
        this.principal= principal;
        this.minors= minors;
        //
<<<<<<< HEAD
        //Get the interventions
        const interventions = await this.consolidate();
=======
        //Consolidate all the member properties to the principal
        const consolidations: Array<{cname:lib.cname,value:lib.basic_value}>
            =await this.consolidate();
        //
        //Remove the minors
        await this.clean_minors(consolidations);
    }
    //
    //Collect and reconcile all the data that is distributed among the members
    // and save it in one place, the principal
    public async consolidate(): Promise<Array<{cname:string, value:lib.basic_value}>>{
        //
        //1.Collect the values to consolidate
        const all_values:lib.sql = await server.exec("merger",[this],"get_values",[]);
        //
        //2. Separate the conflicts from the clean values
        const {clean, conflicts}= await server.exec("merger",[this],"get_conflicts",[]);
        //
        //Lets start by assuming there are no conflicts and hence there are no interventions
        let interventions: lib.interventions =[];
        //
        //Test if there is any data that requires manual merging/intervention
        if(this.conflicts_exist(conflicts)){
            //
            //Resolve the conflicts
            interventions = await this.resolve_conflicts(all_values, conflicts);
        }
        //
        //4.Combine the clean and intervened values to get the required output
        let result:lib.interventions
            = await this.compile_result(all_values,clean,interventions);
>>>>>>> d6f602ee62ba568a442aa77bc3420888897c8091
        //
        //Remove the minors
        await this.clean_minors(interventions);
    }
    //
    //
    //Delete the minors until there are no integrity errors; then update
    //the principal with the consolidations
    public async clean_minors(consolidations:lib.interventions): Promise<void>{
        //
        //As long as you cannot delete the monors because of integrity
        //contraints....
        let deletion: Array<lib.pointer>|'ok';
        while((deletion =await this.delete_minors())!=='ok'){
            //
            //Redirect the minors to the principal in a controlled version
            //to avoid cyclic loops
            //
            //Do double loops, one for non-cross members; the other for cross
            //members 
            for(let cross_member of [false, true]){
                //
                //Select poiinters that match the crosss member
                let pointers = deletion.filter(pointer=>pointer.cross_member=cross_member);
                //
                //Redirect or merge pointers assocated with minors to the 
                //principal/
                for(let pointer of pointers){
                    //
                    //Redirect contributors pointing to minor members to point 
                    //to the principal until there is no referential integrity 
                    //error
                    let redirection:lib.Imerge|'ok';
                    while((redirection = await this.redirect_pointer(pointer))!=='ok'){
                        //
                        //Use the pointer members, a.k.a., contributors, to 
                        //start a new merge operation
                        const $merger = new merger(redirection); 
                        //
                        $merger.execute();
                    }
                }
            }
        }
        //
        //3. Update the principal
        await this.update_principal(consolidations);
        //
        //4. Report
        this.report("Merging was successful");
    }
    
    //
    //Show the given message in the report panel
    public report(msg: string):void{
        //
        alert(msg);
        //
    }
    
<<<<<<< HEAD
    
    //Get the consolidation data
    public async consolidate():Promise<lib.interventions>{
        //
        //Get the consolidation data
        let consolidation:{clean:lib.interventions, dirty:lib.conflicts};
        consolidation = await this.get_consolidation();
        //
        //Use the consolidates to resolve conflicts if any
        let interventions:lib.interventions = [];
        if (consolidation.dirty.length!=0) 
            interventions = await this.intervene(consolidation.dirty);
        //
        //Consolidate all the member properties to the principal
        return consolidation.clean.concat(interventions);
=======
    //
    //Get the details of the members to merge
    static get_imerge(): lib.Imerge{
        //
        //Get the dbname from the curret window document
        const dbname:string = (<HTMLInputElement>window.document.getElementById('dbase')).value;
        //
        //Read the reference entity name
        let ename:string=(<HTMLInputElement>window.document.getElementById('ename')).value;;
        //
        //Read the members sql
        let members:lib.sql=(<HTMLInputElement>window.document.getElementById('member')).value;;
        //
        return {dbname, ename, members}; 
    }
    //
    //
    /**
     *The all_values parameter is an sql which yields data of the following
     * structure:-  Array<{cname:string, value:string}> and comprises of all the
     * clean and conflicting values.
     * 
     * The conflicts paramter is an sql with the following structure:-
     * Array<{cname:string, freq: number}>  and comprises of all columns that have
     * conflicting values
     * 
     * The return value, is the intervention from the user and has the following
     * structure:-Array<{cname:string, value:string}>,where the user selects
     * the desired values to merge.
     */
    public async resolve_conflicts(all_values:lib.sql,conflicts:lib.sql)
        :Promise< lib.interventions>{
        //
        //Get the conflicting values
        const incoherent: lib.conflicts
            = await server.exec("merger",[this],"get_conflicting_values",[all_values, conflicts]);
            
        //Let the user intervene to resolve the conflicts
        const intervention:lib.interventions= await this.intervene(incoherent);
        //
        //Return the interventions
        return intervention;
>>>>>>> d6f602ee62ba568a442aa77bc3420888897c8091
    }
    //
    //Here we allow the user to select correct values from the incoherent values,
    // and process the selected values and send them to the server.
<<<<<<< HEAD
    async intervene (conflicts:lib.conflicts)
    : Promise<lib.interventions>{
        //
        //Compile the interventions Html for loading to the resolution panel
        //  Map the conflicts to matching fields sets
        const fields:string[] = conflicts.map(conflict=>{
            //
            //Destructure the cnflict
            const {cname, values}= conflict;
            //
            //Convert the values to matching radio buttons
            const radios = values.map(value=>`
                <label>
                    <input type = radio name='${cname}' value='${value}'
                        onclick = ()=>{merger.show(${cname}_group, false)
                    />
                    ${value}
                </label>
            `);
            //Add the other option
            radios.push(`
                <label>
                    <input type = radio name='${cname}' value='other'
                      onclick = ()=>{merger.show(${cname}_group, true);}
                    />
                    Other
                    <div id='${cname}_group'>
                        <label>
                            Specify:<input type = text id='${cname}'/>
                        </label>
                    </div>
                </label>
            `);
            //
            //Return a field set that matches the column name
            return `
            <fieldset>
                <legend>${cname}</legend>
                ${radios.join("\n")}
            </fieldset>
            `;
        }); 
        //  Convert the fields sets to text
        //
        //Unhide the conflicts panel
        this.get_element('resolution').hidden=false;
        //
        //Get the resolution tag
        const resolution = this.get_element('resolution');
        //
        //Write the intervention sql to the pannel
        resolution.innerHTML = fields.join("\n");
        //
        //Get the go button
        const button = <HTMLButtonElement>this.get_element('go');
        //
        //Wait/return for the user's response to resolve 
        //the required promise
        return await new Promise(resolve=>{
            button.onclick = ()=>{
                //
                //Get the checked values for each conflict
                const interventions = conflicts.map(conflict=>{
                    const cname = conflict.cname;
                    const value = this.get_checked_value(cname);
                    return {cname, value}
                });
                //
                //Check that all the interventions are catered for
                for(let intervention of interventions){
                    if(intervention.value===null){
                        alert(`Please resolve value for ${intervention.cname}`);
                        return;
                    }
                }
                //
                //Resolve the promise
                resolve(interventions); 
            }
        }); 
    }
    
    //Return the named checked value is selected; otherwise null
    private get_checked_value(cname:lib.cname):string|null{
=======
    public async intervene (conflicts:lib.conflicts)
    : Promise<lib.interventions>{
        
    }
    //
    // Here, we take the clean records, and the interventions and combine them to return a combined array structure
    public async compile_result(
        all_values:lib.sql,
        clean:lib.sql, 
        interventions:Array<{cname:string, value:string}>
    ):Promise<Array<{cname:string, value:string}>>{
>>>>>>> d6f602ee62ba568a442aa77bc3420888897c8091
        //
        //Get the identified column
        const radio = document.querySelector(`input[name='${cname}']:checked`);
        //
<<<<<<< HEAD
        //Return a null value if a named radion is not set
        if (radio===null) return null;
        //
        //Get the value
        let value = (<HTMLInputElement>radio).value;
        //
        //If the value is other, read the specify field
        if (value==='other'){
            //
            //Read the other/specify field. It must be set
            const elem = this.get_element(cname);
            //
            value = (<HTMLInputElement>elem).value;
            //
            if (value==='') return null; 
        }
        return value;     
=======
        //Get the interventions
        const intervention: Array<{cname:string, value:string}>
            =  await this.intervention(incoherent);
        //
        //Combine both the interventions and the clean records.
        const combined: Array<{cname: string, value: string}> 
            = neat.concat(intervention);
        //
        //Return the output
        return combined;
    }
    //Test whether conflicts exist or not
    public async conflicts_exist(conflicts: lib.sql): Promise<boolean>{
       return await server.exec("merger",[this],"conflicts_exist",[conflicts]);
    }
    //
    //This function fetches the minor contributors and deletes them
    public async delete_minors(): Promise<Array<lib.pointer>|'ok'>{
        return await server.exec("merger",[this],"delete_minors",[]);
    }
    
    public async redirect_pointer(pointer:lib.pointer):Promise<lib.Imerge|'ok'>{
        return await server.exec("merger",[this],"redirect_pointer", [pointer]);
>>>>>>> d6f602ee62ba568a442aa77bc3420888897c8091
    }
    
}