//
//Get the languages; to feed them in a select.
async function select2(){
    //
    //Retrieve the data fetched by php.
    const response = await fetch('select.php');
    const data = await response.json();
    //
    //Get select2 to populate it.
    const select2 = document.getElementById('select_to');
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
        select2.appendChild(option);
    }
}