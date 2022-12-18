const dotenv = require("dotenv");
const qrcode = require('qrcode-terminal');
var profanity = require("profanity-hindi");
const translate = require('@vitalets/google-translate-api');
const axios = require('axios');
const { Client, LocalAuth } = require('whatsapp-web.js');

dotenv.config();

const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate qr for string
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Ready to go
client.on('ready', () => {
    console.log('Client is ready!');
});

// OpenAI model Api
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

//& for normal searches or find the answer of any general query
async function searchNotes(topic) {
    const chatResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: topic,
        temperature: 0.3,
        max_tokens: 1024,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
      });
      return chatResponse.data.choices[0].text;
    }

//^ For help in code 
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

const searchEndpoint = "https://en.wikipedia.org/api/rest_v1/page/summary/";

// Listen for incoming messages from users
client.on('message', async msg => {

//check for profanity words
    var isDirty = profanity.isMessageDirty(msg.body);
	if(isDirty){
		msg.reply("Warning! Don't Abuse\n Bot" );
	}

    await client.sendMessage(msg.from,);

    if (msg.body== 'menu' ||msg.body == 'Menu') {
    await client.sendMessage(msg.from, ` 
 1. Search:   Type a keyword to search for.  (e.g. *Search:* *WhatsApp* / *search:* WhatsApp)

 2. Translate: Type the text you want to translate (e.g. Translate:your text here.... into hindi   /  translate:your text here..... into hindi  ).

 3. Notes:     Type a question for which you need notes  (e.g. notes: what is gravity? / notes: what is gravity )

 4. Chat:      chit chat with ai  (e.g. ? whats your name mr. bot? / ? whats your name mr. bot? )
 5. Codex:      Get a solution of any programming question. (e.g. Code: whats your name mr. bot? / code: whats your name mr. bot? )
         `);
    }
    
    if (msg.body.startsWith("q: ")||msg.body.startsWith("Q: ")) { 
        const text = msg.body.split(", ")[0].split(": ")[1];
        console.log(text);
        let result = await searchNotes(text);
        client.sendMessage(msg.from, `Ans:${result}`); 
    }
    else if (msg.body.startsWith("c: ")||msg.body.startsWith("C: ")) { 
        const question = msg.body.split(", ")[0].split(": ")[1];
        let result = await codex(question);
        client.sendMessage(msg.from,  `${result}`);
    }
    
});
client.initialize();