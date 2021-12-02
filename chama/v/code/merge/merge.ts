//
import * as lib from "../../../../library/v/code/library";
import * as server from "../../../../library/v/code/server.js";
import * as outlook from "../../../../outlook/v/code/outlook.js";
//
type sql=string;
//
type error1062=string;
//
type error1451=string;
//
//
class merger extends outlook.view implements lib.Imerge {
    //
    //
    public dbname?:string;
    public ref_ename?:string;
    public members?:sql;
    public principal?:sql;
    public minors?:sql;
    //
    //
    constructor(imerge?:lib.Imerge){
        super();
       if(imerge !== undefined){
           //
           this.dbname = imerge.dbname;
           this.ref_ename = imerge.dbname;
           this.members = imerge.dbname;
       }
    }
    //
    //Merge the members specified by the Imerge object
    public async execute():Promise<void>{
        //
        //1. Get the members to merge if not avilable
        if (this.members===undefined){
            const imerge = await this.get_imerge();
            this.dbname= imerge.dbname;
            this.ref_ename= imerge.dbname;
            this.members= imerge.members;
        }
        //
        //2. From the members identify the principal and the minors
        const players: [lib.principal,lib.minors]|null
            = await server.exec("merger",[this],"get_players",[]);
        //
        //Proceed only if the players are valid
        if(players === null){
          this.report("Merging is not necessary");
          return;
        }
        //
        //3. There is a principal and a Minor, therefore, merging is possible.
        //
        //3.1 Destructure the player to get the principal and the minor
        const [principal, minors]= players;
        //
        //Save the principal and minors to this object
        this.principal= principal;
        this.minors= minors;
        //
        //3.2 Consolidate all the member properties to the principal
        const consolidations: Array<{cname:string,value:string}>
            =await this.consolidate();
        //
        //3.3. Remove the minors
        await this.clean_minors(consolidations);
    }
    //
    //Collect and reconcile all the data that is distributed among the members
    // and save it in one place, the principal
    public async consolidate(): Promise<Array<{cname:string, value:string}>>{
        //
        //1.Collect the values to consolidate
        const values:sql = await server.exec("merger",[this],"get_values",[]);
        //
        //2. Separate the conflicts from the clean values
        const {clean, conflicts}= await server.exec("merger",[this],"get_conflicts",[]);
        //
        //Lets start by assuming there are no conflicts and hence there are no interventions
        let interventions: Array<{cname:string, value:string}>=[];
        //
        //Test if there is any data that requires manual merging/intervention
        if(this.conflicts_exist(conflicts)){
            //
            //Resolve the conflicts
            interventions = await this.resolve_conflicts(all_values, conflicts);
        }
        //
        //4.Combine the clean and intervened values to get the required output
        let result: Array<{cname:string, value:string}>
            = await this.compile_result(all_values,clean,interventions);
        //
        //5. Assign the result here
        return result;
    }
    //
    //
    public async clean_minors(consolidations:Array<{cname:string,value:string}>): Promise<void>{
        //
        //1. Delete the minors
        //
        //2. Redirect the minor contributors to the principal
        //Test for a foreign key integrity violation error.
        while(!(await this.delete_minors())){
            //
            //Get the minor contributors
            const contributors:sql
                = await server.exec("merger",[this],"get_contributors",[fkerror,this.minors!]);
            //
            //Redirect the minor contributors to the principal
            let duperror: lib.error1062|null ;
            //
            //Test for duplicate error 1062
            while((duperror= await this.redirect_contributors(contributors))!== null){
                //
                //Merge the contributors
                (await server.exec("merger", [this], "get_contributing_members", [duperror, contributors]))
                    .forEach((contributor:lib.Imerge)=>this.execute());
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
        //
        //
    }
    
    //
    //Get the details of the members to merge
    public get_imerge(): lib.Imerge{
        //
        //Get the dbname from the curret window document
        const dbname:string = (<HTMLInputElement>window.document.getElementById('dbase')).value;
        //
        //Read the reference entity name
        let ref_ename:string=(<HTMLInputElement>window.document.getElementById('ename')).value;;
        //
        //Read the members sql
        let members:sql=(<HTMLInputElement>window.document.getElementById('member')).value;;
        //
        return {dbname, ref_ename, members}; 
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
    public async resolve_conflicts(
        all_values:sql,
        conflicts:sql
    ):Promise< Array<{cname:string, value:string}>>{
        //
        //1. Get the conflicting values
        const incoherent: Array<{cname:string, value:string[]}>
            = await server.exec("merger",[this],"get_conflicting_values",[all_values, conflicts]);
        //
        //2. Let the user intervene to resolve the conflicts
        const intervention:Array<{cname:string, value:string}>= await this.intervention(incoherent);
        //
        //3. Return the interventions
        return intervention;
    }
    //
    //Here we allow the user to select correct values from the incoherent values,
    // and process the selected values and send them to the server.
    public async intervention (
        incoherent:Array<{cname:string, value:string[]}>
    ): Promise<Array<{cname:string, value:string}>>{
        //
        //paint the body with the incoherent values
        const mangled = document.getElementById("content");
        //
        //Capture the selected values
        const coherent:Array<{cname:string, value:string}>;
        // 
        //return the coherent data
        return await new Promise(coherent);
    }
    //
    // Here, we take the clean records, and the interventions and combine them to return a combined array structure
    public async compile_result(
        all_values:sql,
        clean:sql, 
        interventions:Array<{cname:string, value:string}>
    ):Promise<Array<{cname:string, value:string}>>{
        //
        //Get the clean records
        const neat: Array<{cname:string, value:string}>
            = await server.exec("merger",[this],"get_clean_values",[all_values, clean]);
        //
        //Get the interventions
        const intervention: Array<{cname:string, value:string}>=  await this.intervention(incoherent);
        //
        //Combine both the interventions and the clean records.
        const combined: Array<{cname: string, value: string}> = neat.concat(intervention);
        //
        //Return the output
        return combined;
    }
    //Test whether conflicts exist or not
    public async conflicts_exist(conflicts: sql): Promise<boolean>{
       return await server.exec("merger",[this],"conflicts_exist",[conflicts]);
    }
    //
    //This function fetches the minor contributors and deletes them
    public async delete_minors(): Promise<boolean>{
        return await server.exec("merger",[this],"delete_minors",[]);
    }
    //
    //
    public async redirect_contributors(contributors :sql): Promise<error1062|null>{
        return await server.exec("merger",[this],"redirect_contributors",[contributors]);
    }
}