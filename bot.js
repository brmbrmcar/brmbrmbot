const Discord = require('discord.js');
const client = new Discord.Client();
let exec = require('child_process').exec;
var cli = new Discord.Client({autoReconnect:true});
var CryptoJS = require("crypto-js");
const Constants = require('discord.js/src/util/Constants.js');
const Snowflake = require('discord.js/src/util/Snowflake');
const Permissions = require('discord.js/src/util/Permissions');
const Endpoints = Constants.Endpoints;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setGame('^help')
  fetchallmessages()
  fetchallmembers()
});
client.on("guildMemberAdd", user => {
  client.fetchUser(user.id)
  client.channels.get("496014515725402112").send(user.toString() + "/" + user.id + "/" + user.user.tag + " has joined " + user.guild.id + "/" + user.guild.name + ".")
})
client.on("guildMemberRemove", user => {
  client.fetchUser(user.id)
  client.channels.get("496014515725402112").send(user.toString() + "/" + user.id + "/" + user.user.tag + " has left " + user.guild.id + "/" + user.guild.name + ".\nRoles:\n" + user.roles.map(roleid => roleid.id + " " + roleid.toString() + " " + roleid.name).join("\n"))
})
client.on("guildBanAdd", (guild, user) => {
  client.fetchUser(user).then(userr => {
  client.channels.get("496014515725402112").send(userr.toString() + "/" + userr.id + "/" + userr.tag + " was banned from " + guild.id + "/" + guild.name + ".")})
})
client.on("guildBanRemove", (guild, user) => {
  client.fetchUser(user.id)
  client.channels.get("496014515725402112").send(user.toString() + "/" + user.id + "/" + user.tag + " was unbanned from " + guild.id + "/" + guild.name + ".")
})
client.on("guildCreate", guild => {
  guild.fetchMembers()
  for (channel of guild.channels){
	if(client.channels.get(channel[1].id).type == "text"){
	client.channels.get(channel[1].id).fetchMessages().catch(err => {})
	}
  }
  client.channels.get("496014515725402112").send("The bot has joined the guild " + guild.id + "/" + guild.name + ".")
})
client.on("guildDelete", guild => {
  if (guild.me){
  client.channels.get("496014515725402112").send("The bot has left the guild " + guild.id + "/" + guild.name + ".\nRoles:\n" + guild.me.roles.map(roleid => roleid.id + " " + roleid.toString() + " " + roleid.name).join("\n"))
  }
  else {
  client.channels.get("496014515725402112").send("The bot has left the guild " + guild.id + "/" + guild.name + ".")
  }
})
const commandused1 = new Set();
const commandused2 = new Set();
var reversing = "false"

function fetchallmessages(){
   for (channel of client.channels){
     if(client.channels.get(channel[1].id).type == "text"){
	client.channels.get(channel[1].id).fetchMessages().catch(err => {})
     }
   }
}
function fetchallmembers(){
   for (guild of client.guilds){
     client.guilds.get(guild[1].id).fetchMembers()
   }
}

client.on("messageDelete", (messageDelete) => {
  const args = messageDelete.content.trim().split(/ +/g);
  if (messageDelete.content.includes("Message sent by") && messageDelete.author.id === client.user.id){
    for(i=args.length-1;i>=0;i--){
        let usersend1 = CryptoJS.AES.decrypt(args[i].slice(1, -2), encryptkey)
	let usersend2 = usersend1.toString(CryptoJS.enc.Utf8);
	let usersend = usersend2.slice(0, -20);
        //client.users.get("460075269563351040").send(usersend)
	if (client.users.get(args[i].replace(/\D/g,''))){
	   client.users.get(args[i].replace(/\D/g,'')).send("Your message in " + messageDelete.channel.toString() + " with the ID " + messageDelete.id + " has been deleted.")
	   client.users.get(args[i].replace(/\D/g,'')).send(messageDelete.content)
	   return;
	}
	else if(client.users.get(usersend.replace(/\D/g,''))) {
	   client.users.get(usersend.replace(/\D/g,'')).send("Your message in " + messageDelete.channel.toString() + " with the ID " + messageDelete.id + " has been deleted.")
	   client.users.get(usersend.replace(/\D/g,'')).send(messageDelete.content)
	   return;
	}
	   
    }}
});
client.on('message', msg => {
  const prefix = "^"

  const args = msg.content.trim().split(/ +/g);
  const command = args.shift();
  if (command === '^help') {
    msg.author.send('I need proper hosting, so do not expect perfect uptime. You should contact <@460075269563351040> and/or join https://discord.gg/4ag7tTs. Source code is available at `https://github.com/brmbrmcar/brmbrmbot/blob/master/bot.js`.');
    msg.author.send('Commands \n`^help` Shows this dialogue (sends to direct messages) \n`^invite` Shows an invite for this bot \n`^convert [input] [amount]` Converts between decimal and imperial time units, use just `^convert help` for more information \n`^time` Shows decimal time in format `hours`:`minutes`:`seconds` \n`^roleping [rolename]` Shows the code needed to mention a role \n`^rolepingext [rolename] [guildID]` Shows the code needed to mention a role in another guild \n`^rolelist {guildID}` Shows a list of all roles, with ping codes (optional guild ID for other guilds, sends to direct messages) \n`^everyone {guildID}` Shows how to mention everyone individually (optional guild ID for other guilds, sends to direct messages) \n`^everyonehide {guildID}` Shows how to mention everyone individually like with `^everyone` but will show the pings by ID (sends to direct messages) \n`^message [userID/mention/tag] [message]` Allows the messaging of another user through a user ID (user must share a guild with the bot) (`\\{` and `\\}` get replaced by `<` and `>`) \n`^messageanon [userID/mention/tag] [message]` Allows the messaging of another user through a user ID anonymously \n`^say [channelID/mention] [message]` Allows the messaging of another channel through a channel ID (bot must be able to write messages to it) \n`^sayanon [channelID/mention] [message]` Allows the messaging of another channel through a channel ID anonymously \n`^messagein [messageID]` Shows the input of a message \n`^listguilds` Lists all the guilds the bot is a member of (sends to direct messages) \n`^listchannels {guild ID}` Lists all the channels in a guild (optional guild ID for other guilds, sends to direct messages) \n`^inviteguild [guild ID]` **Attempts** to create an invite for a guild (the bot must be a member of the guild, `^invitechannel` may work better in some poorly set-up guilds)');
    msg.author.send("`^invitechannel [channelID/mention]` **Attempts** to create an invite for a channel (the bot must be a member of the guild the channel is in) \n`^seen [userID/mention]` Shows what guilds, if any, the user shares with the bot \n`^spy [channelID/mention]` Shows some recent messages in a channel (the bot must be able to read messages in the channel, sends to direct messages) \n`^listemotes {guildID}` Lists all the emotes (emojis) in a guild (optional guild ID for other guilds) \n`^userinfo [userID/mention/tag]` Gets information of a user (currently specifying tag is only supported for cached users) \n`^roleinfo [roleID/mention]` Gets information of a role \n`^channelinfo {channelID}` Gets information of a channel (optional channel ID for other channels, the bot must be in the guild the channel is in) \n`^guildinfo {guildID}` Gets information of a guild (optional guild ID for other guilds, the bot must be in the guild) \n`^guilduserinfo {guildID}` Gets information of every user in a guild (will send a lot of direct messages, sends to direct messages) \n`^listpermissions [userID/mention] {guildID}` Lists the permissions of a user in a guild (optional guild ID for other guilds) \n`^messagereply [key] [message]` Replies to a message sent anonymously through the key provided with the message (suggested command) \n`^messagereplyanon [key] [message]` Replies to a message sent anonymously through the key provided with the message anonymoulsy (suggested command but replace `^messsagereply` with `^messagereplyanon`) \n`^reverse [framerate] {mute}` Reverses an attatched video or image at a given framerate (in frames per imperial second) (if there is no audio, mute MUST be said after the frame rate or the command will fail, command may fail easily)")
    msg.author.send("`^finduser [searchterm]` Searches cached user IDs, tags and nicknames for a given search term (case insensitive, sends to direct messages) \n`^findguild [searchterm]` Searches guild IDs and names for a given search term (case insensitive) \n`^findchannel [searchterm]` Searches channel IDs and names for a given search term (case insensitive) \n`^findrole [searchterm]` Searches role IDs and names for a given search term (case insensitive) \n`^findemote [searchterm]` Searches emote IDs and names for a given search term (case insensitive) \n`^type [ID]` Sees whether an ID is for a guild, a channel, a message, a role, an emote or a user (the bot must be able to fetch or see the ID for the command to work) \n`^listbans {guildID}` Lists all the banned users and reasons for the bans in a guild (the bot must be able to ban members in the guild, optional guild ID for other guilds) \n`^copybans [inguildID] {outguildID}` Copies banned users and reasons from one guild to another (the bot must be able to ban members in both guilds, user must have ban, admin or owner permissions in output guild, optional guild ID for other output guilds) \n`^crownstop {guildID}` Shows all roles that are preventing the owner's crown icon from showing (optional guild ID for other guilds) \n`^ping` Pings the bot \n`@someone` Mentions a guild member at random, similar to the command that existed on Discord at some point in time long ago \n`^ban {guildID} [userID/mention/tag] {reason}` Bans a user from a guild with an optional reason (the bot must be able to ban members in the guild, user must have ban, admin or owner permissions in the guild, currently specifying tag is only supported for cached users, optional guild ID for other guilds)\n`^baseconvert [number] [inputbase] [outputbase]` Converts the base of a number to another specified base 10 base between 2 and 36.\n");
    msg.author.send("NOTE: Especially when involving larger guilds, information provided by some of these comamnds may not be entirely accurate due to reliance of cached data, as opposed to making more accurate calls to Discord. This is to make performance significantly better and not abuse the application programming interface.")
    msg.reply("Check your direct messages!")
  }
  if (command === '^help.force') { 
    msg.reply('I need proper hosting, so do not expect perfect uptime. You should contact <@460075269563351040> and/or join https://discord.gg/4ag7tTs. Source code is available at `https://github.com/brmbrmcar/brmbrmbot/blob/master/bot.js`.')
    msg.reply('Commands \n`^help` Shows this dialogue (sends to direct messages) \n`^invite` Shows an invite for this bot \n`^convert [input] [amount]` Converts between decimal and imperial time units, use just `^convert help` for more information \n`^time` Shows decimal time in format `hours`:`minutes`:`seconds` \n`^roleping [rolename]` Shows the code needed to mention a role \n`^rolepingext [rolename] [guildID]` Shows the code needed to mention a role in another guild \n`^rolelist {guildID}` Shows a list of all roles, with ping codes (optional guild ID for other guilds, sends to direct messages) \n`^everyone {guildID}` Shows how to mention everyone individually (optional guild ID for other guilds, sends to direct messages) \n`^everyonehide {guildID}` Shows how to mention everyone individually like with `^everyone` but will show the pings by ID (sends to direct messages) \n`^message [userID/mention/tag] [message]` Allows the messaging of another user through a user ID (user must share a guild with the bot) (`\\{` and `\\}` get replaced by `<` and `>`) \n`^messageanon [userID/mention/tag] [message]` Allows the messaging of another user through a user ID anonymously \n`^say [channelID/mention] [message]` Allows the messaging of another channel through a channel ID (bot must be able to write messages to it) \n`^sayanon [channelID/mention] [message]` Allows the messaging of another channel through a channel ID anonymously \n`^messagein [messageID]` Shows the input of a message \n`^listguilds` Lists all the guilds the bot is a member of (sends to direct messages) \n`^listchannels {guild ID}` Lists all the channels in a guild (optional guild ID for other guilds, sends to direct messages) \n`^inviteguild [guild ID]` **Attempts** to create an invite for a guild (the bot must be a member of the guild, `^invitechannel` may work better in some poorly set-up guilds)');
    msg.reply("`^invitechannel [channelID/mention]` **Attempts** to create an invite for a channel (the bot must be a member of the guild the channel is in) \n`^seen [userID/mention]` Shows what guilds, if any, the user shares with the bot \n`^spy [channelID/mention]` Shows some recent messages in a channel (the bot must be able to read messages in the channel, sends to direct messages) \n`^listemotes {guildID}` Lists all the emotes (emojis) in a guild (optional guild ID for other guilds) \n`^userinfo [userID/mention/tag]` Gets information of a user (currently specifying tag is only supported for cached users) \n`^roleinfo [roleID/mention]` Gets information of a role \n`^channelinfo {channelID}` Gets information of a channel (optional channel ID for other channels, the bot must be in the guild the channel is in) \n`^guildinfo {guildID}` Gets information of a guild (optional guild ID for other guilds, the bot must be in the guild) \n`^guilduserinfo {guildID}` Gets information of every user in a guild (will send a lot of direct messages, sends to direct messages) \n`^listpermissions [userID/mention] {guildID}` Lists the permissions of a user in a guild (optional guild ID for other guilds) \n`^messagereply [key] [message]` Replies to a message sent anonymously through the key provided with the message (suggested command) \n`^messagereplyanon [key] [message]` Replies to a message sent anonymously through the key provided with the message anonymoulsy (suggested command but replace `^messsagereply` with `^messagereplyanon`) \n`^reverse [framerate] {mute}` Reverses an attatched video or image at a given framerate (in frames per imperial second) (if there is no audio, mute MUST be said after the frame rate or the command will fail, command may fail easily)")
    msg.reply("`^finduser [searchterm]` Searches cached user IDs, tags and nicknames for a given search term (case insensitive, sends to direct messages) \n`^findguild [searchterm]` Searches guild IDs and names for a given search term (case insensitive) \n`^findchannel [searchterm]` Searches channel IDs and names for a given search term (case insensitive) \n`^findrole [searchterm]` Searches role IDs and names for a given search term (case insensitive) \n`^findemote [searchterm]` Searches emote IDs and names for a given search term (case insensitive) \n`^type [ID]` Sees whether an ID is for a guild, a channel, a message, a role, an emote or a user (the bot must be able to fetch or see the ID for the command to work) \n`^listbans {guildID}` Lists all the banned users and reasons for the bans in a guild (the bot must be able to ban members in the guild, optional guild ID for other guilds) \n`^copybans [inguildID] {outguildID}` Copies banned users and reasons from one guild to another (the bot must be able to ban members in both guilds, user must have ban, admin or owner permissions in output guild, optional guild ID for other output guilds) \n`^crownstop {guildID}` Shows all roles that are preventing the owner's crown icon from showing (optional guild ID for other guilds) \n`^ping` Pings the bot \n`@someone` Mentions a guild member at random, similar to the command that existed on Discord at some point in time long ago \n`^ban {guildID} [userID/mention/tag] {reason}` Bans a user from a guild with an optional reason (the bot must be able to ban members in the guild, user must have ban, admin or owner permissions in the guild, currently specifying tag is only supported for cached users, optional guild ID for other guilds)\n`^baseconvert [number] [inputbase] [outputbase]` Converts the base of a number to another specified base 10 base between 2 and 36.\n");
    msg.reply('NOTE: Especially when involving larger guilds, information provided by some of these comamnds may not be entirely accurate due to reliance of cached data, as opposed to making more accurate calls to Discord. This is to make performance significantly better and not abuse the application programming interface.');
  }
  if (command === '^invite') {
    msg.reply('Invite me to your guild! `https://discordapp.com/oauth2/authorize?client_id=491618805055750144&scope=bot`');
  }
  if (command === '^convert') {
    let type = args[0]
    let amount = args[1]
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    if (type === "decs"){
	out = parseFloat(amount)*0.864
	msg.reply(out);
    }
    if (type === "imps"){
	out = parseFloat(amount)/0.864
	msg.reply(out);
    }
    if (type === "decm"){
	out = parseFloat(amount)*1.44
	msg.reply(out);
    }
    if (type === "impm"){
	out = parseFloat(amount)/1.44
	msg.reply(out);
    }
    if (type === "dech"){
	out = parseFloat(amount)*2.4
	msg.reply(out);
    }
    if (type === "imph"){
	out = parseFloat(amount)/2.4
	msg.reply(out);
    }
    if (type === "unix"){
    let days = (amount - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    out = year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3)
    msg.reply(out);
    }
    if (type === "unixs"){
    let days = (amount - 1489276800) / 86400
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    out = year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3)
    msg.reply(out);
    }
    if (type === "utc"){
    var intime = new Date(msg.content.replace("^convert utc ","") + " GMT")
    let days = (intime.getTime() - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    out = year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3)
    msg.reply(out);
    }
    if (type === "decu"){
        if (!args[1]) return;
        const parts = msg.content.trim().split("/");
        let startpoint = 1489276800000
        let negative = "false"
        if (!parts[1]){
            startpoint = Math.floor(Date.now() / 86400000) * 86400000;
        }
        else {
	    if (parts[0].includes("-")){
		negative = "true"
	    }
        }
        if (msg.content.replace("^convert decu","")=="") return;
        if(negative=="true"){
            
	    out = msg.content.replace(parts[0]).replace(/\D/g,'') * 0.864 + startpoint - (parts[0].replace(/\D/g,'')*10000000000*0.864)
        }
	else{
            out = msg.content.replace("^convert decu","").replace(/\D/g,'') * 0.864 + startpoint
        }
	msg.reply(out);
    }
    if (type === "decsu"){
        if (!args[1]) return;
        const parts = msg.content.trim().split("/");
        let startpoint = 1489276800000
        let negative = "false"
        if (!parts[1]){
            startpoint = Math.floor(Date.now() / 86400000) * 86400000;
        }
        else {
	    if (parts[0].includes("-")){
		negative = "true"
	    }
        }
        if (msg.content.replace("^convert decsu","")=="") return;
        if(negative=="true"){
            
	    out = msg.content.replace(parts[0]).replace(/\D/g,'') * 864 + startpoint - (parts[0].replace(/\D/g,'')*10000000000*0.864)
        }
	else{
            out = msg.content.replace("^convert decsu","").replace(/\D/g,'') * 864 + startpoint
        }
	msg.reply(out);
    }
    if (type === "decutc"){
        if (!args[1]) return;
        const parts = msg.content.trim().split("/");
        let startpoint = 1489276800000
        let negative = "false"
        if (!parts[1]){
            startpoint = Math.floor(Date.now() / 86400000) * 86400000;
        }
        else {
	    if (parts[0].includes("-")){
		negative = "true"
	    }
        }
        if (msg.content.replace("^convert decutc","")=="") return;
        if(negative=="true"){
            
	    out = msg.content.replace(parts[0]).replace(/\D/g,'') * 0.864 + startpoint - (parts[0].replace(/\D/g,'')*10000000000*0.864)
        }
	else{
            out = msg.content.replace("^convert decutc","").replace(/\D/g,'') * 0.864 + startpoint
        }
	msg.reply(new Date(out).toGMTString());
    }
    if (type === "decsutc"){
        if (!args[1]) return;
        const parts = msg.content.trim().split("/");
        let startpoint = 1489276800000
        let negative = "false"
        if (!parts[1]){
            startpoint = Math.floor(Date.now() / 86400000) * 86400000;
        }
        else {
	    if (parts[0].includes("-")){
		negative = "true"
	    }
        }
        if (msg.content.replace("^convert decsu","")=="") return;
        if(negative=="true"){
            
	    out = msg.content.replace(parts[0]).replace(/\D/g,'') * 864 + startpoint - (parts[0].replace(/\D/g,'')*10000000000*0.864)
        }
	else{
            out = msg.content.replace("^convert decsutc","").replace(/\D/g,'') * 864 + startpoint
        }
	msg.reply(new Date(out).toGMTString());
    }
    if (type === "id"){
    if (!args[1]) return
    let days = (Snowflake.deconstruct(amount).timestamp - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    out = year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3)
    msg.reply(out);
    }
    if (type === "decid"){
        if (!args[1]) return;
        const parts = msg.content.trim().split("/");
        let startpoint = 1489276800000
        let negative = "false"
        if (!parts[1]){
            startpoint = Math.floor(Date.now() / 86400000) * 86400000;
        }
        else {
	    if (parts[0].includes("-")){
		negative = "true"
	    }
        }
        if (msg.content.replace("^convert decid","")=="") return;
        if(negative=="true"){
            
	    out = msg.content.replace(parts[0]).replace(/\D/g,'') * 0.864 + startpoint - (parts[0].replace(/\D/g,'')*10000000000*0.864)
        }
	else{
            out = msg.content.replace("^convert decid","").replace(/\D/g,'') * 0.864 + startpoint
        }
	msg.reply(Snowflake.generate(Math.floor(out)));
    }
    if (type === "decsid"){
        if (!args[1]) return;
        const parts = msg.content.trim().split("/");
        let startpoint = 1489276800000
        let negative = "false"
        if (!parts[1]){
            startpoint = Math.floor(Date.now() / 86400000) * 86400000;
        }
        else {
	    if (parts[0].includes("-")){
		negative = "true"
	    }
        }
        if (msg.content.replace("^convert decsid","")=="") return;
        if(negative=="true"){
            
	    out = msg.content.replace(parts[0]).replace(/\D/g,'') * 864 + startpoint - (parts[0].replace(/\D/g,'')*10000000000*0.864)
        }
	else{
            out = msg.content.replace("^convert decsid","").replace(/\D/g,'') * 864 + startpoint
        }
	msg.reply(Snowflake.generate(Math.floor(out)));
    }
    if (type === "help"){
	msg.reply("`^convert [input] [amount]` Converts between decimal and imperial time units.\nInputs \n`decs` Converts decimal seconds into imperial seconds \n`imps` Converts imperial seconds into decimal seconds \n`decm` Converts decimal minutes into imperial minutes \n`impm` Converts imperial minutes into decimal minutes \n`dech` Converts decimal hours into imperial seconds \n`imph` Converts imperial hours into decimal hours \n`unix` Converts unix time milliseconds into decimal time \n`unixs` Converts unix time seconds into decimal time \n`utc` Converts Universal Coordinated Time into decimal time \n`decu` Converts decimal time with milliseconds into unix time (please provide full padding; `^convert decu 0/0/0 0:01:01:001` not `^convert decu 0/0/0 0:1:1:1`) \n`decsu` Converts decimal time without milliseconds into unix time \n`decutc` Converts decimal time with milliseconds into Universal Coordinated Time (may show as GMT in response) \n`decsutc` Converts decimal time without milliseconds into Universal Coordinated Time \n`id` Finds the decimal time of a Discord ID \n`decid` Converts decimal time with milliseconds into a Discord ID \n`decsid` Converts decimal time without milliseconds into a Discord ID");
    }
  }
  if (command === '^time') {
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    let days = (new Date().getTime() - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    msg.reply(year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3));
}
  if (command === '^time.update') {
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    let days = (new Date().getTime() - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    msg.channel.send(year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3)).then((message)=>{
    setInterval(() => {
    let days = (new Date().getTime() - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    message.edit(year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3))
    }, 5000)
})
  }
  if (command === '^roleping') {
    if (!msg.guild) return;
    let rolename = msg.content.replace("^roleping ", "");
    let role = msg.guild.roles.find(r => r.name === rolename);
    if (!role) return;
    let roleid = role.id
    msg.reply('`<@&' + roleid + '>`');
  }
  if (command === '^rolepingext') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)) return;
    let rolename = msg.content.replace("^rolepingext ", "").replace(guilde + " ", "");
    let role = client.guilds.get(guilde).roles.find(r => r.name === rolename);
    if (!role) return;
    let roleid = role.id
    msg.reply('`<@&' + roleid + '>`');
  }
  if (command === '^rolelist') {
    let guilde = args[0]
    roles = ''
    if (!client.guilds.get(guilde)){
        if (!msg.guild) return;
	for (role of msg.guild.roles){
        roles = roles + "`<@&" + role[1].id + "> `" + role[1].name + "\n"
	}
    }
    else{
	for (role of client.guilds.get(guilde).roles){
            roles = roles + "`<@&" + role[1].id + "> `" + role[1].name + "\n"
    }}
    msg.author.send(roles, { split: true });
    msg.reply("Check your direct messages!");
}
  if (command === '^rolelist.force') {
    let guilde = args[0]
    roles = ''
    if (!client.guilds.get(guilde)){
        if (!msg.guild) return;
	for (role of msg.guild.roles){
        roles = roles + "`<@&" + role[1].id + "> `" + role[1].name + "\n"
	}
    }
    else{
	for (role of client.guilds.get(guilde).roles){
            roles = roles + "`<@&" + role[1].id + "> `" + role[1].name + "\n"
    }}
    msg.reply(roles, { split: true });
}
  
  if (command === '^everyone') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (!msg.guild) return;
      memberlist = ""
      for (user of msg.guild.members){
        memberlist = memberlist + "`<@" + user[1].id + ">`\n "
      }
    }
    else {
      memberlist = ""
      for (user of client.guilds.get(guilde).members){
        memberlist = memberlist + "`<@" + user[1].id + ">`\n "
      }}
    msg.author.send(memberlist, { split: true });
    msg.reply("Check your direct messages!")
  }
  if (command === '^everyonehide') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (!msg.guild) return;
      memberlist = ""
      for (user of msg.guild.members){
        memberlist = memberlist + "`\\<@" + user[1].id + ">`\n "
      }
    }
    else {
      memberlist = ""
      for (user of client.guilds.get(guilde).members){
        memberlist = memberlist + "`\\<@" + user[1].id + ">`\n "
      }}
    msg.author.send(memberlist, { split: true });
    msg.reply("Check your direct messages!")
  }
  if (command === '^everyone.force') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (!msg.guild) return;
      memberlist = ""
      for (user of msg.guild.members){
        memberlist = memberlist + "`<@" + user[1].id + ">`\n "
      }
    }
    else {
      memberlist = ""
      for (user of client.guilds.get(guilde).members){
        memberlist = memberlist + "`<@" + user[1].id + ">`\n "
      }}
    msg.reply(memberlist, { split: true });
  }
  if (command === '^everyonehide.force') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (!msg.guild) return;
      memberlist = ""
      for (user of msg.guild.members){
        memberlist = memberlist + "`\\<@" + user[1].id + ">`\n "
      }
    }
    else {
      memberlist = ""
      for (user of client.guilds.get(guilde).members){
        memberlist = memberlist + "`\\<@" + user[1].id + ">`\n "
      }}
    msg.reply(memberlist, { split: true });
  }
    
  if (command === '^message') {
    if (!args[0]) return;
    let usersend = args[0]
    let toreplace = usersend
    tag = ""
    const parts = msg.content.trim().split(/#+/g); //YOU HAVE NO F***ING IDEA HOW HARD IT WAS TO IMPLEMENT TAGS
    if (parts[1]){
    firstpart = parts[0].replace('^message ','')
    secondpart = parts[1].slice(0,4)
    tag = firstpart + "#" + secondpart
    if(client.users.find(user => user.tag === tag)){
	 usersend = client.users.find(user => user.tag === tag).id
	 toreplace = tag
    }
    }
    if (!client.users.get(usersend.replace(/\D/g,''))) return;
    let content = msg.content.replace("^message ", "").replace(toreplace, "").replace(new RegExp("\\\\{", "g"), "<").replace(new RegExp("\\\\}", "g"), ">")
    let Attachment = (msg.attachments).array();
    let links = ""
    Attachment.forEach(function(attachment) {
    links = attachment.url
    })
    if (msg.author.bot){
    client.users.get(usersend.replace(/\D/g,'')).send(content + `\nMessage sent by someone messing around a little too much. ` , {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err);   msg.reply(err.toString());})
    }
    else {
    client.users.get(usersend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}>. ` , {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err);  msg.reply(err.toString());}) 
    }
  }
  if (command === '^messageanon') {
    if (!args[0]) return;
    let usersend = args[0]
    let toreplace = usersend
    tag = ""
    const parts = msg.content.trim().split(/#+/g);
    if (parts[1]){
    firstpart = parts[0].replace('^messageanon ','')
    secondpart = parts[1].slice(0,4)
    tag = firstpart + "#" + secondpart
    if(client.users.find(user => user.tag === tag)){
	 usersend = client.users.find(user => user.tag === tag).id
	 toreplace = tag
    }
    }
    if(client.users.find(user => user.tag === msg.content.replace('^messageanon ',''))){
	 usersend = client.users.find(user => user.tag === msg.content.replace('^messageanon ','')).id
    }
    if (!client.users.get(usersend.replace(/\D/g,''))) return;
    let content = msg.content.replace("^messageanon ", "").replace(toreplace, "").replace(new RegExp("\\\\{", "g"), "<").replace(new RegExp("\\\\}", "g"), ">")
    let Attachment = (msg.attachments).array();
    let links = ""
    Attachment.forEach(function(attachment) {
    links = attachment.url
    })
    var text = msg.author.id;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length)); 
    }
    var encrypted = CryptoJS.AES.encrypt(text, encryptkey);
    client.users.get(usersend.replace(/\D/g,'')).send(content + "\nMessage sent by an anonymous user. To reply please run `^messagereply " + encrypted + " [message]`.", {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); idk = err.toString();})
  }
  if (command === '^messagereply') {
    if (!args[0]) return;
    let usersend1 = CryptoJS.AES.decrypt(args[0], encryptkey)
    let usersend2 = usersend1.toString(CryptoJS.enc.Utf8);
    let usersend = usersend2.slice(0, -20);
    if (!client.users.get(usersend.replace(/\D/g,''))) return;
    let content = msg.content.replace("^messagereply ", "").replace(args[0], "").replace(new RegExp("\\\\{", "g"), "<").replace(new RegExp("\\\\}", "g"), ">")
    let Attachment = (msg.attachments).array();
    let links = ""
    Attachment.forEach(function(attachment) {
    links = attachment.url
    })
    if (msg.author.bot){
    client.users.get(usersend.replace(/\D/g,'')).send(content + `\nMessage sent by someone messing around a little too much.`, {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err);   msg.reply(err.toString());})
    }
    else {
    client.users.get(usersend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}>.`, {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err);  msg.reply(err.toString());}) 
    }
  }
  if (command === '^messagereplyanon') {
    if (!args[0]) return;
    let usersend1 = CryptoJS.AES.decrypt(args[0], encryptkey)
    let usersend2 = usersend1.toString(CryptoJS.enc.Utf8);
    let usersend = usersend2.slice(0, -20);
    if (!client.users.get(usersend.replace(/\D/g,''))) return;
    let content = msg.content.replace("^messagereplyanon ", "").replace(args[0], "").replace(new RegExp("\\\\{", "g"), "<").replace(new RegExp("\\\\}", "g"), ">")
    let Attachment = (msg.attachments).array();
    let links = ""
    Attachment.forEach(function(attachment) {
    links = attachment.url
    })
    var text = msg.author.id;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length)); 
    }
    var encrypted = CryptoJS.AES.encrypt(text, encryptkey);
    client.users.get(usersend.replace(/\D/g,'')).send(content + "\nMessage sent by an anonymous user. To reply please run `^messagereply " + encrypted + " [message]`.", {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); idk = err.toString();})
  }
  if (command === '^say') {
    if (!args[0]) return;
    let channelsend = args[0]
    let channelsendrep = channelsend.replace(/\D/g,'')
    if (!client.channels.get(channelsendrep)) return;
    if (client.channels.get(channelsendrep).type != "text") return;
    let content = msg.content.replace("^say ", "").replace(channelsend, "").replace(new RegExp("\\\\{", "g"), "<").replace(new RegExp("\\\\}", "g"), ">")
    let Attachment = (msg.attachments).array();
    let links = ""
    Attachment.forEach(function(attachment) {
    links = attachment.url
    })
    if (!msg.guild) {
        if(msg.author.bot){
	client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by someone messing around a little too much.`, {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err); 
    msg.reply(err.toString());})}
        else {
	client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}>.`, {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err); 
    msg.reply(err.toString());})
        }
    } else {
        if(msg.author.bot){
	client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by someone messing around a little too much.`, {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err); 
    msg.reply(err.toString());}) 
       }
       else {
	client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}> from ${msg.guild.name} (${msg.guild.id}).`, {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err); 
    msg.reply(err.toString());})
       }

}
  }
  if (command === '^sayanon') {
    if (!args[0]) return;
    let channelsend = args[0]
    let channelsendrep = channelsend.replace(/\D/g,'')
    if (!client.channels.get(channelsendrep)) return;
    if (client.channels.get(channelsendrep).type != "text") return;
    let content = msg.content.replace("^sayanon ", "").replace(channelsend, "").replace(new RegExp("\\\\{", "g"), "<").replace(new RegExp("\\\\}", "g"), ">")
    let Attachment = (msg.attachments).array();
    let links = ""
    Attachment.forEach(function(attachment) {
    links = attachment.url
    })
    var text = msg.author.id;
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length)); 
    }
    var encrypted = CryptoJS.AES.encrypt(text, encryptkey);
    client.channels.get(channelsend.replace(/\D/g,'')).send(content + "\nMessage sent by an anonymous user. (Sender key `" + encrypted + "`)", {file: links}).then(idk => {msg.reply("Message sent successfully!")}).catch(err =>{ console.error(err); 
    msg.reply(err.toString());})
  }
  if (command === '^messagein') {
    let msgid = args[0]
    for (channel of client.channels){
        if (client.channels.get(channel[1].id).type !== "voice") {
        if (client.channels.get(channel[1].id).type !== "category"){
	client.channels.get(channel[1].id).fetchMessage(msgid).then(message => { msg.reply('```' + message.content + '```') })}}
    }
  }
  if (command === '^listguilds') {
      guildlist = "\n"
      for (guild of client.guilds){
        guildlist = guildlist + "`" + guild[1].id + "` " + guild[1].name + "\n"
      }
    msg.reply("Check your direct messages!");
    msg.author.send(guildlist, { split: true });    
  }
  if (command === '^listguilds.force') {
      guildlist = "\n"
      for (guild of client.guilds){
        guildlist = guildlist + "`" + guild[1].id + "` " + guild[1].name + "\n"
      }
    msg.reply(guildlist, { split: true }); 
  }
  if (command === '^listchannels') {
    channellist = "\n"
    guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (!msg.guild) return;
      for (channel of msg.guild.channels){
        channellist = channellist + "`" + channel[1].id + "` " + "<#" + channel[1].id + "> " + channel[1].name + "\n"
      }}
    else {
      for (channel of client.guilds.get(guilde).channels){
        channellist = channellist + "`" + channel[1].id + "` " + "<#" + channel[1].id + "> " + channel[1].name + "\n"
      }}
    
    msg.author.send(channellist, { split: true }); 
    msg.reply("Check your direct messages!");   
  }
  if (command === '^listchannels.force') {
    channellist = "\n"
    guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (!msg.guild) return;
      for (channel of msg.guild.channels){
        channellist = channellist + "`" + channel[1].id + "` " + "<#" + channel[1].id + "> " + channel[1].name + "\n"
      }}
    else {
      for (channel of client.guilds.get(guilde).channels){
        channellist = channellist + "`" + channel[1].id + "` " + "<#" + channel[1].id + "> " + channel[1].name + "\n"
      }}
    
    msg.reply(channellist, { split: true });   
  }
  if (command === '^inviteguild') {
    let guildid = args[0]
    if (!client.guilds.get(guildid)) return;
    if (!client.guilds.get(guildid).channels.find(c => c.type !== "category")) return;
    let invchannel = client.guilds.get(guildid).channels.find(c => c.type !== "category").id;
    //channelid = channel[1].id;
    client.channels.get(invchannel).createInvite({maxAge:0}).then(invite =>
    msg.channel.send(invite.url)
);
  }
  if (command === '^invitechannel') {
    if (!args[0]) return;
    let channelid = args[0].replace(/\D/g,'')
    if (!client.channels.get(channelid)) return;
    if (client.channels.get(channelid) == "dm") return;
    client.channels.get(channelid).createInvite({maxAge:0}).then(invite =>
    msg.channel.send(invite.url)
);
  }
  if (command === '^seen') {
      if (!args[0]) return;
      let userseenid = args[0].replace(/\D/g,'')
    if(client.users.find(user => user.tag === msg.content.replace('^seen ',''))){
	 userseenid = client.users.find(user => user.tag === msg.content.replace('^seen ','')).id
    }
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
      let seenlist = ""
      for (guild of client.guilds){
	if (client.guilds.get(guild[1].id).members.get(userseenid))
	   {
	    let days2 = (guild[1].members.get(userseenid).joinedTimestamp.toString() - 1489276800000) / 86400000
	    let year2 = Math.floor(days2/100)
	    let month2 = Math.floor((days2/10)-(year2*10))
	    let day2 = Math.floor(days2-((year2*100)+(month2*10)))
	    let hour2 = Math.floor((days2*10)-((year2*1000)+(month2*100)+(day2*10)))
	    let minute2 = Math.floor((days2*1000)-((year2*100000)+(month2*10000)+(day2*1000)+(hour2*100)))
	    let second2 = Math.floor((days2*100000)-((year2*10000000)+(month2*1000000)+(day2*100000)+(hour2*10000)+(minute2*100)))
	    let millisecond2 = Math.floor((days2*100000000)-((year2*10000000000)+(month2*1000000000)+(day2*100000000)+(hour2*10000000)+(minute2*100000)+(second2*1000)))
	    joined = " " + year2 + "/" + month2 + "/" + day2 + " " + hour2 + ":" + pad(minute2,2) + ":" + pad(second2,2) + ":" + pad(millisecond2,3)
	    seenlist = seenlist + '\n`' + guild[1].id + '` ' + guild[1].name + joined
	   }
      }
      msg.reply(seenlist, { split: true })
  }
  if (command === '^endianswap') { // secret command because I simply don't want to have to deal with it
    swapped = ""
    for (arg of args){
	swapped = arg[0] + arg[1] + ' ' + swapped }
    msg.reply(swapped);
  }
  if (command === '^spy') {
    if (!args[0]) return;
    channelid = args[0].replace(/\D/g,'')
    if (!client.channels.get(channelid)) return;
    if (client.channels.get(channelid).type == "voice") return;
    if (client.channels.get(channelid).type == "category") return;
    if (client.channels.get(channelid).type == "dm") return;
    client.channels.get(channelid).fetchMessages().then(messages => {
    msg.author.send(messages.map(message => message.content).join("\n"), {split:true} )})
    msg.reply("Check your direct messages!")

}
  if (command === '^spy.force') { 
    if (!args[0]) return;
    channelid = args[0].replace(/\D/g,'')
    if (!client.channels.get(channelid)) return;
    if (client.channels.get(channelid).type == "voice") return;
    if (client.channels.get(channelid).type == "category") return;
    if (client.channels.get(channelid).type == "dm") return;
    client.channels.get(channelid).fetchMessages().then(messages => {
    msg.reply(messages.map(message => message.content).join("\n"), {split:true} )})

}
  if (command === '^listemotes') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (!msg.guild) return;
      emotelist = ""
      for (emote of msg.guild.emojis){
        emotelist = emotelist + emote[1].toString() + " `" + emote[1].id + "` " + emote[1].name + "\n "
      }
    }
    else {
      emotelist = ""
      for (emote of client.guilds.get(guilde).emojis){
        emotelist = emotelist + emote[1].toString() + " `" + emote[1].id + "` " + emote[1].name + "\n "
      }}
    msg.reply(emotelist, { split: true });
  }
  if (command === '^userinfo') { 
    if (!args[0]) return;
    userid = args[0].replace(/\D/g,'')
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    if(client.users.find(user => user.tag === msg.content.replace('^userinfo ','').replace('@',''))){
	 userid = client.users.find(user => user.tag === msg.content.replace('^userinfo ','').replace('@',''))
    }
    client.fetchUser(userid, false).then(user => {
    let guildshare = "shares no guilds with this bot"
    let bot = "Is not a bot account"
    let names = "`" + user.username.toString() + "` "
    let days = (user.createdTimestamp.toString() - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    let joined = "is not in this guild"
    let status = "is "
    if (user.presence.status=="online"){
	status = status + "online"
    }
    if (user.presence.status=="idle"){
	status = status + "online but shown as idle"
    }
    if (user.presence.status=="dnd"){
	status = status + "online but you probably shouldn't disturb them"
    }
    if (user.presence.status=="offline"){
	status = status + "offline or invisible or status unknown"
    }
    if (msg.guild && msg.guild.members.get(user.id)){
	let days2 = (msg.guild.members.get(user.id).joinedTimestamp.toString() - 1489276800000) / 86400000
	let year2 = Math.floor(days2/100)
	let month2 = Math.floor((days2/10)-(year2*10))
	let day2 = Math.floor(days2-((year2*100)+(month2*10)))
	let hour2 = Math.floor((days2*10)-((year2*1000)+(month2*100)+(day2*10)))
	let minute2 = Math.floor((days2*1000)-((year2*100000)+(month2*10000)+(day2*1000)+(hour2*100)))
	let second2 = Math.floor((days2*100000)-((year2*10000000)+(month2*1000000)+(day2*100000)+(hour2*10000)+(minute2*100)))
	let millisecond2 = Math.floor((days2*100000000)-((year2*10000000000)+(month2*1000000000)+(day2*100000000)+(hour2*10000000)+(minute2*100000)+(second2*1000)))
	joined = "joined the guild at " + year2 + "/" + month2 + "/" + day2 + " " + hour2 + ":" + pad(minute2,2) + ":" + pad(second2,2) + ":" + pad(millisecond2,3)
    }
    if (user.bot) {
	bot = "Is a bot account"
    }
    cached = client.users.get(user.id) ? "is in this bot's cache" : "is not in this bot's cache"
      for (guild of client.guilds){
	if (client.guilds.get(guild[1].id).members.get(user.id))
	   {
	    guildshare = "shares guilds with this bot"
	    if(client.guilds.get(guild[1].id).members.get(user.id).nickname){
            names = names + "`" + client.guilds.get(guild[1].id).members.get(user.id).nickname + "` " }
	   }
      }
    msg.reply("Mention:" + user.toString() + "\nID:" + user.id.toString() + "\nTag:" + user.tag.toString() + "\nName(s):" + names + "\nAvatar:" + user.displayAvatarURL.toString() + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3) + "\nNotes:" + bot + ", " + guildshare +  ", " + joined +  ", " + status +  ", " + cached)})
 
}
  if (command === '^guildinfo') { 
    guildid = args[0]
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    if (!client.guilds.get(guildid)) {
        if (!msg.guild) return;
	guildid = msg.guild.id
}
    let crownon = "The owner's crown is visible"
    for (role of client.guilds.get(guildid).roles) {
	if (role[1].hasPermission('ADMINISTRATOR') && role[1].hoist){
    	    crownon = "The owner's crown is not visible"
        }
    }
    let days = (client.guilds.get(guildid).createdTimestamp.toString() - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    msg.reply("Name:" + client.guilds.get(guildid).name + "\nID:" + client.guilds.get(guildid).id + "\nNumber of members (run `^guilduserinfo` for more details):" + client.guilds.get(guildid).memberCount + "\nOwner:" + client.guilds.get(guildid).owner + "`" + client.guilds.get(guildid).ownerID + "`\nIcon:" + client.guilds.get(guildid).iconURL + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3) + "\nNotes:" + crownon)
 
}
  if (command === '^channelinfo') { 
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    if (!args[0]) {
        //if (!msg.guild) return;
        let days = (msg.channel.createdTimestamp.toString() - 1489276800000) / 86400000
        let year = Math.floor(days/100)
        let month = Math.floor((days/10)-(year*10))
        let day = Math.floor(days-((year*100)+(month*10)))
        let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
        let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
        let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
        let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
	channelid = msg.channel.id
        let guild = "Not applicable"
        if (client.channels.get(channelid).guild){
	    guild = " `" + client.channels.get(channelid).guild.id + "` " + client.channels.get(channelid).guild.name
	}
	msg.reply("Name:" + client.channels.get(channelid).name + "\nID:" + client.channels.get(channelid).id + "\nMention:<#" + client.channels.get(channelid).id + ">\nGuild:" + guild + "\nDescription:" + client.channels.get(channelid).topic + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3))
    }
    else {
	channelid = args[0].replace(/\D/g,'')
	if (!client.channels.get(channelid)) return;
        let days = (client.channels.get(channelid).createdTimestamp.toString() - 1489276800000) / 86400000
        let year = Math.floor(days/100)
        let month = Math.floor((days/10)-(year*10))
        let day = Math.floor(days-((year*100)+(month*10)))
        let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
        let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
        let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
        let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
	if (!client.channels.get(channelid)) return;
        let guild = "Not applicable"
        if (client.channels.get(channelid).guild){
	    guild = " `" + client.channels.get(channelid).guild.id + "` " + client.channels.get(channelid).guild.name
	}
	msg.reply("Name:" + client.channels.get(channelid).name + "\nID:" + client.channels.get(channelid).id + "\nMention:<#" + client.channels.get(channelid).id + ">\nGuild:" + guild + "\nDescription:" + client.channels.get(channelid).topic + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3))
    }
}
  if (command === '^roleinfo') { 
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    if (!args[0]) return;
    roleid = args[0].replace(/\D/g,'')
    for (guild of client.guilds){
        if(client.guilds.get(guild[1].id).roles.get(roleid)){
        let days = (client.guilds.get(guild[1].id).roles.get(roleid).createdTimestamp.toString() - 1489276800000) / 86400000
        let year = Math.floor(days/100)
        let month = Math.floor((days/10)-(year*10))
        let day = Math.floor(days-((year*100)+(month*10)))
        let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
        let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
        let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
        let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
	let position = client.guilds.get(guild[1].id).roles.size - client.guilds.get(guild[1].id).roles.get(roleid).calculatedPosition
	msg.reply("Mention:" + client.guilds.get(guild[1].id).roles.get(roleid).toString() + "\nName:" + client.guilds.get(guild[1].id).roles.get(roleid).name + "\nID:" + client.guilds.get(guild[1].id).roles.get(roleid).id + "\nPosition (lower is more powerful):" + position + "\nGuild:" + client.guilds.get(guild[1].id).name + "`" + client.guilds.get(guild[1].id).id + "`\nPermissions:" + new Permissions(client.guilds.get(guild[1].id).roles.get(roleid).permissions).toArray() + "\nPermissions integer:" + client.guilds.get(guild[1].id).roles.get(roleid).permissions + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3))}
    }
    
 
}
  if (command === '^guilduserinfo') {
    if (msg.author.bot) return; 
    let message = "test"
    guildid = args[0]
    if (!client.guilds.get(guildid)) {
        if (!msg.guild) return;
	guildid = msg.guild.id
}
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    if (client.guilds.get(guildid).memberCount > 1000) {
    msg.reply("That's cool, but I'd die if I tried to do that. So just no.")
    return
    }
    for (user of client.guilds.get(guildid).members){
    userid = user[1]
    client.fetchUser(userid, false).then(user => {
    let guildshare = "shares no guilds with this bot"
    let bot = "Is not a bot account"
    let names = "`" + user.username.toString() + "` "
    let days = (user.createdTimestamp.toString() - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    let joined = "is not in this guild"
    let status = "is "
    if (user.presence.status=="online"){
	status = status + "online"
    }
    if (user.presence.status=="idle"){
	status = status + "online but shown as idle"
    }
    if (user.presence.status=="dnd"){
	status = status + "online but you probably shouldn't disturb them"
    }
    if (user.presence.status=="offline"){
	status = status + "offline or invisible or status unknown"
    }
    if (client.guilds.get(guildid).members.get(user.id)){
	let days2 = (client.guilds.get(guildid).members.get(user.id).joinedTimestamp.toString() - 1489276800000) / 86400000
	let year2 = Math.floor(days2/100)
	let month2 = Math.floor((days2/10)-(year2*10))
	let day2 = Math.floor(days2-((year2*100)+(month2*10)))
	let hour2 = Math.floor((days2*10)-((year2*1000)+(month2*100)+(day2*10)))
	let minute2 = Math.floor((days2*1000)-((year2*100000)+(month2*10000)+(day2*1000)+(hour2*100)))
	let second2 = Math.floor((days2*100000)-((year2*10000000)+(month2*1000000)+(day2*100000)+(hour2*10000)+(minute2*100)))
	let millisecond2 = Math.floor((days2*100000000)-((year2*10000000000)+(month2*1000000000)+(day2*100000000)+(hour2*10000000)+(minute2*100000)+(second2*1000)))
	joined = "joined the guild at " + year2 + "/" + month2 + "/" + day2 + " " + hour + ":" + pad(minute2,2) + ":" + pad(second2,2) + ":" + pad(millisecond2,3)
    }
    if (user.bot) {
	bot = "Is a bot account"
    }
      for (guild of client.guilds){
	if (client.guilds.get(guild[1].id).members.get(user.id))
	   {
	    guildshare = "shares guilds with this bot"
	    if(client.guilds.get(guild[1].id).members.get(user.id).nickname){
            names = names + "`" + client.guilds.get(guild[1].id).members.get(user.id).nickname + "` " }
	   }
      }
    msg.author.send("Mention:" + user.toString() + "\nID:" + user.id.toString() + "\nTag:" + user.tag.toString() + "\nName(s):" + names + "\nAvatar:" + user.displayAvatarURL.toString() + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3) + "\nNotes:" + bot + ", " + guildshare + ", " + joined +  ", " + status)})
      }
    msg.reply("Check your direct messages!")
}
  if (command === '^guilduserinfo.force') { 
    if (msg.author.bot) return; 
if (commandused1.has(msg.author.id)) {
            msg.channel.send("⛔ Command on cooldown");
    }
    else {
    let message = "test"
    guildid = args[0]
    if (!client.guilds.get(guildid)) {
        if (!msg.guild) return;
	guildid = msg.guild.id
}
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    if (client.guilds.get(guildid).memberCount > 1000) {
    msg.reply("That's cool, but I'd die if I tried to do that. So just no.")
    return
    }
    for (user of client.guilds.get(guildid).members){
    userid = user[1]
    client.fetchUser(userid, false).then(user => {
    let guildshare = "shares no guilds with this bot"
    let bot = "Is not a bot account"
    let names = "`" + user.username.toString() + "` "
    let days = (user.createdTimestamp.toString() - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    let joined = "is not in this guild"
    let status = "is "
    if (user.presence.status=="online"){
	status = status + "online"
    }
    if (user.presence.status=="idle"){
	status = status + "online but shown as idle"
    }
    if (user.presence.status=="dnd"){
	status = status + "online but you probably shouldn't disturb them"
    }
    if (user.presence.status=="offline"){
	status = status + "offline or invisible or status unknown"
    }
    if (client.guilds.get(guildid).members.get(user.id)){
	let days2 = (client.guilds.get(guildid).members.get(user.id).joinedTimestamp.toString() - 1489276800000) / 86400000
	let year2 = Math.floor(days2/100)
	let month2 = Math.floor((days2/10)-(year2*10))
	let day2 = Math.floor(days2-((year2*100)+(month2*10)))
	let hour2 = Math.floor((days2*10)-((year2*1000)+(month2*100)+(day2*10)))
	let minute2 = Math.floor((days2*1000)-((year2*100000)+(month2*10000)+(day2*1000)+(hour2*100)))
	let second2 = Math.floor((days2*100000)-((year2*10000000)+(month2*1000000)+(day2*100000)+(hour2*10000)+(minute2*100)))
	let millisecond2 = Math.floor((days2*100000000)-((year2*10000000000)+(month2*1000000000)+(day2*100000000)+(hour2*10000000)+(minute2*100000)+(second2*1000)))
	joined = "joined the guild at " + year2 + "/" + month2 + "/" + day2 + " " + hour + ":" + pad(minute2,2) + ":" + pad(second2,2) + ":" + pad(millisecond2,3)
    }
    if (user.bot) {
	bot = "Is a bot account"
    }
      for (guild of client.guilds){
	if (client.guilds.get(guild[1].id).members.get(user.id))
	   {
	    guildshare = "shares guilds with this bot"
	    if(client.guilds.get(guild[1].id).members.get(user.id).nickname){
            names = names + "`" + client.guilds.get(guild[1].id).members.get(user.id).nickname + "` " }
	   }
      }
    msg.reply("Mention (disabled):" + '`' + user.toString() + '`' + "\nID:" + user.id.toString() + "\nTag:" + user.tag.toString() + "\nName(s):" + names + "\nAvatar:" + user.displayAvatarURL.toString() + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3) + "\nNotes:" + bot + ", " + guildshare + ", " + joined +  ", " + status)})
      }
commandused1.add(msg.author.id);
        setTimeout(() => {
          commandused1.delete(msg.author.id);
        }, 8640000);
}}
  if (command === '^listpermissions') {
    if (!args[0]) return;
    let user = args[0].replace(/\D/g,'')
    let guild = args[1]
    if (!client.guilds.get(args[1])){
        if (!msg.guild) return;
	guild = msg.guild.id
    }
    if (!client.guilds.get(guild).members.get(user)) return;
    let ownerstatus = "This user is not the owner of the guild;\n"
    if (user == client.guilds.get(guild).owner.id){
	ownerstatus = "This user is the owner of the guild;\n"
    }
    msg.reply(ownerstatus + client.guilds.get(guild).members.get(user).permissions.toArray() + " Permissions integer: " + client.guilds.get(guild).members.get(user).permissions)
  }
  if (command === '^listbans') {
    let guild = args[0]
    if (!client.guilds.get(args[0])){
        if (!msg.guild) return;
	guild = msg.guild.id
    }
    client.rest.makeRequest('get', Endpoints.Guild(guild).bans, true).then(bans => {msg.reply(bans.map(ban => "<@" + ban.user.id + "> `" + ban.user.id + "`" + ban.reason).join("\n"), {split:true} );})
  }
  if (command === '^copybans') {
    let guild = args[0]
    let guild2 = args[1]
    if (msg.author.id == client.user.id) return;
    if (msg.author.bot) return;
    if (!client.guilds.get(args[0])) return;
    if (!client.guilds.get(args[1])){
        if (!msg.guild) return;
	guild2 = msg.guild.id
    }
    if (!client.guilds.get(guild2).members.get(msg.author.id)) return;
    if (msg.author.id == client.guilds.get(guild2).owner.id || client.guilds.get(guild2).members.get(msg.author.id).hasPermission("BAN_MEMBERS") ||  client.guilds.get(guild2).members.get(msg.author.id).hasPermission("ADMINISTRATOR")) {
    client.rest.makeRequest('get', Endpoints.Guild(guild).bans, true).then(bans => {for (ban of bans){client.guilds.get(guild2).ban(ban.user.id, {reason: ban.reason})}})
    msg.reply("Well, you have the permissions to ban. Check the ban list to see if it was succesful.")
    } else {
    msg.reply("You need owner, administrator or ban members permissions in the destination guild.")
    }
  }
  if (command === '^reverse') {
    if (commandused2.has(msg.author.id)) {
            msg.channel.send("⛔ Command on cooldown");
    }
    else if (reversing == "true") {
            msg.channel.send("⛔ Command currently in use");
    }
    else {
    if (!args[0]) return;
    let framerate = args[0].replace(/\D/g,'')
    let Attachment = (msg.attachments).array();
    let links = ""
    Attachment.forEach(function(attachment) {
    links = attachment.url
    })
    var re = /(?:\.([^.]+))?$/;
    let filename = msg.id + "." + re.exec(links)[1]
    msg.reply("PATIENCE!")
    reversing = "true"
    if (!args[1] == "mute" || !args[1]) {
    exec("mkdir " + msg.id + " && cd " + msg.id + " && timeout 300 ffmpeg -i " + links + " -an -qscale 1 -threads 1 %06d.jpg && timeout 300 ffmpeg -i " + links + " -vn -ac 2 audio.wav && timeout 300 sox -V audio.wav backwards.wav reverse && timeout 300 cat $(ls -t *jpg) | ffmpeg -f image2pipe -vcodec mjpeg -r " + framerate + " -i - -i backwards.wav -vcodec libx264 -threads 1 -fs 8000000 -acodec libvorbis out.mkv && rm *.jpg", (error, stdout, stderr) => { msg.reply("Be grateful.", {file: msg.id + "/out.mkv"});  commandused2.add(msg.author.id); reversing = "false"
        setTimeout(() => {
          commandused2.delete(msg.author.id);
        }, 10000);})}
    else {
    exec("mkdir " + msg.id + " && cd " + msg.id + " && timeout 300 ffmpeg -i " + links + " -an -qscale 1 -threads 1 %06d.jpg && timeout 300 cat $(ls -t *jpg) | ffmpeg -f image2pipe -vcodec mjpeg -r " + framerate + " -i - -vcodec libx264 -threads 1 -fs 8000000 out.mkv && rm *.jpg", (error, stdout, stderr) => { msg.reply("Be grateful.", {file: msg.id + "/out.mkv"});  commandused2.add(msg.author.id); reversing = "false"
        setTimeout(() => {
          commandused2.delete(msg.author.id);
        }, 10000);})}}
    

  }
  if (command === '^finduser') { 
    let searchterm = msg.content.replace('^finduser ','')
    let list = ""
    for (user of client.users){
	user = user[1]
        names = ""
      for (guild of client.guilds){
	if (client.guilds.get(guild[1].id).members.get(user.id))
	   {
	    if(client.guilds.get(guild[1].id).members.get(user.id).nickname){
            names = names + " " + client.guilds.get(guild[1].id).members.get(user.id).nickname}
	   }
      }
        if(user.tag.toLowerCase().includes(searchterm.toLowerCase()) || user.id.includes(searchterm) || names.toLowerCase().includes(searchterm.toLowerCase()))
	{
	    list = list + user.toString() + " `" + user.id + "` " + user.tag + "\n"
        }
    }
    msg.reply("Check your direct messages!")
    msg.author.send(list, { split: true }) 
}
  if (command === '^finduser.force') { 
    let searchterm = msg.content.replace('^finduser.force ','')
    let list = ""
    for (user of client.users){
	user = user[1]
        names = ""
      for (guild of client.guilds){
	if (client.guilds.get(guild[1].id).members.get(user.id))
	   {
	    if(client.guilds.get(guild[1].id).members.get(user.id).nickname){
            names = names + " " + client.guilds.get(guild[1].id).members.get(user.id).nickname}
	   }
      }
        if(user.tag.toLowerCase().includes(searchterm.toLowerCase()) || user.id.includes(searchterm) || names.toLowerCase().includes(searchterm.toLowerCase()))
	{
	    list = list + user.toString() + " `" + user.id + "` " + user.tag + "\n"
        }
    }
    msg.reply(list, { split: true }) 
}
  if (command === '^findguild') { 
    let searchterm = msg.content.replace('^findguild ','')
    let list = ""
    for (guild of client.guilds){
	guild = guild[1]
        if(guild.name.toLowerCase().includes(searchterm.toLowerCase()) || guild.id.includes(searchterm))
	{
	    list = list + "`" + guild.id + "` " + guild.name + "\n"
        }
    }
    msg.reply(list, { split: true }) 
}
  if (command === '^findchannel') { 
    let searchterm = msg.content.replace('^findchannel ','')
    let list = ""
    for (channel of client.channels){
	channel = channel[1]
        if(channel.type !== "dm"){
        if(channel.name.toLowerCase().includes(searchterm.toLowerCase()) || channel.id.includes(searchterm))
	{
	    list = list + "`" + channel.id + "` " + channel.toString() + " " + channel.name + "\n"
        }}
    }
    msg.reply(list, { split: true }) 
}
  if (command === '^findrole') { 
    let searchterm = msg.content.replace('^findrole ','')
    let list = ""
    for (guild of client.guilds){
    for (role of guild[1].roles){
	role = role[1]
        if(role.name.toLowerCase().includes(searchterm.toLowerCase()) || role.id.includes(searchterm))
	{
	    list = list + "`" + role.id + "` " + role.toString() + " " + role.name + " " + "`" + guild[1].id + "` " + guild[1].name + "\n"
        }
    }}
    msg.reply(list, { split: true }) 
}
  if (command === '^findemote') { 
    let searchterm = msg.content.replace('^findemote ','')
    let list = ""
    for (guild of client.guilds){
    for (emoji of guild[1].emojis){
	emoji = emoji[1]
        if(emoji.name.toLowerCase().includes(searchterm.toLowerCase()) || emoji.id.includes(searchterm))
	{
	    list = list + "`" + emoji.toString() + "` " + emoji.toString() + " " + emoji.name + " " + "`" + guild[1].id + "` " + guild[1].name + "\n"
        }
    }}
    msg.reply(list, { split: true }) 
}
  if (command === '^type') {
    if(!args[0]) return;
    let id = args[0]
    let found = false
    if(client.guilds.get(id) && client.channels.get(id)){
	msg.reply("It would appear to be a guild and a channel. Run `^guildinfo " + id + "` or `^channelinfo " + id + "` for more information.")
    }
    else if(client.guilds.get(id)){
	msg.reply("It would appear to be a guild. Run `^guildinfo " + id + "` for more information.")
    }
    else if(client.channels.get(id)){
	msg.reply("It would appear to be a channel. Run `^channelinfo " + id + "` for more information.")
    }
    else if(client.users.get(id)){
	msg.reply("They would appear to be a user. Run `^userinfo " + id + "` for more information.")
    }
    else {
	for (guild of client.guilds){
	    if(guild[1].roles.get(id)){
		msg.reply("It would appear to be a role. Run `^roleinfo " + id + "` for more information.")
		found = true
	    }
	    if(guild[1].emojis.get(id)){
		msg.reply("It would appear to be an emote from " + guild[1].id + ". " + guild[1].emojis.get(id).toString() + " Run `^guildinfo " + guild[1].id + "` for more information.")
		found = true
	    }
	}
	client.fetchUser(id, false).then(user => {
	    if(user.id == id){
		msg.reply("They would appear to be a user. Run `^userinfo " + id + "` for more information.")
		found = true
	    }
	})
	client.rest.makeRequest('get', Endpoints.Guild(id).embed, true).then(guild => {
	msg.reply(guild.name);
	}).catch(err =>{if(err.toString() !== "DiscordAPIError: Unknown Guild") msg.reply("It would appear to be a guild that the bot is not a member of.");})
	for (channel of client.channels){
		if (client.channels.get(channel[1].id).type !== "voice") {
		if (client.channels.get(channel[1].id).type !== "category"){
			client.channels.get(channel[1].id).fetchMessage(id).then(message => {
			     if(message.id == id){
				msg.reply("It would appear to be a message from " + channel[1].toString() + ". Run `^messagein " + id + "` or `^channelinfo " + channel[1].id + "` for more information.")
				found = true
			     }
			}) } }
	}
    }
  }
  if (command === '^crownstop') {
    let guilde = args[0]
    roles = ''
    working = "The crown should be visible! Try reloading Discord or shortening the owner's name if it isn't showing for you."
    if (!client.guilds.get(guilde)){
        if (!msg.guild) return;
	for (role of msg.guild.roles){
        if (role[1].hasPermission('ADMINISTRATOR') && role[1].hoist){
        working = ""
        roles = roles + "`<@&" + role[1].id + "> `" + role[1].name + "\n"
	}}
    }
    else{
	for (role of client.guilds.get(guilde).roles){
        if (role[1].hasPermission('ADMINISTRATOR') && role[1].hoist){
        working = ""
            roles = roles + "`<@&" + role[1].id + "> `" + role[1].name + "\n"
    }}}
    msg.reply(working + roles, { split: true });
  }
  if (command === '^ping') {
    const starttime = Date.now()
    pingfunc = client.ping / 0.864
    sinceid = (new Date().getTime() - msg.createdTimestamp) / 0.864
    convert = "\nAll units are decimal. To convert to imperial please use `^convert decs [amount]`."
    msg.reply("According to the actual ping function: " + pingfunc + " ms. Time taken to read that message (according to Discord IDs which are very inaccurate): " + sinceid + " ms.").then(message => {
    takentime = (message.createdTimestamp-starttime)/0.864
    senddiff = (message.createdTimestamp-msg.createdTimestamp)/0.864
    message.edit(message.content + " Time taken to send this message from first reading it (according to Discord IDs which are very inaccurate): " + takentime + " ms. Overall time between command and reply (according to Discord IDs which are very inaccurate): " + senddiff + " ms." + convert)
})
  }
  if (client.roles.get(command.replace(/\D/g,''))) {
    if (client.roles.get(command.replace(/\D/g,'')).name.toLowerCase() == "someone"){
	if (msg.author.bot) return;
	if (!msg.guild) return;
        victim1 = msg.guild.members.random()
	victim = client.users.get(victim1.id)
        victimname = victim1.nickname ? victim1.nickname : victim.username
	msg.channel.send("@someone idk (" + victimname + ") \\" + victim.toString()).then(message=>{message.edit("@someone idk (" + victimname + ")")})
  }}
  if (command === '@someone') {
	if (msg.author.bot) return;
	if (!msg.guild) return;
        victim1 = msg.guild.members.random()
	victim = client.users.get(victim1.id)
        victimname = victim1.nickname ? victim1.nickname : victim.username
	msg.channel.send("@someone idk (" + victimname + ") \\" + victim.toString()).then(message=>{message.edit("@someone idk (" + victimname + ")")})
  }
  if (command === '^ban') {
    if (client.guilds.get(args[0])) {
	if (!args[1]) return;
	userid = args[1].replace(/\D/g,'')
	userrem = args[1]
	const parts = msg.content.trim().split(/#+/g); 
	if (parts[1]){
	firstpart = parts[0].replace('^ban ','').replace(args[0] + ' ', '');
	secondpart = parts[1].slice(0,4)
	tag = firstpart + "#" + secondpart
	//msg.reply(tag)
	if(client.users.find(user => user.tag === tag)){
	   userid = client.users.find(user => user.tag === tag).id
	   userrem = tag
	}
	}
	if (!client.guilds.get(args[0]).members.get(msg.author.id)) return;
	if (msg.author.id == client.guilds.get(args[0]).owner.id || client.guilds.get(args[0]).members.get(msg.author.id).hasPermission("BAN_MEMBERS") ||  client.guilds.get(args[0]).members.get(msg.author.id).hasPermission("ADMINISTRATOR")) {
	client.fetchUser(userid).then(userr => {
	client.guilds.get(args[0]).ban(userr.id, {reason: msg.content.replace('^ban ','').replace(args[0],'').replace(userrem,'')}).then(user => {msg.reply(userr.toString() + "/" + userr.id + "/" + userr.tag + " was banned from " + args[0] + "/" + client.guilds.get(args[0]).name + ".")}).catch(err => {msg.reply(err.toString())})}).catch(err => {msg.reply(err.toString())})
	}
    }
    else {
	if (!msg.guild) return;
	if (!args[0]) return;
	userid = args[0].replace(/\D/g,'')
	userrem = args[0]
	const parts = msg.content.trim().split(/#+/g); 
	if (parts[1]){
	firstpart = parts[0].replace('^ban ','');
	secondpart = parts[1].slice(0,4)
	tag = firstpart + "#" + secondpart
	if(client.users.find(user => user.tag === tag)){
	   userid = client.users.find(user => user.tag === tag).id
	   userrem = tag
	}
	}
	if (msg.author.id == msg.guild.owner.id || msg.guild.members.get(msg.author.id).hasPermission("BAN_MEMBERS") ||  msg.guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR")) {
	client.fetchUser(userid).then(userr => {
	msg.guild.ban(userid, {reason: msg.content.replace('^ban ','').replace(userrem,'')}).then(user => {msg.reply(userr.toString() + "/" + userr.id + "/" + userr.tag + " was banned from " + msg.guild.id + "/" + msg.guild.name + ".")}).catch(err => {msg.reply(err.toString())})}).catch(err => {msg.reply(err.toString())})
	}
    }
  }
  if (command === '^baseconvert') { 
    msg.reply(parseFloat(args[0], args[1]).toString(args[2]))
}
})
encryptkey = "<secret-encryptkey>"
forcekey = "<secret-forcekey>"
client.login('<bot-token>');
