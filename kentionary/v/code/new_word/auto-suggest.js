//
//Help you by auto-suggesting words available in the database.
async function auto_suggest(){
    //
    //Get the selected language.
    const select1 = document.getElementById('select1').value;
    //
    //Get the input field.
    const input = document.getElementById('input_code').value;
    //
    //Send the typed word to the server.
    const response = await fetch(`
        http://127.0.0.1/auto-suggest.php?input=${input}&language=${select1}`
    );
    const data = await response.json();
    //
    //Get the datalist, in which to populate the suggested words.
    let datalist = document.getElementById('browsers');
    let option = '';
    //
    //Loop through each of the returned data and attach each og them to an option
    //tag.
    for(let i = 0; i < data.length; i++){
        //
        //Create an option tag.
        option += '<option value="'+data[i].name+'" />';
        //
        //Append option to datalist.
        datalist.innerHTML = option;
    }
}