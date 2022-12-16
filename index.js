const dotenv = require("dotenv");
dotenv.config();
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
var profanity = require("profanity-hindi");
const translate = require('@vitalets/google-translate-api');
const axios = require('axios');
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});






// open ai api

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


async function searchNotes(topic) {
var response =  await openai.createCompletion({
  model: "text-davinci-002",
  prompt: topic,
  temperature: 0.3,
  max_tokens: 150,
  top_p: 1.0,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
});
return(response.data.choices[0].text);
}








async function chatWithAi(topic) {
    const chatResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: topic,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
      });
      return chatResponse.data.choices[0].text;
    }



async function translateKar(text) {
    const translated = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0.3,
        max_tokens: 100,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });
      return translated.data.choices[0].text;
    }


async function codex(text) {
    const code  = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0.1,
        max_tokens: 1024,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });
      return code.data.choices[0].text;
    }









// Set the menu options and corresponding responses
// const menu = {
//     "Search": "Type a keyword to search for. (e.g. Search: WhatsApp / search: WhatsApp)",
//     "Translate": "Type the text you want to translate  (e.g. Translate:your text here   /  translate:your text here  ).",
//     "search": "Type a keyword to search for.  (e.g. Search: WhatsApp / search: WhatsApp)",
//     "translate": "Type the text you want to translate (e.g. Translate:your text here   /  translate:your text here  ).",
//     "Notes":   "Type a question for which you need notes  (e.g. notes: what is gravity? / notes: what is gravity )",
//     "notes":   "Type a question for which you need notes  (e.g. notes: what is gravity? / notes: what is gravity )",
//     "Chat":   "start chat with ai   (e.g. Chat: whats your name mr. bot? / chat: whats your name mr. bot? )",
//     "chat":   "Type a question for which you need notes  (e.g.chat: whats your name mr. bot? /  Chat: whats your name mr. bot? )",
// };

// Set the API endpoints for searching and translating

const searchEndpoint = "https://en.wikipedia.org/api/rest_v1/page/summary/";




// Listen for incoming messages from users
client.on('message', async msg => {


//check for profanity words
    var isDirty = profanity.isMessageDirty(msg.body);
	if(isDirty){
		msg.reply("Warning! Don't Abuse\n Bot" );
	}



    // await client.sendMessage(msg.from,);
        
 

    if (msg.body== 'menu' ||msg.body == 'Menu') {
    await client.sendMessage(msg.from, ` 
 1. Search:   Type a keyword to search for.  (e.g. *Search:* *WhatsApp* / *search:* WhatsApp)

 2. Translate: Type the text you want to translate (e.g. Translate:your text here.... into hindi   /  translate:your text here..... into hindi  ).

 3. Notes:     Type a question for which you need notes  (e.g. notes: what is gravity? / notes: what is gravity )

 4. Chat:      chit chat with ai  (e.g. ? whats your name mr. bot? / ? whats your name mr. bot? )
 5. Codex:      Get a solution of any programming question. (e.g. Code: whats your name mr. bot? / code: whats your name mr. bot? )
         `);
    }
    

        // Send the corresponding response for the selected option
       
    
    
     if (msg.body.startsWith("Search: ")||msg.body.startsWith("search: ")) {
        // Extract the keyword to search for from the message
        const keyword = msg.body.split(": ")[1];
                console.log(keyword);
        // Call the search API to get results for the keyword
        const response = await axios.get(`${searchEndpoint}` + keyword);
               console.log(response.data.extract);
        // Send the search results to the user using the WhatsApp Business API
        await client.sendMessage(msg.from, response.data.extract);
    }
    
    
    else if (msg.body.startsWith("T: ")||msg.body.startsWith("t: ")) {

        // Extract the text to translate and the target language from the message
        const text = msg.body.split(", ")[0].split(": ")[1];
        console.log(text);
         let result = await translateKar(text);
         
         client.sendMessage(msg.from, `Translation is:${result}`);


  


    }

    else if (msg.body.startsWith("notes: ")||msg.body.startsWith("Notes: ")) { 


        const text = msg.body.split(", ")[0].split(": ")[1];
        console.log(text);
        let result = await searchNotes(text);
        client.sendMessage(msg.from, `Notes are:${result}`);

        
    }
    else if (msg.body.startsWith("? ")||msg.body.startsWith("? ")) { 


        const text = msg.body.split(", ")[0].split("? ")[1];
        console.log(text);
        let result = await chatWithAi(text);
        client.sendMessage(msg.from,  `${result}`);

        
    }

    else if (msg.body.startsWith("code: ")||msg.body.startsWith("Code: ")) { 


        const question = msg.body.split(", ")[0].split(": ")[1];
        
        let result = await codex(question);
        client.sendMessage(msg.from,  `${result}`);

        
    }
    
});
client.initialize();