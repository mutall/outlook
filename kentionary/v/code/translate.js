//
//
async function translate_(){
    //
    //Get the translate button.
    const translate_btn = document.getElementById('translate');
    //
    //Get select1 value.
    const select1 = document.getElementById('select_from').value;
    //
    //Get select2 value.
    const select2 = document.getElementById('select_to').value;
    //
    //Get input field value.
    const input = document.getElementById('input').value;
    //
    //Send the collected data to the server for processing;
    const response = await fetch(
            `http://127.0.0.1/translate.php?select1=${select1}&select2=${select2}&input=${input}`
    );
    const data = await response.json();
    //
    //Get the element through which to display the translation.
    const textarea_translation = document.getElementById('translation');
    //
    //Clear the textarea.
    //
    textarea_translation.innerHTML = data;
}