const dotenv = require("dotenv");
const qrcode = require("qrcode-terminal");
var profanity = require("profanity-hindi");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();

const client = new Client({
  authStrategy: new LocalAuth(),
});

// Generate qr for string
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Ready to go
client.on("ready", () => {
  console.log("Client is ready!");
});

// OpenAI model Api
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
  const code = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: text,
    temperature: 0.2,
    max_tokens: 1024,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.2,
  });
  return code.data.choices[0].text;
}

// Listen for incoming messages from users
client.on("message", async (msg) => {
  //Check for profanity words
  var isDirty = profanity.isMessageDirty(msg.body);
  if (isDirty) {
    msg.reply("Warning! Don't Abuse Here\n");
  }
//   await client.sendMessage(msg.from, "undefined");

  if (msg.body == "menu" || msg.body == "Menu") {
    await client.sendMessage(
      msg.from,
      ` 
 1. Chat:  Chit chat with ai\n\n\t\tFor example:\nc: What's your name?\nC: what's your name?\n
 2. Codex:  Get a solution of any programming question\n\n\t\tFor example:\nc: Write a code for linear search in c++\nC: Write a code for linear search in c++\n
         `
    );
  }

  if (msg.body.startsWith("q: ") || msg.body.startsWith("Q: ")) {
    const text = msg.body.split(", ")[0].split(": ")[1];
    console.log(text);
    let result = await searchNotes(text);
    client.sendMessage(msg.from, `Ans:${result}`);
  } else if (msg.body.startsWith("c: ") || msg.body.startsWith("C: ")) {
    const text = msg.body.split(", ")[0].split(": ")[1];
    console.log(text);
    let result = await codex(text);
    client.sendMessage(msg.from, `${result}`);
  }
});
client.initialize();
