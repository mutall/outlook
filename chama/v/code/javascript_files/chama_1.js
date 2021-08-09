
/* global mutall */

var dbase;

class chamas extends database {
    //
    //Returns an instance of this class.
    constructor(_chamas) {
        //
        super(_chamas);
        //
        let this_ = this;
        //
        Object.assign(this_, _chamas);
        //
        this.set_groups(_chamas.groups);
        this.current;
    }
    //
    //Set the chamas groups as dynamic object of the group class.
    set_groups(_groups) {
        //
        //Loop through all the groups and "activate" each one of them.
        Object.values( _groups).forEach((_group, index) => {
            //
            //Create a new group.
            const $group = new group(this, _group);
            //
            //Replace the static group with a dynamic version.
            this.groups[index] = $group;
        });
    }
     get current(){
         dbase = window.__dbase__;
         return dbase;
     }
     set current(dbase){
         window.__dbase__ = dbase;
     }
}
class group extends entity {
    //
    constructor($dbase, _group) {
        //
        super($dbase, _group);
        //
        let _this = this;
        //
        //offload source objects.
        //set the target object to this.
        Object.assign(_this,_group);
        //
        //Create functions in which to offload source data.
        this.set_members(_group.members);
        this.set_officials(_group.officials);
        this.set_objectives(_group.objectives);
        this.set_events(_group.events);

    }
    
    //Set thebers
    set_members(_members) {
        //
        //Loop through all the members and activate each one of them.
        _members.forEach((_member, index)=>{
            //
            //Create a new member.
            const $member = new member(this.dbase, _member);
            //
            //Replace static members with dynamic.
            this.members[index] = $member;
        });
    }
    
    set_officials(_officials) {
        //
        //Loop through officials and activate each one of them.
        _officials.forEach((_official, index)=>{
           //
           //Create an official.
           const $official = new official(this.dbase, _official);
           //
           //Replace static officials with dynamic.
           this.officials[index]= $official;
        });
    }
    set_objectives(_objectives) {
        //
        _objectives.forEach((_objective, index)=>{
           //
           //Create an objective.
           const $objective = new objective(this.dbase, _objective);
           //
           //Replace static objectives with dynamic.
           this.objectives[index]= $objective;
        });
    }
    set_events(_events) {
        //
        _events.forEach((_event, index)=>{
           //
           //Create an event.
           const $event = new event(this.dbase, _event);
           //
           //Replace static events with dynamic.
           this.events[index]= $event;
        });

    }
    
    //Use the services ui to register a new group 
    static register(){
        //
        //Chama current
        page_processor.dbase = chamas.current;
        //
        //Define the service to run.
        const name = new service_attribute('group', 'name');
        const vision = new service_attribute('group', 'Vision');
        const mission = new service_attribute('group', 'Mission');
        const email = new service_attribute('group', 'email');
        const website = new service_attribute('group', 'website');
        const logo = new service_attribute('group', 'logo');
        const contribution = new service_attribute('group', 'Contribution');
        //
        const service = new do_('Add your group',[name,vision,mission,email,website,
                                logo,contribution]);
        //Run the service and parse the dbase.
        service.run(page_processor.dbase);
        //
    }
    static add_contributions(){
        //
        //Chama current
        page_processor.dbase = chamas.current;
        //
        //Define the service to run.
        const ref = new service_attribute('journal', 'ref');
        const amount = new service_attribute('journal', 'amount');
        const date = new service_attribute('journal', 'date');
        const credit_account = new service_attribute('credit_account', 'name');
        const debit_account = new service_attribute('debit_account', 'name');
        const service = new do_('Record Contribution Journal',[ref,amount,date,
                                credit_account,debit_account]);
        //
        //Run the service and parse the dbase.
        const win = service.run(page_processor.dbase);
        //
        win.onbeforeunload = ()=>{
            alert('finished');
        }
        
    }
    static add_member(){
        page_processor.dbase = chamas.current;
        //
        //Define the intended service.
        const username = new service_attribute('member','username');
        const picture = new service_attribute('member','picture');
        const contact = new service_attribute('member','contact');
        const service = new do_('Add a Member',[username,picture,contact]);
        //
        //Run the service.
        service.run(page_processor.dbase);
        
    }
    static async view_contributions(){
        const $sql = `select journal.amount, journal.date,   
                      journal.ref, credit_account.name from  journal inner join credit_account 
                    on credit_account.credit_account = journal.credit_account`;
         const credentilas = {
          username: "root",
          password:"",
          name:"mutalco_chamas",
          sql: $sql
          };    
          //
          //Create a new db.
          const contributions =  await mutall.fetch('chamas', 'get_sql_data',credentilas);
//          const div = document.querySelector('#contributions');
////          div.innerHTML = `${JSON.stringify(contributions)}`;
          const open = window.open('view_contribution.php');
          open.addEventListener('load',function(){
            const body=open.document.querySelector('body');
            body.innerHTML= `${JSON.stringify(contributions)}`;
          });
           
    }
}
class member extends entity {
    constructor(dbase,_member) {
        super(dbase, _member);
        //
        let _this = this;
        //
        //offload source objects.
        //set the target object to this.
        Object.assign(_this, _member);
        
    }
    static update_resume(){
        //
        //Get the current dbase;
        page_processor.dbase = chamas.current;
        //
        //Define the service to run.
        const profession = new service_attribute('resume', 'profession');
        const skills = new service_attribute('resume', 'skills');
        const about = new service_attribute('resume', 'About');
        const interests = new service_attribute('resume', 'interests');
        const portfolio = new service_attribute('resume', 'portfolio');
        const contact = new service_attribute('resume', 'contact');
        //
        const service = new branch('Update Resume',[profession, skills,about,
            interests,portfolio,contact]);
        //Run the service and parse the dbase.
        service.run(page_processor.dbase);
    }
    
}

class official extends entity {
    constructor(dbase, _official) {
        super(dbase, _official);

    }
}
class objective extends entity {
    constructor(dbase, _objective) {
        super(dbase, _objective);
    }
}
class event extends entity {
    constructor(dbase,_event) {
        super(dbase, _event);
    }
}

