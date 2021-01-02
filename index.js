require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID
const THIS_YEAR_TIMESTAMP = 1609502400000
const LAST_YEAR_TIMESTAMP = 1577880000000

const client = new Discord.Client();

client.login(TOKEN);

client.on('ready', () => {
  exportQuotes()
});

async function exportQuotes() {
  var all_messages = []
  
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);      
    
    var messages = (await channel.messages.fetch({ limit: 100 }))
      .filter(it => it.createdTimestamp <= THIS_YEAR_TIMESTAMP && it.createdTimestamp >= LAST_YEAR_TIMESTAMP);

    while (messages.last().createdTimestamp >= LAST_YEAR_TIMESTAMP) {
      await sleep(250);

      console.log(`Fetching... ${messages.last().createdTimestamp}`);

      all_messages.push(...messages.map(it => it.content));
      messages = await channel.messages.fetch({ before: messages.last().id, limit: 100 });
    }

    all_messages = all_messages.filter((it) => it.length > 0);
    all_messages.push(
      ...messages
        .filter(it => it.createdTimestamp <= THIS_YEAR_TIMESTAMP && it.createdTimestamp >= LAST_YEAR_TIMESTAMP)
        .map(it => it.content)
    );    

    writeToQuotesFile(all_messages);
  } catch (e) {
    console.error(e);
  }
}

function writeToQuotesFile(all_messages) {
  fs.truncateSync('quotes.txt', 0);

  var stream = fs.createWriteStream("quotes.txt");

  stream.once('open', function (_) {
    all_messages.forEach((it) => {
      stream.write(`${it}\n`);
    });
    stream.end();
    console.log("done!");
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   