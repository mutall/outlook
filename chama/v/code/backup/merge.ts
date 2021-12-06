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
    }
    //
    //Merge the members specified by the Imerge object
    public async execute():Promise<void>{
        //
        //From the members identify the principal and the minors
        const players: {principal:lib.sql,minors:lib.sql}|null
            = await server.exec("merger",[this],"get_players",[]);
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
        //Save the principal and minors to this object
        this.principal= principal;
        this.minors= minors;
        //
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
    public async consolidate(): Promise<lib.interventions>{
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
        if(await this.conflicts_exist(conflicts)){
            //
            //Resolve the conflicts
            interventions = await this.resolve_conflicts(all_values, conflicts);
        }
        //
        //4.Combine the clean and intervened values to get the required output
        let result:lib.interventions
            = await this.compile_result(all_values,clean,interventions);
        //
        //5. Assign the result here
        return result;
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
        await server.exec("merger",[this],"update_principal",[consolidations]);
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
    }
    //
    //Here we allow the user to select correct values from the incoherent values,
    // and process the selected values and send them to the server.
    public async intervene (conflicts:lib.conflicts)
    : Promise<lib.interventions>{
        //
        //1. Paint the conflicts to the user
            //
            //Convert the conflicts to a string
            const 
        const conflicting = `
                    Pick the values to retain
                    <label for="name">
                    <input type="radio" id="change" name="">{}
                    </label><br>`;
        //
        //2. For each conflict selected, get the element.
        //
        //3. Check if there is a radio button that is checked. 
        //If there is none, ask the user to provide one.
        //
        //4. Set the interventions into an array of intervetions
        //
        //5. Return the interventions.
        
    }
    //
    // Here, we take the clean records, and the interventions and combine them to return a combined array structure
    public async compile_result(
        all_values:lib.sql,
        clean:lib.sql, 
        interventions:Array<{cname:string, value:string}>
    ):Promise<Array<{cname:string, value:string}>>{
        //
        //Get the clean records
        const neat: Array<{cname:string, value:string}>
            = await server.exec("merger",[this],"get_clean_values",[all_values, clean]);
        //
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
    }
    
}