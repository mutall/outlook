<html>
    <head>
        <title>Chama_name</title>
        <link type="text/css" rel="stylesheet" href="login.css">
        <script type="module">
            //
            import{update_storage, cancel} from "./login.js";
            //
            window.update_storage = update_storage;
            //
            window.cancel = cancel;
        </script>
    </head>
    <body>
        <div class='header'>Specify your Chama</div>
        <div class="content">
            <label>
                <div>What is your Chama's full name?</div>
                <input type="text" placeholder="e.g., Friends of Ngno Hills"  id="chama_name">
            </label>
            
        </div>
        <div class="buttons">
            <div class="btn">
                <button id="next" onclick="next()">Next</button>
                <button id="cancel" onclick="cancel()">Cancel</button>
            </div>
        </div>
        <script>
            function save(){
                //
                //Get the name of the chama. 
                const chama_name = document.querySelector("#chama_name").value;
                //
                //Formulate where in the server the data will be stored.
                //Define chama item.
                const item = ['mutallco_chama', 'group', [], 'name', chama_name];
                //
                update_storage(item);
            }
            function next(){
                //
                //Save the data
                save(); 
                //
                //Proceed to the next step.
                location = "chama_id.php";
            }
        </script>
    </body>
</html>
