//
import * as server from '../library/v/code/server.js';
//
//Php container.
declare class php {}
//
//The user inputs which are used to search for terms in the database, these 
// words are also used to enrich the untranslated word.
type contribution = {word: string, type: 'spelling', correction: string}
        | {word: string, type: 'meaning', description: string}
        | {word: string, type: 'none'};
//
//A term is useful in saving a word and its accompaniments 
//(synonyms, meaning, etc.) in the database.
type term = 
    {type: 'yes', name: string}| {type: 'no'}| {type: 'prev'}| {type: 'finish'}| {type: 'cancel'};
//
//The corrected word, in the event the untranslated word is misspelled.
type spelling = {type: 'yes'} | {type: 'no', correction: string};
//
//The user defined meaning of a word.
type meaning = {type: 'yes', description: string} | {type: 'no'};
//
//The word(s) used for searching a term in the database, it is also stored 
//with its accompaniments (synonyms, meaning, etc.) in the database..
type root = {type: 'singular' | 'present' | 'root' | 'spelling', 'root': string}
            | {type: 'none'};
//
//This word has several uses:-
//1. Used to search the untranslated word's terms.
//2. Used to enrich the untranslated word.
type synonym = 
    {type: 'yes', name:string, language: string, category: string}|{type: 'no'}|{type: 'prev'}|{type: 'finish'}|{type: 'cancel'};
//
//Translate the untranslated words.
export class translator{
    //
    //The user inputs, which will help to get a root word which is used to search 
    //a term in the database.
    public contribution?: contribution;
    //
    //This is the storage unit for collecting synonyms provided by the user, 
    //during the translation process.
    public synonyms: Array<{name: string, language: string, category: string}> = [];
    //
    //This is a check to guide the programmer on whether the user has passed
    //through the synonym_no route, i.e., the route where s/he provides 
    //synonym if they are available.
    public more_synonyms: boolean = true;
    //
    //The word we collect during the translation process.
    public root?: root;
    //
    //These are access to the panels in the translator page;
    public steps: HTMLDivElement;
    public status: HTMLDivElement;
    public interactions: HTMLDivElement;
    public words: HTMLDivElement;
    public messages: HTMLDivElement;
    public terms: HTMLDivElement;
    //
    //Navigation buttons.
    public prev: HTMLButtonElement;
    public next: HTMLButtonElement;
    public finish: HTMLButtonElement;
    public cancel: HTMLButtonElement;
    //
    //
    constructor() {
        //
        //Initialize the panels.
        this.steps = translator.get_element('steps');
        this.status = translator.get_element('status');
        this.interactions = translator.get_element('interactions');
        this.words = translator.get_element('words');
        this.messages = translator.get_element('messages');
        this.terms = translator.get_element('terms');
        //
        //Initialize the buttons.
        this.prev = translator.get_element('prev');
        this.next = translator.get_element('next');
        this.finish = translator.get_element('finish');
        this.cancel = translator.get_element('cancel');
    }
    // 
    //This method repetitively selects a kikuyu word and takes a user through 
    //the translation process.
    async execute(): Promise<void> {
        //
        while (await this.run());
    }
    //
    //This method selects a kikuyu word and takes a user through 
    //the translation process.
    async run(): Promise<boolean> {
        //
        //Ensure that the user atleast knows the meaning of the word s/he selects.
        //Or if the word is misspelled, s/he knows the correct_spelling. If the
        //user doesn't know the meaning of a correctly spelled untranslated 
        //word then take him/her back to selecting another word.
        while ((this.contribution = await this.contribute()).type == 'none');
        //
        //A term is useful in saving a word and its accompaniments 
        //(synonyms, meaning, etc.) in the database.
        let term: {type: 'yes', name: string}| {type: 'no'}| {type: 'prev'}| {type: 'finish'}| {type: 'cancel'};
        //
        //The phase after the contribution phase.
        //In this phase, get a synonym(s) of the selected word; could be a correct 
        //spelling. Use the collected items to search for terms related with the 
        // selected word (in the database).
        while (!((term = await this.get_term()).type == 'yes'));
        //
        //Gatekeeper to ensure there is a root word.
        if(this.root == null){
            //
            const msg = `'Root' is not set.`;
            alert(msg);
            throw new Error(msg);
        }        
        //
        //Enrich the term that has either been retrieved or newly created.
        //This enrichment involves asking user if s/he wants to add some more
        //synonyms (in a language of choice) of the selected word.
        const enrichment = this.enrich_term(this.contribution, this.root, term);
        //
        //Write the results to the database.
        this.save(enrichment);
        //
        //Upon saving the enrichments, ask if s/he wants to translate another word.
        return this.pick_term();
    }
    //
    //Collect a user's inputs, during the first phase of the translation process.
    //They include:- a new spelling (if a word is misspelled) & the meaning)
    async contribute(): Promise<contribution> {
        //
        //Get the value of the word which the user has selected to translate.
        const word: string = await this.select_word();
        //
        //If a word presented to the user for translation is misspelt, accord
        //the user a chance to correct its spelling.
        let spelling: {type: 'yes'} | {type: 'no', correction: string};
        //        
        //Get the correct spelling which is presented by the user.
        if ((spelling = await this.correct_spelling(word)).type == 'no')
            return {word: word, type: 'spelling', correction: spelling.correction};
        //
        //When the word to translate is correctly spelt, proceed with getting 
        //its meaning.
        let meaning: {type: 'yes', description: string} | {type: 'no'};
        //
        if ((meaning = await this.meaningful(word)).type == 'yes')
            return {word: word, type: 'meaning', description:meaning.description};
        //
        //This is an instance in which the word to translate is correctly spelt,
        //but the user doesn't know its meaning, so we take the user back to 
        //choosing a word which s/he knows its meaning.
        return {word: word, type: 'none'};
    }
    //
    //Present the list of words to be translated, to the user and get the value 
    //of the word the user wants to transalate.
    async select_word(): Promise<string>{
        //
        //Feed the interactions panel with the instructions 
        //to guide the user on how to proceed with the translation process.
        this.interactions.innerHTML = 
            `Select the word to translate from the words panel. <br/>
            Press next when ready`;
        //
        //Return the word selected by the user, for translation.
        return await new Promise((resolve)=>{
            //
            //Attach an onclick event to the next button; it is used to help get the 
            //value of the selected word from the list.
            this.next.onclick = () =>{
                //
                //Get the value of the selected word.
                //NB: The word are presented as radio buttons which are inside
                //labels.
                const word: string | null = this.get_checked_value('word');
                //
                //If a word is selected, lock the words panel so that no further
                //interactions with it can occur.
                this.words.classList.add('disabled');
                //
                //Return the selected word.
                resolve(word);
            }
        });        
    }
    //
    //Correct the selected word's spelling, if it is misspelled.
    async correct_spelling(
        word: string
    ): Promise<{type: 'yes'} | {type: 'no', correction: string}>{
        //
        //Store the elements used to ask if the selected word is spelt correctly.
        const spelling = 
            `
                Is the spelling correct?<br/>
                <label>
                    <input type="radio" name="spelling" value="yes"/>Yes
                </label>
                <label>
                    <input 
                    type="radio" 
                    name="spelling" 
                    value="no"
                    onclick="show(true, 'correction')"/>No
                </label>
                <div id='correction'>
                    Enter correct spelling<br/>
                    <input type="text" id="correction"/>
                </div>`;
        //
        //Attach instructive elements, on the interactions panel, used to guide 
        //the user on how to proceed with the translation process.
        this.interactions.innerHTML = spelling;
        //
        //Wait for the user to respond and return the correct spelling.
        return await new Promise((resolve) => {
            //
            //Attach an onclick event on the next button; it is used to detect 
            //the values selected. Then do the necessary actions.
            this.next.onclick = () => {
                //
                //Get the input element that is checked.
                const value = this.get_checked_value('spelling');
                //
                //Assuming the radio button's value is YES, return a yes response...
                if(value === 'yes') resolve({type: 'yes'});
                //
                //Otherwise return a no response with the correct spelling
                else{
                    //
                    //Get the input value of the corrected word.
                    const correction = this.get_input_value('correction');
                    //
                    resolve({type: 'no', correction})
                }
            };
        });
    }
    //
    //Get the meaning of the selected word.
    async meaningful(
        word: string
    ): Promise<{type: 'yes', description: string} | {type: 'no'}>{
        //
        //Display the html elements that will help guide the user during the 
        //translation phase and capture the meaning of a word, provided by the user.
        const meaning = 
            `
            Do you know the word's meaning based on its context?<br/>
            <label>
                <input type="radio" name="meaning" value="yes"/>Yes
            </label>
            Enter the meaning
            <textarea id="meaning"></textarea>
            <label>
                <input type="radio" name="meaning" value="no"/>No
            </label>`;
        //
        //Append the interogation elements to the interactions panel.
        this.interactions.innerHTML = meaning;
        //
        //Come back with the meaning if the user knows it, otherwise take the 
        //user back to selecting a word which s/he knows the meaning.
        return await new Promise((resolve) => {
            //
            //Attach an onclick event to the next button to steer the user 
            //ahead.
            this.next.onclick = () => {
                //
                //Get the input value that is checked.
                const value = this.get_checked_value('meaning');
                //
                //Assuming the input value is YES, return a yes response.
                if(value == 'yes'){ 
                    //
                    const textarea: HTMLTextAreaElement  = translator.get_element('meaning');
                    //
                    //Get the user input (the word's meaning) provided in the 
                    //textarea element.
                    const description = textarea.textContent;
                    //
                    //Gatekeeper to ensure the textarea that is housing the 
                    //meaning is not empty.
                    if (description == null){
                        //
                        alert(`Please input the word's meaning`);
                        //
                        return;
                    }
                    //
                    resolve({type: 'yes', description});
                }
                //
                //Otherwise return a no response.
                else{ resolve({type: 'no'}); }
            };
        });
    }
    //
    //Get a synonym(s) from the user and use it to search for a term in the database.
    async get_term(): Promise<{type: 'yes', name: string}| {type: 'no'}| {type: 'prev'}| {type: 'finish'}| {type: 'cancel'}> {
        //
        //Get the synonym(s) and if the word is in English, enquire the category
        //of the word. Upon getting the synonym, search for a term.
        this.root = await this.get_root();
        //
        //Upon search for the term in the database and finding results, enlist ther
        //the terms for the user to select the one that is suitable to him or her.
        //If the user doesn't see the term that s/he is looking for, then compile a 
        //new term using the collected items, i.e., spelling, meaning & synonyms.
        const term: {type: 'yes', name: string}| {type: 'no'}| {type: 'prev'}| {type: 'finish'}| {type: 'cancel'} = 
            await this.select_or_create_term(this.root);
        //
        return term; 
    }
    //
    //Get the root word through either the spelling or meaning routes.
    //The spelling route is the one we take a user through when s/he has 
    //corrected the spelling of the selected word. So we search for a term
    //using the corrected word. 
    //The meaning route is one where the selected word's spelling is correct so 
    //we ask the user to provide its meaning and supplement the word with some 
    //synonym(s) if possible.
    async get_root(): 
        Promise<
            {type: 'singular' | 'present' | 'root' | 'spelling', 'root': string}
            | {type: 'none'}>{
        //
        //Ensure we are coming in with a contribution.
        if (this.contribution === undefined)
            throw new Error('Contribution not defined');
        //
        if (this.contribution.type == 'spelling')
            return {type: 'spelling', root: this.contribution.correction};
        //
        //Capture some synonym(s) which we will use to search for terms in the
        //database.
        const synonym = await this.get_synonym(this.contribution);
        //
        //Indicate that there may be more synonyms to this term.
        //(!synonym.found) ? this.more_synonyms = false : true;
        this.more_synonyms = synonym.type == 'yes';
        //
        //Save the synonym when the user knows some.
        this.save_synonyms(synonym);
        //
        //Get the Swahili and vernacular synonyms provided by the user if they
        //are not in English.
        if (synonym.type == 'yes' && synonym.language !== 'english')   
            return await this.get_derivative(this.contribution);
        //
        //Get the adjectives, adverbs, conjunctions, interjections, et al., 
        //some of these are words  derived from other words.
        if (
            synonym.type == 'yes' 
            && synonym.language == 'english' 
            && synonym.category !== 'noun'
            && synonym.category !== 'verb'
        )return await this.get_derivative(this.contribution);
        //
        //Get the verb, moreso in its present tense form.
        if (
            synonym.type == 'yes' 
            && synonym.language == 'english'
            && synonym.category == 'verb'
        ) return this.get_present(this.contribution);
        //
        //Get the noun in its singular form.
        return this.get_singular(this.contribution);  
    }   
    //
    //Ask the user if s/he knows any synonyms.
    //If s/he has some, ask the language of the word; that will help steer the
    //logic flow accordingly thereby guiding the user in the right direction.
    async get_synonym(
        contribution: 
            {word: string, type: 'spelling', correction: string}
            | {word: string, type: 'meaning', description: string}
            | {word: string, type: 'none'}
    ):
        Promise<
            {type: 'yes', name:string, language: string, category: string}|{type: 'no'}|{type: 'prev'}|{type: 'finish'}|{type: 'cancel'}
        >{
        //
        //Get the language options to show to the user so that s/he may select
        //a synonym's language.
        const options: string = await this.get_language_options();
        //
        //Display the elements that ask the user if they know a synonym(s) of
        //the selected word and then guides the user on the correct steps to 
        //follow.
        const synonyms = `
            Do you know the word's synonym in any language?<br/>
            <label>
                <input 
                    type='radio'
                    name='synonym' 
                    value='yes'
                    onclick='translator.show(true, "yes")'/>Yes
            </label>
            <div id='yes'>
                <label>Enter synonym: <input type='text'/></label>
                <label>
                    Select language: 
                    <select 
                        id='language' 
                        onclick='translator.show(translator.is_english(), "category_group")'>
                            ${options}
                    </select>
                </label>
                <label id='category_group'>
                    Select category: 
                        <select id='category'>
                            <option value='noun'>Noun</option>
                            <option value='verb'>Verb</option>
                            <option value='other'>Other</option>
                        </select>
                </label>
            </div>
            <label>
                <input 
                    type='radio' 
                    name='synonym' 
                    value='no'
                    onclick='translator.show(false, yes)'/>No
            </label>
        `;
        //
        //Attach the elements, used to capture data provided by the user, on the
        //interactions panel.
        this.interactions.innerHTML = synonyms;
        //
        //Get the user's response then act depending on the response.
        return await new Promise((resolve) => {
            //
            //Attach an onclick event in the next button to help capture data
            //provided by the user and steer the program in the right direction.
            this.next.onclick = () => {
                //
                //Get the value of the radio button which is currently checked.
                const value = this.get_checked_value('synonym');
                //
                //Act depending on the value of the user's selection.
                if(value == 'yes'){
                    //
                    //Get the synonym value from the input field.
                    const name = this.get_input_value('synonym');
                    //
                    //Get the select element that is housing the languages.
                    const select_lang = translator.get_element('language');
                    //
                    //Gatekeeper to ensure that the select tag is the one that
                    //is being used.
                    if (!(select_lang instanceof HTMLSelectElement)){
                        //
                        const msg = 'Element used is not a valid select element';
                        //
                        alert(msg);
                        throw new Error(msg);
                    }
                    //
                    //Get the selected language.
                    const language = select_lang.value;
                    //
                    //Ensure a language is selected.
                    if(language == ''){
                        alert(`Please select a language from the provided list`);
                        return;
                    }
                    //
                    //Get the select element that is housing the synonym's categories.
                    const select_category = translator.get_element('category');
                    //
                    //Ensure that the select element is the one that is being
                    //used.
                    if (!(select_category instanceof HTMLSelectElement)){
                        //
                        const msg = 'Element used is not a valide select element';
                        //
                        alert(msg);
                        throw new Error(msg);
                    }                    
                    //
                    //Get the value of the selected category, e.g., noun, verb,
                    //adjective, adverb et al..
                    const category = select_category.value;
                    //
                    resolve({type: 'yes', name, language, category});
                }
                else{
                    //
                    resolve({type: 'no'});
                }
            }
        });       
    }
    //
    //Get the non-english synonym(s), e.g., Swahili, Kikuyu et al.
    async get_derivative(
        contribution: 
            {word: string, type: 'spelling', correction: string}
            | {word: string, type: 'meaning', description: string}
            | {word: string, type: 'none'}
    ): 
        Promise<{type: 'root', root: string} 
        | {type: 'none'}>{
        //
        //Display the elements that ask the user if the synonyms provided is
        //non-english word or an English word that is derived from another word.
        //Then guides the user on the correct steps to follow.
        const derivative = `
            Is the word derived from another word?<br/>
            <label>
                <input 
                    type="radio"  
                    name="derivative" 
                    value="yes"
                    onclick='translator.show(true, "derivative")'/>Yes
            </label>
            <div id='derivative'>
                Enter the root of the word:
                <input type="text" id="root"/>
            </div>
            <label>
                <input type="radio" name="derivative" value="no"/>No
            </label>`;
        //
        //Paint the interactions panel with the interaction elements.
        this.interactions.innerHTML = derivative;
        //
        //Return the derivative word provided by the user.
        return await new Promise((resolve) => {
            //
            //Attach an onlick event to the next button at this juncture.
            //It is responsible for getting user input values then navigating 
            //the user to the next phase of the translation phase.
            this.next.onclick = () => {
                //
                //Retrieve the value of the currently checked radio button; to
                //get the user's choice.
                const value = this.get_checked_value('derivative');
                //
                //Resolve the promise depending on the user's selected value.
                if(value == 'yes'){
                    //
                    //Get root word inputted by the user, from the input field.
                    const root = this.get_input_value('root');
                    //
                    resolve({type: 'root', root});
                }
                else{
                    //
                    resolve({type: 'none'});
                }
            }
        });
    }
    //
    //Get the present tense value provided by the user, if the selected word to
    //translate is a verb.
    async get_present(
        contribution: contribution): 
        //
        //Return the present form of the word in the form of a root.
        Promise<
            {type: 'present', root: string}
            |{type: 'none'}>{
            //
            //Display the elements that guide the user on the right steps to 
            //take in providing useful information about whether the selected 
            //word is a present tense verb; during the translation phase.
            const present = `
                Is the word in present tense form?<br/>
                <label>
                    <input type="radio" name="present" value="yes"/>Yes
                </label>
                <label>
                    <input 
                        type="radio" 
                        name="var" 
                        value="no"
                        onclick="translator.show(true, 'present')"/>No
                </label>
                <input type="text" id="present"/>
            `;
            //
            //Attach the elements which the user is to use for interactions 
            //on the interactions panel.
            this.interactions.innerHTML = present;
            //
            //Return the present word provided by the user; if there is any.
            return await new Promise((resolve) => {
                //
                //Attach an onclick event on the next button; it should get the 
                //present word (if any) then steers the user ahead in the
                //translation phase.
                this.next.onclick = () => {
                    //
                    //Get the value of the currently checked radio button.
                    const value = this.get_checked_value('present');
                    //
                    //Get the present value provided by the user, i.e., if the 
                    //selected word is a verb in a non-present form, e.g., past tense.
                    if(value == 'yes'){
                        //
                        resolve({type: 'none'});
                    }
                    else{
                        //
                        //Get the present word.
                        const present = this.get_input_value('present');
                        //
                        resolve({type: 'present', root: present});
                    }
                }
            });            
    }
    //
    //Get the singular form of the selected word; if the selected word is a noun
    //other than a proper noun, i.e., a noun which could have a singular/plural
    //form.
    async get_singular(
        contribution: contribution
    ): 
        //
        //Return the singular form of the word in the form of a root.
        Promise<{type: 'singular', root: string}
        |{type: 'none'}>{
            //
            //Display the elements that guide the user on the right steps to 
            //take in providing useful information about whether the selected 
            //word is in singular form; during the translation phase.
            const noun = 
                `Is the selected word a Proper noun><br/>
                <label>
                    <input type="radio" name="noun" value="yes"/>Yes
                </label>
                <label>
                    <input type="radio" name="noun" value="no"/>No
                </label>
                <div id="singular">
                    Is it in singular form?
                    <label>
                        <input type="radio" name="singular" value="yes"/>Yes
                    </label>
                     <label>
                        <input 
                            type="radio" 
                            name="singular" 
                            value="no"
                            onclick='translator.show(true, "show")'/>No
                    </label>
                        <div id='show'>
                            Enter the singular form of the word
                            <input type="text" id="singular"/>
                        </div>
                </div>`;
            //
            //Attach the elements used to guide the user during the translation 
            //phase. In this particular case, we are asking the user if the 
            //selected word is a noun, and which type of noun it is.
            this.interactions.innerHTML = noun;
            //
            //Return the singular form of the word if it is a noun; other than 
            //a proper noun which can't be pluralized.
            return await new Promise((resolve) => {
                //
                //Attach an onclick event on the next button; it captures data
                //provided by the user and steers him/her ahead during the 
                //current translation phase.
                this.next.onclick = () => {
                    //
                    //Get the value of the currently checked radio button.
                    const value = this.get_checked_value('noun');
                    //
                    //Get the singular form of the word if the word is a noun
                    //other than a proper noun which can't be pluralized.
                    if(value == 'yes'){
                        //
                        resolve({type: 'none'});
                    }
                    else{
                        //
                        //Get the singular word.
                        const singular = this.get_input_value('singular');
                        //
                        resolve({type: 'singular', root: singular});
                    }
                }
            }); 
    }
    //
    //Select or create a term depending on if the results of a search yields a
    //a term.
    async select_or_create_term(
        root: 
            {type: 'singular' | 'present' | 'root' | 'spelling', 'root': string}
            | {type: 'none'}
    ): 
        Promise<{type: 'yes', name: string}| {type: 'no'}| {type: 'prev'}| {type: 'finish'}| {type: 'cancel'}>{
        //
        //Check what we collected during the get_root() phase and if there is no
        //root to help in searching for terms, compile a new term.
        if (root.type == 'none') return this.create_term(root);
        //
        //Upon collecting root words, e.g., a corrected spelling and synonym(s),
        //look for terms that match the root words (in the database).
        let terms: Array<{name: string, meaning: any}> = await this.search_term(root.root);
        //
        //If no terms are found during the searching phase, compile a new term
        //using the collected word like spelling, synonyms and meaning.
        if(terms.length == 0) return this.create_term(root);
        //
        //Display the terms on the terms panel.
        this.list_terms(terms);
        //
        //Provide the user the chance to select the term that s/he is looking for.
        let answer: {type: 'yes', name: string}| {type: 'no'}| {type: 'prev'}| {type: 'finish'}| {type: 'cancel'} = 
            await this.select_term(terms);
        //
        return answer;
    }
    //
    //
    create_term(
        root: 
            {type: 'singular' | 'present' | 'root' | 'spelling', 'root': string}
            | {type: 'none'}
    ): 
        {type: 'yes', name: string}| {type: 'no'}| {type: 'prev'}| {type: 'finish'}| {type: 'cancel'}{
            //
            //Did you pass through the synonym no route.
            if (!this.more_synonyms)
                return {type: 'no'};
            //
            //Compile the name of the term.
            const name: string = this.get_term_name(this.contribution!, root);
            //
            //
        return {type: 'yes', name: name};
    }
    //
    //
    get_term_name(c: contribution, r: root): string{
        //
    }
    //
    //Use the selected word and collected root word to search for their 
    //corresponding terms. The term results of this method are purely for showing
    //the user the usages of the selected word. The results are displayed in the
    //terms panel.
    async search_term(root: string): Promise<Array<{name: string, meaning: string}>>{
        //
        //Formulate the query to get the terms
        const sql = `
            select 
                    term.name as object, 
                    translation.meaning,
                    language.name as language,
                    word.name as translation
                from language
                inner join 
                    translation on translation.language = language.language
                inner join 
                    term on translation.term = term.term
                inner join 
                    synonym on synonym.translation = translation.translation
                inner join 
                    word on synonym.word = word.word
                inner join (
                        select word.name, term.term
                    from word
                    inner join synonym on synonym.word = word.word
                    inner join translation on synonym.translation = translation.translation
                    inner join term on translation.term = term.term
                    where word.name = ${root}
                ) as search on search.term = term.term
        `;
        //
        //Execute the exec method, in the library, to get the terms.
        const terms: 
            Array<{term: string, meaning:string, language:string, translation:string}> = 
            await server.exec(
                'database',
                ['kentionary3'],
                'get_sql_data',
                [sql]
            );
        //
        //Feed the terms into well formatted label and inputs.
        const terms_radio: Array<string> = terms.map(term => {
            `${term.term} 
            ${term.meaning}
            ${term.language} 
            ${term.translation} 
            `
        });
        //
        //Converted the formatted array of results into a string.
        const name: string = terms_radio.join('\n');
        //
        //Return the term name, meaning, language and translation; to display
        //them in the terms panel
        return name;
    }
    //
    //Enlist the terms in a simple form for the user to select one.
    async list_terms(terms: Array<{name: string, meaning: any}>): Promise<void>{
        //
        //This seems to be implemented by select_term method.
    }
    //
    //LIst the retrieved terms and allow the user to choose a term (if any) 
    //from the provided list of terms.
    async select_term(terms: Array<{name: string, meaning: any}>): 
        Promise<{type: 'yes', name: string}| {type: 'no'}| {type: 'prev'}| {type: 'finish'}| {type: 'cancel'}>{
        //
        //Display the terms to select from.
        const display = `
            <div>
                Please select a term that is related to what you are looking for<br/>
                <label>
                    <input type='radio' name='term' value='hau'/>hau
                </label><br/>
                <label>
                    <input type='radio' name='term' value='ni'/>ni
                </label><br/>
                <label>
                    <input type='radio' name='term' value='wega'/>wega
                </label><br/>
                <label>
                    <input type='radio' name='term' value='muno'/>muno
                </label><br/>
                <label>
                    <input type='radio' name='term' value='none'/>none of the above
                </label>
            </div>
        `;
        //
        //Attach the display message above to the interaction panel.
        this.interactions.innerHTML = display;
        //
        //Wait for the user to select a term and return a term when done.
        return await new Promise((resolve => {
            //
            //Attach an onclick event to the next button to navigate the user to
            //the next translation phase. In this case, get the value of the 
            //selected term, if selected.
            this.next.onclick = () => {
                //
                //Get the value of the currently selected radio button.
                const value = this.get_checked_value('term');
                //
                //Check the selected value then guide the user to the next phase
                //of the translation process.
                if(value !== 'none'){
                    //
                    //Get the value of the selected term.
                    const name = this.get_checked_value('?');
                    //
                    //Return the value of the selected term.
                    resolve({type:'yes', name});
                }
                else{
                    //
                    resolve({type: 'no'});
                }
            }
        }));
    }
    //
    //Allow the user to supplement the root word with more words.
    async enrich_term(contribution: contribution, r:root, term: term): Promise<any>{
        //
        //Check the route the user used and if s/he would like to add one or 
        //more synonyms.
        //
        let synonym: synonym;
        //
        //Loop through all the available synonyms.
        while (
           this.more_synonyms
            && (synonym = await this.get_synonym(this.contribution!)).type == 'yes'
        ) this.save_synonyms(synonym);
    }
    //
    //Save the details provided by the user, in the database.
    save(enrichment: any): any{
        //
    }
    //
    //Ask the user if s/he would want to translate another word.
    async pick_term(): Promise<boolean>{
        //
        //
        const pick = `
            Do you want to translate another word?<br/>
            <label><input type='radio' name='pick' value='yes'/>Yes</label>
            <label><input type='radio' name='pick' value='no'/>No</label>`;
        //
        //Attach the elements to interogate the user.
        this.interactions.innerHTML = pick;
        //
        //Use the user's response to direct him/her to the next phase.
        return await new Promise((resolve =>{
            //
            //Attach an onclick event to navigate the user to the next phase 
            //upon adhering to the conditions of the current interactions panel.
            this.next.onclick = () => {
                //
                //Get the value of the currently checked radio button.
                const value = this.get_checked_value('pick');
                //
                //Act depending on the user's selection.
                //Also resolve(value == 'yes');
                if(value == 'yes'){
                    //
                    //Take the user to the start of the translation process.
                    resolve(true);
                }
                else{
                    //
                    //Finish the translation process.
                    resolve(false);
                }
            }
        }));
    }
    //
    //
    save_synonyms(
        synonym: 
            {type: 'yes', name:string, language: string, category: string}
            |{type: 'no'}
            |{type: 'prev'}
            |{type: 'finish'}
            |{type: 'cancel'}
    ){
        //
        if (synonym.type == 'yes'){
           //
            //
            const name = synonym.name;
            const language = synonym.language;
            const category = synonym.category;
            //
            const new_synonym = {name, language, category};
            //
            this.synonyms.push(new_synonym); 
        }
    }
    //
    //This is a generalized function that get general html elements by providing
    //its identifier. Since we initially don't know the type of the element,
    //we can get any HTMLElement then typescript will know the element's type by
    //checking its usages, 
    //e.g., public next: HTMLButtonElement, 
    //      public div: HTMLDivElement.
    static get_element<o>(id: string): o {
        //
        //Get the identified element from the current browser context.
        const element: HTMLElement | null = document.querySelector(`#${id}`);
        //
        //Check the element for a null value
        if (element === null) {
            const msg = `The element identified by '#${id}' not found`;
            alert(msg);
            throw new Error(msg);
        }
        //
        //Since we don't know the exact type of the element we are getting,
        //we make it unknown first then typescript will know the element's type by
        //checking its usages,
        //e.g., public next: HTMLButtonElement, 
        //      public div: HTMLDivElement.
        return <o>(<unknown>element);
    }
    //
    //Get the value of the currently checked input button.
    get_checked_value(name: string): string{
        //
        //The required CSS selector has the following:-
        const css = `input[name='${name}']:checked`;
        //
        //Get the radio button that is currently selected.
        const radio: HTMLInputElement | null =
            document.querySelector(css);
        //
        //Ensure that there is a selection. Abort the process
        if(radio == null){
            //
            const message = 
                `The element selected by CSS '${css}' is not found.`;
            //
            alert(message);
            //
            throw new Error(message);
        }
        //
        //Ensure the radio is of HTMLInputElement.
        if(!(radio instanceof HTMLInputElement)){
            //
            const message = `This is not an valid input field`;
            //
            alert(message);
            //
            throw new Error(message);
        }
        //
        return radio.value;
    }
    //
    //Get the value of an input field.
    get_input_value(id: string): string {
        //
        //Get the identified element.
        const element = translator.get_element(id);
        //
        //Verify that the element is of the input type.
        if(!(element instanceof HTMLInputElement)){
            //
            const msg = `The element identified by '${id}' is not of input type`;
            //
            alert(msg);
            //
            throw new Error(msg);
        }
        return element.value;
    }
    //
    //Show/hide the identified HTML element depending on the display option.
    static show(display: boolean, id: string): void{
        //
        //Get the identified element.
        const element: HTMLElement = translator.get_element(id);
        //
        //Show/hide it.
        element.hidden = !display;
    }
    //
    //Check if the selected language is English.
    static is_english(): boolean{
        //
        //Get the select element.
        const select: HTMLElement | null= document.getElementById('language');
        //
        //Ensure a there is a selection.
        if(select == null){
            alert(`Please select a language from the provided list`);
            return false;
        }
        //
        if(!(select instanceof HTMLSelectElement)){
            //
            const msg = `The element used is not a HTMLSelectElement.`;
            //
            alert(msg);
            throw new Error(msg);
        }
        //
        //Get the value of the selected select option.
        const value = select.value;
        //
        //Check the language of the selected option; if it is English or not.
        return (value == 'English');
    }
    //
    //Get the language options for plugging to the select statement, e.g.,
    //<option value='english'>English</option>
    //<option value='kikuyu'>Kikuyu</option>
    async get_language_options(): Promise<string>{
        //
        //Get all languages from the database.
        const languages: Array<{name: string}> = 
            await server.exec(
                'database',
                ['kentionary3'],
                'get_sql_data',
                ['select name from language']
            );
        //
        //Formulate the options from the languages.
        const options: Array<string> = languages.map(language => 
            `<option value='${language.name}'>${language.name}</option>`
        );
        //
        //Convert the options into some text.
        const options_str: string = options.join('\n');
        //
        //Return the text.
        return options_str;
    }
}