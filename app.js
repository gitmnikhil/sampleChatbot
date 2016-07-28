var restify = require('restify');
var builder = require('botbuilder');
var Client = require('node-rest-client').Client;
var client = new Client();

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3798, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: "63bf713a-ea95-495a-a285-67c0cdec5813",
    appPassword: "bPSLoYd955CDhynX6pViPq7"
    //appId: process.env.MICROSOFT_APP_ID,
    //appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
var intents = new builder.IntentDialog();

bot.dialog('/', intents);

intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

intents.onDefault([
    function (session, args, next) {
        session.beginDialog('/update');
    }
]);

bot.dialog('/update', [
    function (session, args, next) {
        if(session.reAskuserResponse){
            session.reAskuserResponse = false;
            builder.Prompts.text(session, 'I am sorry, I could not understand. Do you want an upgrade recommendation? Yes/No');    
        }else{
            builder.Prompts.text(session, 'Welcome to opsfaq! Do you want an upgrade recommendation? Yes/No');    
        }
    },
    function (session,results) {
        if(results.response.toLowerCase().indexOf("yes")>-1){
            builder.Prompts.text(session, 'Provide me some  information about your docker environment. Type in whatever you want to');
            next();
        }else if(results.response.toLowerCase().indexOf("no")>-1){
            session.send('Thank you for our interaction. Ping me if you need me later');
            session.endDialog();
        }else{
            session.reAskuserResponse = true;
            session.replaceDialog('/update');
            return;
        }
    },
    function (session, results) {
        session.dialogData.updateOne = results.response;
        builder.Prompts.text(session, 'Thank you. I also need some more information. Type in some more for me please');
        next();
    },
    function(session,results){
        session.dialogData.updateTwo = results.response;
        session.send("You provided '"+session.dialogData.updateOne + " "+session.dialogData.updateTwo+ "'. I am going to find out the upgrade recommendation based on your input and will ping you soon");
        //send call to server
        //get response from server
        //session.send response
        sendRequest(session);
        session.endDialog();
    }
]);
var sendRequest = function(session){
    var args = {
        data: { test: "hello" },
        headers: { "Content-Type": "application/json" }
    };
    client.registerMethod("jsonMethod", "http://104.197.241.157:8080/v1/upgrade", "POST");
    client.methods.jsonMethod(args, function (data, response) {
        // parsed response body as js object
        console.log(JSON.stringify(data));
        session.send(JSON.stringify(data))
    });
}