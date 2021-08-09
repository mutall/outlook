//
  (async () => {
               const credentilas = {
                username: "root",
                password:"",
                name:"mutalco_chamas"
                };    
                //
                //Create a new db.
                const static_dbase =  await mutall.fetch('chamas', 'export_structure',credentilas );
                const chamas_dy = new chamas(static_dbase);
                chamas.current = static_dbase;
            })();
 async function display(){
     const result = await mutall.fetch('sql_editor','show',{dbname:"mutalco_chamas",ename:"member"});
     return result;
     
  }


