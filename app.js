/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
var emoji = require('node-emoji');


// Setup Restify Server
var server = restify.createServer();
console.log(server)
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

bot.dialog('/', function (session) {
    const botName = 'ilxbot2';
    const cleanedMessage = session.message.text.replace(botName, '').trim();
    const args = cleanedMessage.split(' ');
    const returnMsg = '';
    const arrayEmoji=[]
    var hasEmoji= args.includes(emoji)
    let indexEmoji;
    if (hasEmoji){
        indexEmoji = args.indexOf('emoji')
    }
    if (args.indexOf('ping')) {
        session.send('pong!');
    }
    else if (hasEmoji) {
        const elementArray = []
        // for (let index = indexEmoji+1; index < args.length; index++){
        //     elementArray.push(args[index]);
        // }
        const elementAfterEmoji = args[indexEmoji+1]
        const emojiElement = emoji.search(elementAfterEmoji)
        session.send(emojiElement);
    }
    else if (args[1].includes('debug session')) {
        session.send(JSON.stringify(session, null, 2));
    }
    else if (args[1].includes('debug message')) {
        session.send(JSON.stringify(session.message, null, 2));
    }
    else {
        const messageData = JSON.stringify(args);
        session.send(`I don\'t understand! Message: "${cleanedMessage}", Split message: ${messageData}`);
    }
});
