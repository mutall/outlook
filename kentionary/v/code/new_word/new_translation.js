//
//Function to fetch the id, in the database, of the current word.
async function new_translation(){
    //
    //Get the word to be newly translated.
    const input_code = document.getElementById('input_code').value;
    console.log(input_code);
    //
    //Get language 1.
    const select1 = document.getElementById('select1').value;
    console.log(select1);
    //
    //Get the word to be newly translated.
    const input_new1 = document.getElementById('input_new1').value;
    console.log(input_new1);
    //
    //Get the meaning of the new translation.
    const meaning1 = document.getElementById('meaning').value;
    console.log(meaning1);
    //
    //Get language 2.
    const select2 = document.getElementById('select2').value;
    console.log(select2);
    //
    //Get the new translation.
    const input_new2 = document.getElementById('input_new2').value;
    console.log(input_new2);
    //
    //Get the meaning of the new translation.
    const meaning2 = document.getElementById('meaning2').value;
    console.log(meaning2);
    //alert(`${select1} , ${input}, ${select2}, ${input_new}, ${meaning}`);
    //
    //Pass the collected data to the server side for processing.
    const response = await fetch(`new_translation.php?input_code=${input_code}&select1=${select1}&input_new1=${input_new1}&meaning1=${meaning1}&select2=${select2}&input_new2=${input_new2}&meaning2=${meaning2}`);
    //
    //
}