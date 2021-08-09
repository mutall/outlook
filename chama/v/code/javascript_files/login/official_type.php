<html>
    <head>
        <title>official_type</title>
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
        <div class="header">Office held</div>
        <div class="content">
                <label>
                    <div>Office name</div>
                    <input type="checkbox" name="office" value="Chairman" onclick="save(this)">
                    Chairman
                    <input type="checkbox" name="office" value="Treasurer" onclick="save(this)">
                    Treasurer
                    <input type="checkbox" name="office" value="Secretary" onclick="save(this)">
                    Secretary
                </label>
        </div>
        <div class="Buttons">
            <div class="btn">
                <button id="next" onclick="next()">Next</button>
                <button id="cancel" onclick="cancel()">Cancel</button>
            </div>
        </div>
        <script>
            function save(checkbox){ 
                //
                //Get all checkboxes.
                const checkboxes = document.getElementsByName("office");
                //
                //For each checkbox checked, uncheck the rest. Only one can 
                //be selected.
                checkboxes.forEach((item)=>{
                    if(item !== checkbox){
                        item.checked = false;
                    }else{
                        //
                        //Get the value from the checked checkbox.
                        const official_type = item.value;
                        //
                        //Define item.
                        const item = ['mutallco_chama', 'office', [], 'name', official_type];
                        //
                        update_storage(item);
                    }
                });
            }
            function next(){
                //
                //Proceed to fill in member details.
                location = "member_details.php";
            }
        </script>
            
    </body>
</html>
