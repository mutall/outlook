//
//Get the languages; to feed them in a select.
async function select1(){
    //
    //Retrieve the data fetched by php.
    const response = await fetch('select.php');
    const data = await response.json();
    //
    //Get select1 to populate it.
    const select1 = document.getElementById('select_from');
    //
    //Add the Options to the DropDownList.
    for (var i = 0; i < data.length; i++) {
        //
        //Create option tag.
        var option = document.createElement("option");
        //
        //Set the data as the option part.
        option.innerHTML = data[i].name;
        //
        //Set CustomerId in Value part.
        option.value = data[i].name;

        //Add the Option element to DropDownList.
        select1.appendChild(option);
    }
}