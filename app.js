/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

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
var storageName = "ilxbotstorage";
var storageKey = 'gzufJ6z3CRCbv8/FuKITCTDwIOSfQqSPDiqvZKMyliQrPlT1VrWx8BU7Ah+yDRJ8e0pfxRR+raLlljetTDYNBw==';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, storageName, storageKey);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

bot.dialog('/', function (session) {
    const botName = 'ilxbot2';
    const cleanedMessage = session.message.text.replace(botName, '').trim();
    const args = cleanedMessage.split(' ');
    const setStringWords = new Set(args)
    const returnMsg = '';
    const arrayEmoji=[]
    var hasEmoji= setStringWords.has('emoji');

    session.on('error', function (err) {
        session.send('Failed with message: %s', err.message);
        session.endDialog();
    });
    
    try {
        if (setStringWords.has('ping')) {
            session.send('pong!');
        }
        else if (hasEmoji) {
            var emoji = require('node-emoji');
            let indexEmoji = args.indexOf('emoji')
            let message = ''
            const elementAfterEmoji = args[parseInt(indexEmoji)+1]
            const emojiElement = emoji.search(elementAfterEmoji)
            if (emojiElement.length == 0) {
                message = emoji.emojify('Sorry, we don\'t have that emoji! :sad:');
            }
            else {
                emojiElement.forEach(element => {
                    message += element.emoji
                });
            }
            session.send(message);
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
    } catch (err) {
        session.error(err);
    }

    // capture session user information
    session.userData = {"userId": session.message.user.id, "jobTitle": "H4xx0r"};
    // capture conversation information
    const timestamp = new Date();
    session.conversationData[timestamp.toISOString().replace(/:/g,"-")] = session.message.text;
    // save data
    session.save();
});
