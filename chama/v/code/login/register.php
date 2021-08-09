 <html>
    <head>
        <title>register_id</title>
        <link type="text/css" rel="stylesheet" href="login.css">
        <script type="module">
            import{cancel} from "./login.js";
            //
            window.cancel = cancel;
            //
        </script>
    </head>
    <body>
        <div class='header'>Register your Chama</div>
        <div class="content">
           <label>
                <div>Is your social group, i.e., Chama, registered?</div>
                <input type="radio" name="option" id="chama_select.php" value="Yes">
                Yes
                <input type="radio" name="option" id="chama_name.php" value="No">
                No
            </label>
        </div>
        <div class="buttons">
            <div class="btn">
                <button id="next" onclick="next()">Next</button>
                <button id="cancel" onclick="cancel()">Cancel</button>
            </div>
        </div>
        <script>
            
            function next(){
                //Go to the next page in the flow.
                location = document.querySelector("input[name='option']:checked").id;
            }
        </script>
    </body>
</html>
