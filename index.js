const path = require('path');
const util = require('util');
const trovojs = require('trovo.js');
const { CHAT_TYPES } = require('trovo.js/lib/data/enums');
const { execFile } = require('child_process');
const fs = require('fs');
const { ifError } = require('assert');

const bot = require(path.join(__dirname, 'modules', 'Bot.js'));

var dev = false;
const client = new trovojs.BrowserClient({logger : bot.log, headless : !dev});
const namesJSON = fs.readFileSync("json\\constants.json");
const names = JSON.parse(namesJSON);

const insultJSON = fs.readFileSync("json\\insults.json");
const insults = JSON.parse(insultJSON);

const everyoneJSON = fs.readFileSync("json\\everyoneCommands.json");
const everyone = JSON.parse(everyoneJSON);

const modJSON = fs.readFileSync("json\\modCommands.json");
const mod = JSON.parse(modJSON);

const devJSON = fs.readFileSync("json\\devCommands.json");
const devCom = JSON.parse(devJSON);

var startTime = 0;
var ptsFile = "..\\db\\points.json"
var infile = fs.readFileSync(ptsFile)
var viewers = JSON.parse(infile);

var messageFile = fs.readFileSync("json\\messages.json");
var messages = JSON.parse(messageFile);

const manaJSON = fs.readFileSync("json\\mana.json");
const mana = JSON.parse(manaJSON);

const ballJSON = fs.readFileSync("json\\eightball.json");
const ball = JSON.parse(ballJSON);

var settings = "json\\settings.json";
var enable = true;
var cooldown = false;
var cooldownCount = 0;

var commandStr = getCommands()

var chestChances = [30, 0, 0, 20, 10, 5, 10, 0, 45, 10, 75, 0, 25, 35, 5, 0, 5, 0, 
    30, 35,20, 65, 10, 25, 15, 0, 20, 0, 50, 0, 5, 10, 5, 5, 0, 0, 40, 0, 0, 0, 25, 
    20, 25, 60, 0, 150, 0, 0, 10, 70, 0, 0, 10, 5, 10, 0, 5, 15, 5, 0, 0, 0, 0, 5, 
    5, 15, 5, 0, 10, 0, 0, 5, 15, 0, 0, 5, 20, 80, 5, 0, 5, 5, 0, 0, 25, 30, 0, 0, 
    0, 0, 5, 15, 0, 55, 0, 0, 10, 0, 5, 5];

bot.setClient(client);
bot.setRoot(path.resolve(__dirname));
bot.setData(path.join(__dirname, 'data'));
bot.loadSettings(path.join(__dirname, settings));

client.on('chatMessage', (message) =>{
    bot.log( message );
    if( message.content.startsWith("!") ){
        if( message.badges != null  && message.badges.includes('creator') ){
            creatorCommands(message);
        } else if( message.user == bot.settings.dev.name ){
            devCommands(message)
        } else if( message.badges != null && checkIfMod(message.badges)){
            modCommands(message);
        } else if( message.badges != null && checkIfSub(message.badges) ){
            subOnlyCommands(message);
        } else if( userInViewers(message.user) ) {
            everyoneCommands(message);
        } else {
            if( message.user != bot.settings.trovo.bot_name && message.user != bot.settings.bot.name ){
                client.sendMessage("@" + message.user + " Please follow the channel to get access to commands!")
            }
        }
    }

    if( !message.content.startsWith("!") ){
        updatePoints(message.user, 1, viewers);
    }
})

client.on('chatEvent', (event, data)=>{
    bot.log(event);
    bot.log(data);
    switch( event ){
        case 'userFollowed':
            client.sendMessage("Yoooo Thanx For The Follow @" + data.user +   " Welcome To Console Nation 🤣 : - Use New Commands -" + commandStr);
            if( userInViewers(data.user) ){
                updatePoints(data.user, 150);
            } else {
                addToViewers(data.user, 150, 0);
            }
            break;
        case 'giftRecieved':
            if( !cooldown ){
			    giftRecieved(data)
            }
            cooldownCount = cooldownCount + 1 
            break;
        case 'userSubbed':
            client.sendMessage("@" + data.user + " has became one of us!!!! 📣📣📣📣");
            if( userInViewers(data.user) ){
                updatePoints(data.user, 150);
            } else {
                addToViewers(data.user, 150, 0);
            }
            break;
        case 'userJoined':
            client.sendMessage("@" + data.user + " Welcome to Console Nation!");
            break;
    }
})

client.on('ready', () =>{
    bot.log('Connected to Trovo....');
    bot.log('\n');
    startTime = Math.round(new Date().getTime() / 1000);

    setTimeout( function() {
        client.sendMessage('🤖🤖🤖 ' + bot.settings.trovo.bot_name  +  ' is online 🤖🤖🤖');
    }, 2000);


        setInterval( function(){
            setTimeout( function() {
                if( enable ){
                    for( var key in viewers ){ 
                        updatePoints(viewers[key].name, 25)
                    }
                    const jsonString = JSON.stringify(viewers, null, 2);
                    fs.writeFileSync(ptsFile, jsonString);
                    client.sendMessage("CN points have been distributed. To start earning points type !points or follow the channel 🤣🤣🤣 ");
                }
            }, 1000);
        }, 3600000 ); //3600000 -> this value is an hour (1000 = 1 second)
    
     setInterval( function(){
        const jsonString = JSON.stringify(viewers, null, 2);
        fs.writeFileSync(ptsFile, jsonString);
     }, 100000 );

     setInterval( function(){
        cooldown = false;
        cooldownCount = 0;
     }, 300000 );
})

client.login(
    bot.settings.trovo.page,
    bot.settings.trovo.email,
    bot.settings.trovo.password,
    bot.settings.owner.email || null,
    bot.settings.owner.password || null
)

function creatorCommands(message){
    switch( message.content.trim() ){
        default:
            break;
    }
    devCommands(message);
}

function devCommands(message){
    var command = message.content.trim().toLowerCase()
    switch( command ) {
        case "!status":
            if( enable ){
                client.sendMessage( devCom[2].message );
            } else{
                client.sendMessage( devCom[3].message );
            } 
            break;
        case '!save':
        case '!stop':
            setTimeout( function() {
                client.sendMessage( devCom[4].message );
                const jsonString = JSON.stringify(viewers, null, 2);
                fs.writeFileSync(ptsFile, jsonString);
            }, 2000);
            if( message.content == devCom[5].name){
                client.sendMessage( devCom[5].message );
            }
            break;
        default:
            for( i in devCom ){
                if( command == devCom[i].name ){
                    client.sendMessage( devCom[i].message )
                    enable = command == "!on"
                }
            }
            break;
    }
    modCommands(message);
}

function modCommands(message){
    var splitMessage = message.content.split(" ");
    var command = splitMessage[0].toLowerCase();
    var addedUser = splitMessage[1];
    var pts = splitMessage[2];
    switch( command ){
        case "!add":
            addedUser = addedUser.replace("@", "");
            if( !userInViewers(addedUser) ){
                addToViewers(addedUser, 1, 0)
                client.sendMessage("@" +addedUser+ " has been added and can start earning points")
            } else {
                client.sendMessage("User is already in viewers")
            }
            break;
        case "!addPoints":
            addedUser = addedUser.replace("@", "");
            if( userInViewers(addedUser) && parseInt(pts) > 0){
                updatePoints(addedUser, parseInt(pts), viewers)
                client.sendMessage("@" +addedUser+ " has been given " + pts + " points")
            } else {
                client.sendMessage("User is not in viewers or points are not positive")
            }
            break;
        default:
            for( i in mod ){
                if( mod[i].name == command.toLowerCase() ){
                    client.sendMessage(mod[i].message)
                    break;
                }
            }
            break;
    }

    subOnlyCommands(message);
}

function subOnlyCommands(message) {
    switch( message.content.trim() ){
        default:
            break;
    }
    everyoneCommands(message);
}

function everyoneCommands(message){

    var splitMessage = message.content.split(" ");
    var first = splitMessage[0].toLowerCase();
    var second = splitMessage[1];

    bot.log(message)

    switch( first.trim() ){
        case '!dice':
            let amount = parseInt(second);
            var diceAmount = (rollDice() + 1) + (rollDice() + 1);
            var botAmount  = (rollDice() + 1) + (rollDice() + 1);

            if( botAmount > 12 ){
                botAmount = 12;
            }

            if( getUserPoints(message.user) >= amount ){

                var msg = ( bot.settings.trovo.bot_name + " rolled a " + botAmount + ". @" + message.user + " rolled a " + diceAmount)
                if( botAmount > diceAmount ){
                    msg = msg + ". Looks like the bot won. suckah!"
                    updatePoints(message.user, -amount)
                } else if( diceAmount > botAmount ){
                    msg = msg + ". Looks like you won. Congrats! you did it!"
                    updatePoints(message.user, amount)
                } else {
                    msg = msg + ". Looks like a push. No points lost"
                }

                client.sendMessage(msg)
            } else if( amount.length == 0 ){
                client.sendMessage("@" + message.user + " incorrect format. Please use the format '!dice X' where X is your betting amount");
            } 
            else {
                client.sendMessage("@" + message.user + " you dont have enough points to bet that much");
            }
            
            break;
        case "!insult":
            var splitMessage = message.content.split(" ")
            var insultedUser = splitMessage[1]

            if( insultedUser != null ){
                client.sendMessage(insultedUser + " " + getInsult() );
            } else {
                var index = Math.floor(Math.random()  * viewers.length);
                var randomUser = viewers[index].name
                client.sendMessage("@" + randomUser + " " + getInsult() );
            }
            break;
        case "!slap":
            var user = message.user;

            if( userInViewers(user) ){
                var index = Math.floor(Math.random()  * viewers.length);
                var randomUser = viewers[index].name;
                var mess = '@' + user + ' just slapped @' + randomUser + ' ';
                
                
                if( randomUser == 'GooglyBear_'  ){
                    mess = mess.concat(" with a stanky wet fish!");
                } else{
                    if( randomUser == user ){
                        mess = mess.concat( " . HAHAHAHA Stoopid" )
                    }else{
                        var index = Math.floor(Math.random()  * messages.length);
                        mess = mess.concat( messages[index].message )
                    }
                }

                client.sendMessage(mess);
                updatePoints(user, -1);
            } else {
                client.sendMessage("Hey @" + user + " looks like you dont have any points. Type !points to start earning");
            }
            break;
        case '!commands':
            client.sendMessage(commandStr);
            break;
        case "!bellend":
            var index = Math.floor(Math.random()  * names.length);
            var swety = names[index].name;
            client.sendMessage("@" + swety + " <----- this is what a bellender looks like")
            break;
        case '!uptime':
            var currentTime = Math.round(new Date().getTime() / 1000);
            var difference = currentTime - startTime
            if( difference > 60 ){
                difference = Math.round(difference / 60);
                client.sendMessage('Bots been up for ' + ((difference)) + ' minutes' );

            }else{
                client.sendMessage('Bots been up for ' + ((difference)) + ' seconds' );
            }
            break;
        case "!leader":

            viewers.sort( function(a, b) {
                return b.points - a.points;
            })

            var leaderString = "";
            var counter = 0;
            for( var key in viewers ){
                leaderString = leaderString.concat( (parseInt(key) + 1) + ". @"  + viewers[key].name + " (" + viewers[key].points + ") " );
                counter++;
                if( counter >= 5 ){
                    break;
                }
            }

            client.sendMessage(leaderString);

            break;
        case '!points':
            var user = message.user;
            var addToList = true;
            var pts = 0;

            if( userInViewers(user) ){
                addToList = false;
                pts = getUserPoints(user);
            }

            if( addToList ){
                addToViewers(user, 1, 0);
                client.sendMessage('Hey @' + user + ' you just gained your first point!');
            } else {
                client.sendMessage('Hey @' + user + " you have " + pts + " point(s)" );
            }
            break;
        case '!pew':
            var user = message.user;
            var canShoot = false;
            var userPts = 0;

            if( userInViewers(user) ){
                canShoot = true;
                userPts = getUserPoints(user);
            }

            if( canShoot && userPts > 0 ){
                var index = Math.floor(Math.random()  * viewers.length);
                var randomUser = viewers[index].name;
                var randomPts = Math.floor(Math.random() * userPts );
                viewers[index].damage = randomPts;
                var mess = "shots fired. @" + user + " did " + randomPts + " damage to @" + randomUser
                if( randomUser == user ){
                    mess = mess.concat(" . HAHA you just shot yourself dummy!");
                }
                client.sendMessage(mess);
                viewers[index].damage = (viewers[index].damage + randomPts);
                updatePoints(user, -randomPts);
            } else {
                client.sendMessage("Hey @" + user + " looks like you dont have any points. Type !points to start earning");
            }
            break;
        case '!damage':
            viewers.sort( function(a, b) {
                return b.damage - a.damage;
            })

            var leaderString = "";
            var counter = 0;
            for( var key in viewers ){
                leaderString = leaderString.concat( (parseInt(key) + 1) + ". @"  + viewers[key].name + " (" + viewers[key].damage + ") " );
                counter++;
                if( counter >= 5 ){
                    break;
                }
            }

            client.sendMessage(leaderString);
            break;
        case '!chest':
            var user = message.user;
            var userPts = 0;

            if( userInViewers(user) ){
                userPts = getUserPoints(user);
            }

            var index = Math.floor(Math.random()  * chestChances.length);
            var earns = chestChances[index];
            if( earns > 0 ){
                client.sendMessage('Congrats. @' + user + ' You have won ' + earns + ' points!');
                updatePoints(user, earns);
            } else {
                client.sendMessage('Sorry. @' + user + ' You did not win the game');
                if( userPts >= 1 ){
                    updatePoints(user, -1);
                }
            }
            break;
        case "!8ball":
            var index = Math.floor(Math.random()  * ball.length);
            client.sendMessage( ball[index].message )
            break
        default:
            for( i in everyone ){
                if( first.trim() == everyone[i].name ){
                    client.sendMessage(everyone[i].message);
                    break
                }
            }
            break;
    }
}

function giftRecieved(data){
    var messageSent = false
    for( i in mana ){
        if( data.content.type == mana[i].type ){
            client.sendMessage(mana[i].message)
            messageSent = true
            cooldown = cooldownCount > 3 
            break
        }
    }

    if( !messageSent ){
        client.sendMessage("Yoooooo thanks for the suport! Much appreciated :hydrate ")
    }

    if( userInViewers(data.user) ){
        updatePoints(data.user, 25);
    } else {
        addToViewers(data.user, 25, 0);
    }
}

function updatePoints(user, pts){
    for( var key in viewers ){
        if( viewers[key].name == user ){
            viewers[key].points = (viewers[key].points + pts);
            break;
        }
    }
}

function checkIfSub(badges){
    for( var key in badges ){
        if( key.includes('sub') ){
            return true;
        }
    }
}

function checkIfMod(badges){
    for( var key in badges ){
        if( badges.includes('mod') || badges.includes('supermod') ){
            return true
        } 
    }
}

function userInViewers(user){
    var retVal = false;
    for( var key in viewers ){
        if( viewers[key].name == user ){
            return true;
        }
    }
    return retVal;
}

function getUserPoints(user){
    var pts = 0;
    for( var key in viewers ){
        if( viewers[key].name == user ){
            pts = viewers[key].points;
            break;
        }
    }
    return pts;
}

function addToViewers(user, pts, dmg){
    var temp = new Object();
    temp["name"] = user;
    temp["points"] = pts
    temp["damage"] = dmg
    viewers.push(temp);
}

function rollDice(){
    return Math.floor(Math.random()  * 6);
}

function getInsult() {
    var index = Math.floor(Math.random()  * insults.length);
    return insults[index].value
}

function getCommands(){
    var basic = "!slap !ballend !uptime !insult !dice !leader !points !pew !damage !chest"

    for( item in everyone ){
        basic = basic + " " + everyone[item].name
    }

    return basic
}