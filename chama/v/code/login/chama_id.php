<html>
    <head>
        <title>Chama_id</title>
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
        <div class="header">Chama Details</div>
        <div class="content">
            <label>
                <div>Chama short name</div>
                <input type="text" placeholder="finicon" id='chama_id'>
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
                //Get the chama id from user input. 
                const chama_id = document.querySelector("#chama_id").value;
                //
                //Define the chama item
                const item = ['mutallco_chama', 'group', [],'id', chama_id];
                //
                update_storage(item);
            }
            function next(){
                //
                //Save the data.
                save();
                //Proceed to  completion.
                location = "player.php";
            }
        </script>
    </body>
</html>
