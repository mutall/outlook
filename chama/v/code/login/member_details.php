<html>
    <head>
        <title>member_details</title>
        <link type="text/css" rel="stylesheet" href="login.css">
        <script type="module">
            import{update_storage, cancel} from "./login.js";
            //
            window.update_storage = update_storage;
            //
            window.cancel = cancel;
        </script>
    </head>
    <body>
        <div class="header">Detail member info</div>
        <div class="content">
            <label>
                 <div>Member info</div>
                 <span>Contact</span>
                 <input type="text" placeholder="Tel_No" id="contact">
                 <span>Occupation</span>
                 <input type="text" placeholder="occupation" id="occupation">
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
                //Get input fed by the user.
                const member_contact = document.getElementById("contact").value;
                const member_occupation = document.querySelector("#occupation").value;
                //
                //Define where the item data will be saved in the server.
                const item1 = ['mutallco_chama', 'member', [], 'contact', member_contact];
                const item2 = ['mutallco_chama', 'member', [], 'occupation',member_occupation];
                const item3 = ['mutallco_chama', 'member', [], 'registration_id',3452];
                //
                //Save the items into milk.
                update_storage(item1);
                update_storage(item2);
                update_storage(item3);
            }
            function next(){
                //
                //Save the data.
                save();
                //Proceed to registration completion.
                location = "finish.php";
            }
        </script>
    </body>
</html>
