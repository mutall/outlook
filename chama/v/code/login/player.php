<html>
    <head>
        <title>player</title>
        <link type="text/css" rel="stylesheet" href="login.css">
        <script type="module">
            import{cancel} from "./login.js";
            //
            window.cancel = cancel;
            //
        </script>
    </head>
    <body>
        <div class="header">Role played</div>
        <div class="content">
            <label>
                <div>Are you an official?</div>
                <input type="radio" name="option" id="official_type.php" value="Yes">
                Yes
                <input type="radio" name="option" id="member_details.php" value="No">
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
                //
                //Proceed to the next page in the flow.
                location = document.querySelector("input[name='option']:checked").id;
            }
        </script>
    </body>
</html>
