<html>
    <head>
        <title>Chama_select</title>
        <link type="text/css" rel="stylesheet" href="login.css">
        <script type="module">
            //
            import{update_storage, cancel} from "./login.js";
            //
            window.update_storage = update_storage;
            //
            window.cancel = cancel;
            //
        </script>
    </head>
    <body>
        <div class='header'>Identify your Chama</div>
        <div class="content">
            <label>
                <div class="name">Select the name of your Chama from the Given options</div>
                <div id="select">
                    <select id="selection">
                        <option value='Mutall'>Mutall</option>
                        <option value='Chicjoint'>Chicjoint</option>
                        <option value='Friends of Ngong'>Friends of Ngong</option>
                        <option value='Bingwa'>Bingwa</option>
                    </select> 
                </div>
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
                //Get the selected option.
                const option = document.querySelector("#selection");
                //
                //Save option selected into sessionStorage.
                const chama_select = option.options[option.selectedIndex].value;
                //
                //Define chama option item.
                const item = ['mutallco_chama', 'group', [], 'name', chama_select];
                const item1 = ['mutallco_chama', 'group', [], 'id', 'mutall'];
                
                //
                update_storage(item);
                update_storage(item1);
               
            }
            function next(){
                //
                save();
                //Load the next page. 
                location = "player.php";

            }
        </script>
    </body>
</html>
