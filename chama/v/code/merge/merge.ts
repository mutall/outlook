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
    //The members that drive the merging process
    get principal():number|undefined {return this.imerge!.principal; };
    get minors():lib.sql|undefined{return this.imerge!.minors};
    //
    constructor(imerge?:lib.Imerge){
        super(imerge);
        if (imerge==undefined) this.imerge = this.get_imerge();
    }
    //
    //Get the details of the members to merge
    get_imerge(): lib.Imerge{
        //
        //Get the dbname from the curret window document
        const dbname:string = (<HTMLInputElement>this.get_element('dbase')).value;
        //
        //Read the reference entity name
        let ename:string=(<HTMLInputElement>this.get_element('ename')).value;;
        //
        //Read the members sql
        let members:lib.sql=(<HTMLInputElement>this.get_element('members')).value;;
        //
        return {dbname, ename, members}; 
    }
    
    //
    //Merge the members of this object
    public async execute():Promise<void>{
        //
        //From the members identify the principal and the minor players.
        const players = await this.get_players();
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
        this.imerge!.principal= principal;
        this.imerge!.minors= minors;
        //
        //Get the interventions
        const interventions = await this.consolidate();
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
        //Redirect the minors to the principal until all the minors 
        //can be deleted without violating the unique index integrity contraint.
        let deletion:Array<lib.pointer>|'ok' 
        while((deletion =await this.delete_minors())!=='ok'){
            //
            //Redirect the minors to the principal
            //
            //Avoid cyclic merging by first attending to structural member 
            //ponters followed by the cross members
            for(let cross_member of [false, true]){
                //
                //Select pointers that match the cross member frag
                let pointers = 
                    deletion.filter(pointer=>pointer.is_cross_member=cross_member);
                //
                //Redirect all the selected pointers
                for(let pointer of pointers){
                    //
                    //Redirect contributors pointing to minor members to point 
                    //to the principal until there is no referential integrity 
                    //error
                    let redirection:lib.Imerge|'ok';
                    while((redirection = await this.redirect_pointer(pointer))!=='ok'){
                        //
                        //On an index by index basis....
                        for (let index of pointer.indices){
                            //
                            //...and on a signature by signature basis....
                            for (let signature of index.signatures){
                                //
                                //Merge the pointer members that share the 
                                //same signanture
                                //
                                //Compile the Imerge data
                                //
                                const dbname = pointer.column.dbname;
                                const ename = pointer.column.ename;
                                //
                                //Use the signaure to constrain the pointer members
                                const members:lib. sql = `
                                    SELECT
                                        member 
                                    FROM
                                        (${index.members}) as member
                                    WHERE 
                                        signature='${signature}'
                                `
                                //
                                //Assemble the imerge components together
                                const imerge = {dbname, ename, members};
                                //
                                //Use the pointer members, a.k.a., contributors, 
                                //to start a new merge operation
                                const $merger = new merger(imerge); 
                                //
                                $merger.execute();
                            }
                        }
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
    }
    //
    //Here we allow the user to select correct values from the incoherent values,
    // and process the selected values and send them to the server.
    async intervene (conflicts:lib.conflicts)
    : Promise<lib.interventions>{
        //
        //Compile the interventions Html for loading to the resolution panel
        //  Map the conflicts to matching fields sets
        const fields:string[] = conflicts.map(conflict=>{
            //
            //Desructure the cnflict
            const {cname, values}= conflict;
            //
            //Convert the values to matching radio buttons
            const radios = values.map(value=>`
                <label>
                    <input type = 'radio' name='${cname}' value='${value}'
                        onclick = "merger.show('${cname}_group', false)"
                    />
                    ${value}
                </label>
            `);
            //Add the other option
            radios.push(`
                <label>
                    <input type = 'radio' name='${cname}' value='other'
                      onclick = "merger.show('${cname}_group', true)"
                    />
                    Other
                    <div id='${cname}_group'>
                        <label>
                            Specify:<input type = 'text' id='${cname}'/>
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
        //
        //Get the identified column
        const radio = document.querySelector(`input[name='${cname}']:checked`);
        //
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
    }
}