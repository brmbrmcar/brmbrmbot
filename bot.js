const Discord = require('discord.js');
const client = new Discord.Client();
let exec = require('child_process').exec;
var cli = new Discord.Client({autoReconnect:false});
var CryptoJS = require("crypto-js");
var Decimal = require('decimal.js');
var Fraction = require('fraction.js');
var BigFraction = require('fraction.js'); // just go with it until brmbrmfraction comes out :) whatever i call it i'm putting : to piss of windows users
var BigNumber = require('bignumber.js');
const Constants = require('discord.js/src/util/Constants.js');
const Snowflake = require('discord.js/src/util/Snowflake');
const Permissions = require('discord.js/src/util/Permissions');
const Endpoints = Constants.Endpoints;
const fs = require('fs');
const math = require('mathjs')
eval(fs.readFileSync('./BigInteger.min.js').toString());
//eval(fs.readFileSync('./decimal.js').toString());
var messagescountgame = 0
var messagebybotcount = new Set();
var messagebyusercount = new Set();
var messagebywebhookcount = new Set();
var messagebybotdcount = new Set();
var messagebyuserdcount = new Set();
var messagebywebhookdcount = new Set();
var channelistyping = new Set();
var messagesfetchedstart = 0
var readyglobal = false
var globalmessageless = true
var globalidle = true
var globalsetidle = false

function userpromise(input, cache = true, forcefetch = false, raw = false) {
	if (!input) return Promise.reject(new Error('I need an input, my nice friend ❤🤗'))
	var inputuserid = input.toString().replace(/\D/g,'')
	var inputdiscrim = ""
	var inputname = ""
	var splitinput = input.toString().split(/#+/g)
	if (splitinput[1]) {
		inputdiscrim = /^\d+$/.test(splitinput[1]) ? splitinput[1] : splitinput[0]
		inputname = inputdiscrim == splitinput[1] ? splitinput[0].replace("@","") : splitinput[1].replace("@","")
		inputuserid = client.users.find(u => u.username == inputname && u.discriminator == inputdiscrim) ? client.users.find(u => u.username == inputname && u.discriminator == inputdiscrim).id : inputuserid
	}
	if (raw == false && forcefetch == false && client.users.get(inputuserid)) return Promise.resolve(client.users.get(inputuserid));
	if (raw == false) return client.rest.methods.getUser(inputuserid, false).then(data => {
		if (cache == true) client.actions.UserGet.handle(data);
		return data;
	})
	return client.rest.makeRequest('get', Endpoints.User(inputuserid), true).then(data => {
		if (cache == true) client.actions.UserGet.handle(data);
		return data;
	})
}

function escapestr(input) {
	if (!input) return input
	if (!input.toString()) return input
	input = input.toString()
	return input.replace(new RegExp("\\|", "g"), "\\|").replace(new RegExp("~", "g"), "\\~").replace(new RegExp("`", "g"), "\\`").replace(new RegExp("\\*", "g"), "\\*").replace(new RegExp("_", "g"), "\\_")
}

function isfriends(sendr, recr, str = false) {
	if (!sendr || !recr) return Promise.reject(new Error('I need an input, my nice friend ❤🤗'))
	if (!sendr.id || !recr.id) return Promise.reject(new Error('I need an input, my nice friend ❤🤗'))
	var friendl = fs.readFileSync('friends.txt', 'utf-8').split(/\n+/g)
	var friendsq = friendl.indexOf(sendr.id + ' ' + recr.id) != -1 || friendl.indexOf(recr.id + ' ' + sendr.id) != -1
	if (!str) return friendsq
	if (friendsq) return 'true'
	var pendingl = fs.readFileSync('pending.txt', 'utf-8').split(/\n+/g)
	if (friendl.indexOf(sendr.id + ' ' + recr.id) != -1) return 'out'
	if (friendl.indexOf(recr.id + ' ' + sendr.id) != -1) return 'in'
	return 'false'
}
//client.on('disconnected', function () { process.exitCode = 1; });
//client.on('error', function () { process.exitCode = 1; });
client.on('ready', () => {
  readyglobal = true
  console.log(`Logged in as ${client.user.tag}!`);
  setTimeout (function (){
  var mutualcountgameset = new Set();
  for (guild of client.guilds.values()){
      for (member of guild.members.values()) {
	if (!mutualcountgameset.has(member.id)) mutualcountgameset.add(member.id)
      }
  }
  client.user.setGame('^help | ' + client.guilds.size + ' guilds, ' + client.users.size + ' cached users, ' + mutualcountgameset.size + ' users with shared guilds, ' + messagescountgame + ' messages | brmbrmcar.github.io/brmbrmbot');
  }, 3000);
  setInterval (function (){
     var mutualcountgameset = new Set();
     for (guild of client.guilds.values()){
         for (member of guild.members.values()) {
	    if (!mutualcountgameset.has(member.id)) mutualcountgameset.add(member.id)
         }
     }
     client.user.setGame('^help | ' + client.guilds.size + ' guilds, ' + client.users.size + ' cached users, ' + mutualcountgameset.size + ' users with shared guilds, ' + messagescountgame + ' messages | brmbrmcar.github.io/brmbrmbot');     
  }, 60000);
  setInterval (function (){
     if (client.ping > 5000) process.exitCode = 1  
  }, 10000);
  setInterval (function (){
     if (globalidle && !globalsetidle) {
	client.user.setStatus('idle')
	globalsetidle = true
     }
     globalidle = true
  }, 600000);
 // setInterval (function (){
 //    if (globalmessageless) process.exitCode = 1
 //    globalmessageless = true  
 // }, 180000);
  //fetchallmessages()
  fetchallmembers()
});
client.on('raw', packet => {
  try {
	if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
	var channel = client.channels.get(packet.d.channel_id);
	if (!channel) return
	if (!channel.guild) return
	var messageid = packet.d.message_id
        var emoji = packet.d.emoji.id ? packet.d.emoji.name + ":" + packet.d.emoji.id + ">" : packet.d.emoji.name;
	var user = client.users.get(packet.d.user_id)
	if (!user) return
	if (!channel.guild.members.get(user.id)) return
	var broken = false
	for (line of fs.readFileSync('reactionroles.txt', 'utf-8').split(/\n+/g)) {
		if (broken) continue
		var parts = line.split(" ")
		if (!parts[3]) continue
		if (parts[0] != messageid || parts[1] != channel.id) continue
		if (!client.roles.get(parts[2])) continue
		var role = client.roles.get(parts[2])
		if (emoji != parts[3]) continue
		var broken = true
        	if (packet.t === 'MESSAGE_REACTION_ADD') {
			channel.guild.members.get(user.id).addRole(parts[2], "You asked me to do it!").then(member => {
				var sendline = false
				for (line2 of fs.readFileSync('reactionrolesmsg.txt', 'utf-8').split(/\n+/g)) {
					if (sendline) continue
					var parts2 = line2.split(" ")
					if (!parts2[3]) continue
					if (parts2[0] != messageid || parts2[1].replace(/\D/g,'') != channel.id) continue
					var dest = parts2[2].toLowerCase == "dm" ? user : client.channels.get(parts2[2].replace(/\D/g,''))
					var sendline = line2.replace(parts2[0] + " " + parts2[1] + " " + parts2[2] + " ", "").replace(new RegExp("{user}", "g"), "<@" + user.id + ">").replace(new RegExp("{user.mention}", "g"), "<@" + user.id + ">").replace(new RegExp("{user.id}", "g"), user.id).replace(new RegExp("{user.tag}", "g"), user.tag).replace(new RegExp("{user.name}", "g"), user.username).replace(new RegExp("{user.discrim}", "g"), user.discriminator).replace(new RegExp("{role}", "g"), "<@&" + role.id + ">").replace(new RegExp("{role.mention}", "g"), "<@&" + role.id + ">").replace(new RegExp("{role.id}", "g"), role.id).replace(new RegExp("{role.name}", "g"), role.name)
				}
				if (sendline && dest) dest.send(sendline);
				else user.send("Apparently you gave yourself the role " + role.name + ", so I gave it to you! 🤗❤️")
			}).catch(err => { console.log(err) })
        	}
       		if (packet.t === 'MESSAGE_REACTION_REMOVE') {
			channel.guild.members.get(user.id).removeRole(parts[2], "You asked me to do it!").then(member => {
				var sendline = false
				for (line2 of fs.readFileSync('reactionrolesmsgrem.txt', 'utf-8').split(/\n+/g)) {
					if (sendline) continue
					var parts2 = line2.split(" ")
					if (!parts2[3]) continue
					if (parts2[0] != messageid || parts2[1].replace(/\D/g,'') != channel.id) continue
					var dest = parts2[2].toLowerCase == "dm" ? user : client.channels.get(parts2[2].replace(/\D/g,''))
					var sendline = line2.replace(parts2[0] + " " + parts2[1] + " " + parts2[2] + " ", "").replace(new RegExp("{user}", "g"), "<@" + user.id + ">").replace(new RegExp("{user.mention}", "g"), "<@" + user.id + ">").replace(new RegExp("{user.id}", "g"), user.id).replace(new RegExp("{user.tag}", "g"), user.tag).replace(new RegExp("{user.name}", "g"), user.username).replace(new RegExp("{user.discrim}", "g"), user.discriminator).replace(new RegExp("{role}", "g"), "<@&" + role.id + ">").replace(new RegExp("{role.mention}", "g"), "<@&" + role.id + ">").replace(new RegExp("{role.id}", "g"), role.id).replace(new RegExp("{role.name}", "g"), role.name)
				}
				if (sendline && dest) dest.send(sendline);
				else user.send("Apparently you removed yourself from the role " + role.name + ", so I took it from you! 🤗❤️")
			}).catch(err => { console.log(err) })
        	}
	}
  } catch (err) { console.log(err) }
});
client.on("guildMemberAdd", user => {
  client.fetchUser(user.id).catch(err => {})
  if(client.channels.get("496014515725402112")) client.channels.get("496014515725402112").send(user.toString() + "/" + user.id + "/" + user.user.tag + " has joined " + user.guild.id + "/" + user.guild.name + ".")
  try {
     for (channellog of fs.readFileSync('joinlogs.txt', 'utf-8').split(/\n+/g)) {
	if (!channellog.split(/ +/g)[2]) continue;
	if (!client.channels.get(channellog.split(/ +/g)[1])) continue;
	if (!client.channels.get(channellog.split(/ +/g)[1]).guild) continue;
	if ((user.guild.name.includes("*") && channellog.includes("*")) || (user.guild.name.includes("`") && channellog.includes("`")) || (user.guild.name.includes("_") && channellog.includes("_")) || (user.guild.name.includes("~") && channellog.includes("~"))) {
	     guildtouse = user.guild.id
	}
	else {
	     guildtouse = user.guild.name
	}
	if (client.channels.get(channellog.split(/ +/g)[1]).guild.members.get(user.id)) {
	   usertouse = client.channels.get(channellog.split(/ +/g)[1]).guild.members.get(user.id).toString();
        }
	else {
	   if ((user.user.tag.includes("*") && channellog.includes("*")) || (user.user.tag.includes("`") && channellog.includes("`")) || (user.user.tag.includes("_") && channellog.includes("_")) || (user.user.tag.includes("~") && channellog.includes("~"))) {
		usertouse = user.id
	   }
	   else {
		usertouse = user.user.tag
	   }
	}
	if (channellog.split(/ +/g)[0] == user.guild.id) {
	   content = channellog.replace(channellog.split(/ +/g)[0] + " " + channellog.split(/ +/g)[1] + " ", "").replace(new RegExp("\\\\/n", "g"), "\n").replace(new RegExp("{user.mention}", "g"), "<@" + user.id + ">").replace(new RegExp("{user.id}", "g"), user.id).replace(new RegExp("{user.tag}", "g"), user.user.tag).replace(new RegExp("{user.name}", "g"), user.user.username).replace(new RegExp("{user.discrim}", "g"), user.user.discriminator).replace(new RegExp("{user}", "g"), usertouse).replace(new RegExp("{guild}", "g"), guildtouse).replace(new RegExp("{guild.name}", "g"), user.guild.name).replace(new RegExp("{guild.id}", "g"), user.guild.id)
	   client.channels.get(channellog.split(/ +/g)[1]).send(content)
	}
     }
     if (user.user.bot) {
	for (guildrole of fs.readFileSync('botautorole.txt', 'utf-8').split(/\n+/g)) {
	   if (!guildrole.split(/ +/g)[1]) continue;
	   if (guildrole.split(/ +/g)[0] != user.guild.id) continue;
	   if (!user.guild.roles.get(guildrole.split(/ +/g)[1])) continue;
	   ended = false
	   rolestoadd = []
	   reason = ""
	   for (role of guildrole.split(/ +/g)) {
	     if (role == user.guild.id && ended == false) continue;
	     if (user.guild.roles.get(role) && ended == false) {
		rolestoadd.push(role)
	     }
	     else {
		ended = true
		reason = reason + role + " "
	     }
	   }
	   user.addRoles(rolestoadd, reason)
	}
     }
     else {
	for (guildrole of fs.readFileSync('autorole.txt', 'utf-8').split(/\n+/g)) {
	   if (!guildrole.split(/ +/g)[1]) continue;
	   if (guildrole.split(/ +/g)[0] != user.guild.id) continue;
	   if (!user.guild.roles.get(guildrole.split(/ +/g)[1])) continue;
	   ended = false
	   rolestoadd = []
	   reason = ""
	   for (role of guildrole.split(/ +/g)) {
	     if (role == user.guild.id && ended == false) continue;
	     if (user.guild.roles.get(role) && ended == false) {
		rolestoadd.push(role)
	     }
	     else {
		ended = true
		reason = reason + role + " "
	     }
	   }
	   user.addRoles(rolestoadd, reason)
	}
     }
  } catch (err) { console.log(err) }
})
client.on("guildMemberRemove", user => {
  client.fetchUser(user.id).catch(err => {})
  if(client.channels.get("496014515725402112")) client.channels.get("496014515725402112").send(user.toString() + "/" + user.id + "/" + user.user.tag + " has left " + user.guild.id + "/" + user.guild.name + ". Nickname: " + user.nickname + "\nRoles:\n" + user.roles.map(roleid => roleid.id + " " + roleid.toString() + " " + roleid.name).join("\n"), { split: true })
  try {
     for (channellog of fs.readFileSync('leavelogs.txt', 'utf-8').split(/\n+/g)) {
	if (!channellog.split(/ +/g)[2]) continue;
	if (!client.channels.get(channellog.split(/ +/g)[1])) continue;
	if (!client.channels.get(channellog.split(/ +/g)[1]).guild) continue;
	if ((user.guild.name.includes("*") && channellog.includes("*")) || (user.guild.name.includes("`") && channellog.includes("`")) || (user.guild.name.includes("_") && channellog.includes("_"))) {
	     guildtouse = user.guild.id
	}
	else {
	     guildtouse = user.guild.name
	}
	if (client.channels.get(channellog.split(/ +/g)[1]).guild.members.get(user.id) && user.guild.id != client.channels.get(channellog.split(/ +/g)[1]).guild.id) {
	   usertouse = client.channels.get(channellog.split(/ +/g)[1]).guild.members.get(user.id).toString();
        }
	else {
	   if ((user.user.tag.includes("*") && channellog.includes("*")) || (user.user.tag.includes("`") && channellog.includes("`")) || (user.user.tag.includes("_") && channellog.includes("_"))) {
		usertouse = user.id
	   }
	   else {
		usertouse = user.user.tag
	   }
	}
	if (channellog.split(/ +/g)[0] == user.guild.id) {
	   content = channellog.replace(channellog.split(/ +/g)[0] + " " + channellog.split(/ +/g)[1] + " ", "").replace(new RegExp("\\\\/n", "g"), "\n").replace(new RegExp("{user.mention}", "g"), "<@" + user.id + ">").replace(new RegExp("{user.id}", "g"), user.id).replace(new RegExp("{user.tag}", "g"), user.user.tag).replace(new RegExp("{user.name}", "g"), user.user.username).replace(new RegExp("{user.discrim}", "g"), user.user.discriminator).replace(new RegExp("{user}", "g"), usertouse).replace(new RegExp("{guild}", "g"), guildtouse).replace(new RegExp("{guild.name}", "g"), user.guild.name).replace(new RegExp("{guild.id}", "g"), user.guild.id)
	   client.channels.get(channellog.split(/ +/g)[1]).send(content)
	}
     }
  } catch (err) { console.log(err) }
})
client.on("guildBanAdd", (guild, user) => {
  client.fetchUser(user).then(userr => {
  if(client.channels.get("496014515725402112")) client.channels.get("496014515725402112").send(userr.toString() + "/" + userr.id + "/" + userr.tag + " was banned from " + guild.id + "/" + guild.name + ".")
try {
     for (channellog of fs.readFileSync('banlogs.txt', 'utf-8').split(/\n+/g)) {
	if (!channellog.split(/ +/g)[2]) continue;
	if (!client.channels.get(channellog.split(/ +/g)[1])) continue;
	if (!client.channels.get(channellog.split(/ +/g)[1]).guild) continue;
	if ((guild.name.includes("*") && channellog.includes("*")) || (guild.name.includes("`") && channellog.includes("`")) || (guild.name.includes("_") && channellog.includes("_"))) {
	     guildtouse = guild.id
	}
	else {
	     guildtouse = guild.name
	}
	if (client.channels.get(channellog.split(/ +/g)[1]).guild.members.get(userr.id) && guild.id != client.channels.get(channellog.split(/ +/g)[1]).guild.id) {
	   usertouse = client.channels.get(channellog.split(/ +/g)[1]).guild.members.get(userr.id).toString();
        }
	else {
	   if ((userr.tag.includes("*") && channellog.includes("*")) || (userr.tag.includes("`") && channellog.includes("`")) || (userr.tag.includes("_") && channellog.includes("_"))) {
		usertouse = userr.id
	   }
	   else {
		usertouse = userr.tag
	   }
	}
	if (channellog.split(/ +/g)[0] == guild.id) {
	   content = channellog.replace(channellog.split(/ +/g)[0] + " " + channellog.split(/ +/g)[1] + " ", "").replace(new RegExp("\\\\/n", "g"), "\n").replace(new RegExp("{user.mention}", "g"), "<@" + userr.id + ">").replace(new RegExp("{user.id}", "g"), userr.id).replace(new RegExp("{user.tag}", "g"), userr.tag).replace(new RegExp("{user.name}", "g"), userr.username).replace(new RegExp("{user.discrim}", "g"), userr.discriminator).replace(new RegExp("{user}", "g"), usertouse).replace(new RegExp("{guild}", "g"), guildtouse).replace(new RegExp("{guild.name}", "g"), guild.name).replace(new RegExp("{guild.id}", "g"), guild.id)
	   client.channels.get(channellog.split(/ +/g)[1]).send(content)
	}
     }
  } catch (err) { console.log(err) }
}).catch(err => {})
})
client.on("guildBanRemove", (guild, user) => {
  client.fetchUser(user.id).catch(err => {})
  if(client.channels.get("496014515725402112")) client.channels.get("496014515725402112").send(user.toString() + "/" + user.id + "/" + user.tag + " was unbanned from " + guild.id + "/" + guild.name + ".")
  try {
     for (channellog of fs.readFileSync('unbanlogs.txt', 'utf-8').split(/\n+/g)) {
	if (!channellog.split(/ +/g)[2]) continue;
	if (!client.channels.get(channellog.split(/ +/g)[1])) continue;
	if (!client.channels.get(channellog.split(/ +/g)[1]).guild) continue;
	if ((guild.name.includes("*") && channellog.includes("*")) || (guild.name.includes("`") && channellog.includes("`")) || (guild.name.includes("_") && channellog.includes("_"))) {
	     guildtouse = guild.id
	}
	else {
	     guildtouse = guild.name
	}
	if (client.channels.get(channellog.split(/ +/g)[1]).guild.members.get(user.id) && guild.id != client.channels.get(channellog.split(/ +/g)[1]).guild.id) {
	   usertouse = client.channels.get(channellog.split(/ +/g)[1]).guild.members.get(user.id).toString();
        }
	else {
	   if ((user.tag.includes("*") && channellog.includes("*")) || (user.tag.includes("`") && channellog.includes("`")) || (user.tag.includes("_") && channellog.includes("_"))) {
		usertouse = user.id
	   }
	   else {
		usertouse = user.tag
	   }
	}
	if (channellog.split(/ +/g)[0] == guild.id) {
	   content = channellog.replace(channellog.split(/ +/g)[0] + " " + channellog.split(/ +/g)[1] + " ", "").replace(new RegExp("\\\\/n", "g"), "\n").replace(new RegExp("{user.mention}", "g"), "<@" + user.id + ">").replace(new RegExp("{user.id}", "g"), user.id).replace(new RegExp("{user.tag}", "g"), user.tag).replace(new RegExp("{user.name}", "g"), user.username).replace(new RegExp("{user.discrim}", "g"), user.discriminator).replace(new RegExp("{user}", "g"), usertouse).replace(new RegExp("{guild}", "g"), guildtouse).replace(new RegExp("{guild.name}", "g"), guild.name).replace(new RegExp("{guild.id}", "g"), guild.id)
	   client.channels.get(channellog.split(/ +/g)[1]).send(content)
	}
     }
  } catch (err) { console.log(err) }
})
client.on("guildCreate", guild => {
  guild.fetchMembers().catch(err => {})
//  for (channel of guild.channels){
//	if(client.channels.get(channel[1].id).type == "text"){
//	client.channels.get(channel[1].id).fetchMessages().catch(err => {})
//	}
//  }
  if(client.channels.get("496014515725402112")) client.channels.get("496014515725402112").send("The bot has joined the guild " + guild.id + "/" + guild.name + ".")
})
client.on("guildDelete", guild => {
  if (guild.me){
  if(client.channels.get("496014515725402112")) client.channels.get("496014515725402112").send("The bot has left the guild " + guild.id + "/" + guild.name + ". It was probably deleted.\nRoles:\n" + guild.me.roles.map(roleid => roleid.id + " " + roleid.toString() + " " + roleid.name).join("\n"), { split: true })
  }
  else {
  if(client.channels.get("496014515725402112")) client.channels.get("496014515725402112").send("The bot has left the guild " + guild.id + "/" + guild.name + ".")
  }
})
const commandused1 = new Set();
const commandused2 = new Set();
var reversing = "false"

function fetchallmessages(){
   for (channel of client.channels){
     if(client.channels.get(channel[1].id).type == "text"){
	client.channels.get(channel[1].id).fetchMessages().then(messages => {
	     messagescountgame = messagescountgame + messages.size;
	     messagesfetchedstart = messagesfetchedstart + messages.size;
	     //if (messages.size > 0) fetchallmessages() - I ran this once and it was serious API abuse and even I'm not that mad
	     for (message of messages) {
		if (!message.author) return;
		if (!message.author.id) return;
		client.fetchUser(message.author.id).catch(err => {})
	     }
        }).catch(err => {})
     }
   }
}
function fetchallmembers(){
   for (guild of client.guilds){
     client.guilds.get(guild[1].id).fetchMembers().catch(err => {})
     client.guilds.get(guild[1].id).fetchBans().catch(err => {})
   }
}

client.on("messageDelete", (messageDelete) => {
  globalmessageless = false
  messagescountgame = messagescountgame - 1
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
try {
  globalmessageless = false
  if (msg.author.id == client.user.id) {
    globalidle = false
    if (globalsetidle) client.user.setStatus('online')
    globalsetidle = false
  }
  messagescountgame = messagescountgame + 1
  if (msg.webhookID && !messagebywebhookdcount.has(msg.webhookID)) messagebywebhookdcount.add(msg.webhookID);
  if (msg.author.bot && !msg.webhookID && !messagebybotdcount.has(msg.author.id)) messagebybotdcount.add(msg.author.id);
  if (!msg.author.bot && !messagebyuserdcount.has(msg.author.id)) messagebyuserdcount.add(msg.author.id);
  if (msg.webhookID) messagebywebhookcount.add(msg.id);
  if (msg.author.bot && !msg.webhookID) messagebybotcount.add(msg.id);
  if (!msg.author.bot) messagebyusercount.add(msg.id);
  const prefix = "^"
  if (msg.webhookID) return;
  const args = msg.content.trim().split(/ +/g);
  const command = args.shift();
  if (command.includes(".force")) {
    allowed = msg.guild ? false : true
    for (channelid of fs.readFileSync('forcechannels.txt', 'utf-8').split(/\n+/g)) {
	if (channelid == msg.channel.id) allowed = true;
    }
    if (allowed == false) return;
  }
  if (msg.author.bot) {
    for (channelid of fs.readFileSync('nobotchannels.txt', 'utf-8').split(/\n+/g)) {
	if (channelid == msg.channel.id) return;
    }
  }
  if (command === '^help') {
    msg.author.send('I need proper hosting, so do not expect perfect uptime. You should contact <@460075269563351040> and/or join https://discord.gg/4ag7tTs. Source code is available at `https://github.com/brmbrmcar/brmbrmbot/blob/master/bot.js`. Deprecated commands are displayed with [D] (a better alternative command use is available and/or this command may be removed in the future). More help is available from https://brmbrmcar.github.io/brmbrmbot.html.');
    msg.author.send("Commands \n`^help` Shows this dialogue (sends to direct messages) \n`^invite` Shows an invite for this bot \n`^convert [input] [amount]` Converts between decimal and imperial time units, use just `^convert help` for more information \n`^time` Shows decimal time in format `years`:`months`:`days` `hours`:`minutes`:`seconds` \n`^roleping [rolename]` [D] Shows the code needed to mention a role \n`^rolepingext [rolename] [guildID]` [D] Shows the code needed to mention a role in another guild \n`^rolelist {guildID}` Shows a list of all roles, with ping codes (optional guild ID for other guilds, sends to direct messages) \n`^everyone {guildID}` Shows how to mention everyone individually (optional guild ID for other guilds, sends to direct messages) \n`^everyonehide {guildID}` [D] Shows how to mention everyone individually like with `^everyone` but will show the pings by ID (sends to direct messages) \n`^message [userID/mention/tag] [message]` Allows the messaging of another user through a user ID (user must share a guild with the bot) (`\\{` and `\\}` get replaced by `<` and `>`) \n`^messageanon [userID/mention/tag] [message]` Allows the messaging of another user through a user ID anonymously \n`^say [channelID/mention] [message]` Allows the messaging of another channel through a channel ID (bot must be able to write messages to it) \n`^sayanon [channelID/mention] [message]` Allows the messaging of another channel through a channel ID anonymously \n`^saywebhook [channelID/mention] [message]` Allows the messaging of another channel through a channel ID using a webhook (the bot must be able to create webhooks in the output channel) \n`^messagein [messageID] {channelID/mention}` Shows the input of a message (optional channel ID for other channels) \n`^listguilds` [D] Lists all the guilds the bot is a member of (sends to direct messages) \n`^listchannels {guild ID}` Lists all the channels in a guild (optional guild ID for other guilds, sends to direct messages) \n`^inviteguild [guild ID]` **Attempts** to create an invite for a guild (the bot must be a member of the guild) \n`^invitechannel [channelID/mention]` **Attempts** to create an invite for a channel (the bot must be a member of the guild the channel is in) \n`^seen [userID/mention]` Shows what guilds, if any, the user shares with the bot \n`^spy [channelID/mention]` Shows some recent messages in a channel (the bot must be able to read messages in the channel, sends to direct messages) \n`^listemotes {guildID}` Lists all the emotes (emojis) in a guild (optional guild ID for other guilds) \n`^userinfo [userID/mention/tag]` Gets information of a user (currently specifying tag is only supported for cached users) \n`^roleinfo [roleID/mention]` Gets information of a role \n`^channelinfo {channelID/mention}` Gets information of a channel (optional channel ID for other channels, the bot must be in the guild the channel is in) \n`^guildinfo {guildID}` Gets information of a guild (optional guild ID for other guilds, the bot must be in the guild) \n`^guilduserinfo {guildID}` [D] Gets information of every user in a guild (will send a lot of direct messages, sends to direct messages, limited to 1000 members) \n`^listpermissions [userID/mention] {guildID}` Lists the permissions of a user in a guild (optional guild ID for other guilds) \n`^messagereply [key] [message]` Replies to a message sent anonymously through the key provided with the message (suggested command) \n`^messagereplyanon [key] [message]` Replies to a message sent anonymously through the key provided with the message anonymoulsy (suggested command but replace `^messsagereply` with `^messagereplyanon`) \n`^reverse [framerate] {mute}` Reverses an attatched video or image at a given framerate (in frames per imperial second) (if there is no audio, mute MUST be said after the frame rate or the command will fail, command may fail easily) \n`^finduser [searchterm]` Searches cached user IDs, tags and nicknames for a given search term (case insensitive, sends to direct messages) \n`^findguild [searchterm]` Searches guild IDs and names for a given search term (case insensitive) \n`^findchannel [searchterm]` Searches channel IDs and names for a given search term (case insensitive) \n`^findrole [searchterm]` Searches role IDs and names for a given search term (case insensitive) \n`^findemote [searchterm]` Searches emote IDs and names for a given search term (case insensitive) \n`^type [ID]` Sees whether an ID is for a guild, a channel, a role, an emote or a user (the bot must be able to fetch or see the ID for the command to work) \n`^listbans {guildID}` Lists all the banned users and reasons for the bans in a guild (the bot must be able to ban members in the guild, optional guild ID for other guilds) \n`^copybans [inguildID] {outguildID}` Copies banned users and reasons from one guild to another (the bot must be able to ban members in both guilds, user must have ban, admin or owner permissions in output guild, optional guild ID for other output guilds) \n`^crownstop {guildID}` Shows all roles that are preventing the owner's crown icon from showing (optional guild ID for other guilds) \n`^ping` Pings the bot \n`@someone` Mentions a guild member at random, similar to the command that existed on Discord at some point in time long ago \n`^ban {guildID} [userID/mention/tag] {reason}` Bans a user from a guild with an optional reason (the bot must be able to ban members in the guild, user must have ban, admin or owner permissions in the guild, currently specifying tag is only supported for cached users, optional guild ID for other guilds) \n`^baseconvert [number] [inputbase] [outputbase] {alphabet}` Converts the base of a number to another specified base 10 base between 2 and alphabet length (optional alphabet, take care with cases, default is `0123456789abcdefghijklmnopqrstuvwxyz`, recurring fraction parts should be surrounded with `(` and `)`, may send as text file attachment) \n`^rateguild {guildID}` Uses an open source algorithm to work out how well set up a guild is and give it a rating (optional guild ID for other guilds) \n`^embarrass {userID/mention/tag}` Replies with a webhook with an embarrassing statement looking similar to the user (optional user for other users, the bot must be able to create webhooks in the channel) \n`^cacheusers [userIDs/mentions]` Adds or updates users seperated by a space into the bots' cache until next reboot \n`^uptime` Shows information on long the bot has been online for \n`^rawuser [userID/mention/tag]` Shows the raw information of a user \n`^rawmember [guildID] [userID/mention/tag]` Shows the raw information of a guild member \n`^rawguild {guildID}` Shows the raw information of a guild (optional guild ID for other guilds, sends to direct messages) \n`^rawinvite [invitecode]` Shows the raw information of an invite \n`^rawchannel {channelID/mention}` Shows the raw information of a channel (optional channel ID/mention for other channels) \n`^rawmessage [messageID] {channelID/mention}` Shows the raw information of a message (optional channel ID/mention for other channels) \n`^rawemote [emoteID] {guildID}` Shows the raw information of an emote (optional guild ID for other guilds) \n`^rawwebhook [webhookID]` Shows the raw information of an undeleted webhook \n`^report [messageID]` Reports basic information to the bot's owner about a message sent through the bot \n`^toggleforce {channelID/mention}` Toggles the ability to use `.force` commands in a given channel (disabled by default, user must have manage roles permissions in the guild and manage channels permissions for the channel, optional channel for other channels) \n`^togglespy {channelID/mention}` Toggles the ability to spy on a given channel (allowed by default) \n`^togglenonprefix {channelID/mention}` Toggles the ability to use commands and reponses without the standard `^` prefix as a trigger in a given channel (can be used by default) \n`^togglebotuse {channelID/mention}` Toggles the ability for bot accounts to use commands in a given channel except in security cases (enabled by default) \n`^togglesayblock {channelID/mention}` Toggles the blocking of messages sent through the bot for a specific channel (not blocked by default) \n`^guildrankings` Ranks guilds based on their recordered results pre-tested with `^guildinfo` \n`^joinlogs [channelID/mention] [guildID] {message}` Sets a logging message for when a user joins a given guild in a given channel (run without a message to turn off, `{user}` `{user.mention}` `{user.id}` `{user.tag}` `{user.name}` `{user.discrim}` will be replaced by the user, `{guild}` `{guild.name}` `{guild.id}` will be replaced by the guild, requires manage channel permissions, administrator or owner in the channel) \n`^leavelogs [channelID/mention] [guildID] {message}` Sets a logging message for when a user leaves a given guild in a given channel \n`^banlogs [channelID/mention] [guildID] {message}` Sets a logging message for when a user is banned from a given guild in a given channel \n`^unbanlogs [channelID/mention] [guildID] {message}` Sets a logging message for when a user is unbanned from a given guild in a given channel \n`^autorole [guildID] [roleIDs/mentions] {reason}` Adds given roles every time a user (non-bot) joins a guild (the bot and the user must be able to manage roles in the guild) \n`^botautorole [guildID] [roleIDs/mentions] {reason}` Adds given roles every time a bot joins a guild (PARTIALLY BROKEN) \n`^convertf [numerator]/[denominator]` Converts a base 10 fraction into a decimal (has limits, may be imprecise, may send as text file attachment) \n`^convertd [number]` Converts a decimal into a simplified fraction (recurring fraction parts should be surrounded with `(` and `)`) \n`^exponent [number] [power]` Calculates the exponent of a number (may not respond if too large/complicated) \n`^selfroot [number]` Estimates for a specified number `x` when `number = x^x` (recurring fraction parts should be surrounded with `(` and `)`, will not recur if above `9007199254740991`) \n`^exponentr [number] [power]` Tests if an exponent is rational or otherwise (does not check whether answer is imaginary) \n`^addbotrole [roleID/mention/name] {guildID}` Toggles a role, or makes a new one, for a list of roles that can be added by members in a given guild (optional guild ID for other guilds, user must have manage roles permissions in the guild) \n`^addrolelist {guildID}` Shows the list of roles users may add for a given guild (optional guild ID for other guilds) \n`^addrole [roleID/mention/name]` Adds a given allowed role to the user (name may only be used within the same guild as the role) \n`^addreactionrole {channelID/mention} [messageID] [emote] [roleID/mention/name]` Toggles the ability of a guild member to add a role by reacting with a given emote on a given message (optional channel for other channels, user must have manage roles permissions in the guild) \n`^viewreactionroles [messageID]` Displays the roles that can be added by reacting to a given message and the emotes needed to do so \n`^addreactionrolemsg [messageID] [channelinID/mention] [channeloutID/mention/dm] [message]` Adds a message as confirmation whenever a user adds a role by reacting to a given message (user `dm` as the output channel to send to direct messages, use without message to reset to default message, `{user}` `{user.mention}` `{user.id}` `{user.tag}` `{user.name}` `{user.discrim}` will be replaced by the user, `{role}` `{role.mention}` `{role.name}` `{role.id}` will be replaced by the role, user must have manage roles permissions in the guild) \n", { split: true })
    if (msg.channel.type != "dm") msg.reply("Check your direct messages!");
  }
  if (command === '^help.force') { 
    msg.reply('I need proper hosting, so do not expect perfect uptime. You should contact <@460075269563351040> and/or join https://discord.gg/4ag7tTs. Source code is available at `https://github.com/brmbrmcar/brmbrmbot/blob/master/bot.js`. Deprecated commands are displayed with [D] (a better alternative command use is available and/or this command may be removed in the future). More help is available from https://brmbrmcar.github.io/brmbrmbot.html.');
    msg.reply("Commands \n`^help` Shows this dialogue (sends to direct messages) \n`^invite` Shows an invite for this bot \n`^convert [input] [amount]` Converts between decimal and imperial time units, use just `^convert help` for more information \n`^time` Shows decimal time in format `years`:`months`:`days` `hours`:`minutes`:`seconds` \n`^roleping [rolename]` [D] Shows the code needed to mention a role \n`^rolepingext [rolename] [guildID]` [D] Shows the code needed to mention a role in another guild \n`^rolelist {guildID}` Shows a list of all roles, with ping codes (optional guild ID for other guilds, sends to direct messages) \n`^everyone {guildID}` Shows how to mention everyone individually (optional guild ID for other guilds, sends to direct messages) \n`^everyonehide {guildID}` [D] Shows how to mention everyone individually like with `^everyone` but will show the pings by ID (sends to direct messages) \n`^message [userID/mention/tag] [message]` Allows the messaging of another user through a user ID (user must share a guild with the bot) (`\\{` and `\\}` get replaced by `<` and `>`) \n`^messageanon [userID/mention/tag] [message]` Allows the messaging of another user through a user ID anonymously \n`^say [channelID/mention] [message]` Allows the messaging of another channel through a channel ID (bot must be able to write messages to it) \n`^sayanon [channelID/mention] [message]` Allows the messaging of another channel through a channel ID anonymously \n`^saywebhook [channelID/mention] [message]` Allows the messaging of another channel through a channel ID using a webhook (the bot must be able to create webhooks in the output channel) \n`^messagein [messageID] {channelID/mention}` Shows the input of a message (optional channel ID for other channels) \n`^listguilds` [D] Lists all the guilds the bot is a member of (sends to direct messages) \n`^listchannels {guild ID}` Lists all the channels in a guild (optional guild ID for other guilds, sends to direct messages) \n`^inviteguild [guild ID]` **Attempts** to create an invite for a guild (the bot must be a member of the guild) \n`^invitechannel [channelID/mention]` **Attempts** to create an invite for a channel (the bot must be a member of the guild the channel is in) \n`^seen [userID/mention]` Shows what guilds, if any, the user shares with the bot \n`^spy [channelID/mention]` Shows some recent messages in a channel (the bot must be able to read messages in the channel, sends to direct messages) \n`^listemotes {guildID}` Lists all the emotes (emojis) in a guild (optional guild ID for other guilds) \n`^userinfo [userID/mention/tag]` Gets information of a user (currently specifying tag is only supported for cached users) \n`^roleinfo [roleID/mention]` Gets information of a role \n`^channelinfo {channelID/mention}` Gets information of a channel (optional channel ID for other channels, the bot must be in the guild the channel is in) \n`^guildinfo {guildID}` Gets information of a guild (optional guild ID for other guilds, the bot must be in the guild) \n`^guilduserinfo {guildID}` [D] Gets information of every user in a guild (will send a lot of direct messages, sends to direct messages, limited to 1000 members) \n`^listpermissions [userID/mention] {guildID}` Lists the permissions of a user in a guild (optional guild ID for other guilds) \n`^messagereply [key] [message]` Replies to a message sent anonymously through the key provided with the message (suggested command) \n`^messagereplyanon [key] [message]` Replies to a message sent anonymously through the key provided with the message anonymoulsy (suggested command but replace `^messsagereply` with `^messagereplyanon`) \n`^reverse [framerate] {mute}` Reverses an attatched video or image at a given framerate (in frames per imperial second) (if there is no audio, mute MUST be said after the frame rate or the command will fail, command may fail easily) \n`^finduser [searchterm]` Searches cached user IDs, tags and nicknames for a given search term (case insensitive, sends to direct messages) \n`^findguild [searchterm]` Searches guild IDs and names for a given search term (case insensitive) \n`^findchannel [searchterm]` Searches channel IDs and names for a given search term (case insensitive) \n`^findrole [searchterm]` Searches role IDs and names for a given search term (case insensitive) \n`^findemote [searchterm]` Searches emote IDs and names for a given search term (case insensitive) \n`^type [ID]` Sees whether an ID is for a guild, a channel, a role, an emote or a user (the bot must be able to fetch or see the ID for the command to work) \n`^listbans {guildID}` Lists all the banned users and reasons for the bans in a guild (the bot must be able to ban members in the guild, optional guild ID for other guilds) \n`^copybans [inguildID] {outguildID}` Copies banned users and reasons from one guild to another (the bot must be able to ban members in both guilds, user must have ban, admin or owner permissions in output guild, optional guild ID for other output guilds) \n`^crownstop {guildID}` Shows all roles that are preventing the owner's crown icon from showing (optional guild ID for other guilds) \n`^ping` Pings the bot \n`@someone` Mentions a guild member at random, similar to the command that existed on Discord at some point in time long ago \n`^ban {guildID} [userID/mention/tag] {reason}` Bans a user from a guild with an optional reason (the bot must be able to ban members in the guild, user must have ban, admin or owner permissions in the guild, currently specifying tag is only supported for cached users, optional guild ID for other guilds) \n`^baseconvert [number] [inputbase] [outputbase] {alphabet}` Converts the base of a number to another specified base 10 base between 2 and alphabet length (optional alphabet, take care with cases, default is `0123456789abcdefghijklmnopqrstuvwxyz`, recurring fraction parts should be surrounded with `(` and `)`, may send as text file attachment) \n`^rateguild {guildID}` Uses an open source algorithm to work out how well set up a guild is and give it a rating (optional guild ID for other guilds) \n`^embarrass {userID/mention/tag}` Replies with a webhook with an embarrassing statement looking similar to the user (optional user for other users, the bot must be able to create webhooks in the channel) \n`^cacheusers [userIDs/mentions]` Adds or updates users seperated by a space into the bots' cache until next reboot \n`^uptime` Shows information on long the bot has been online for \n`^rawuser [userID/mention/tag]` Shows the raw information of a user \n`^rawmember [guildID] [userID/mention/tag]` Shows the raw information of a guild member \n`^rawguild {guildID}` Shows the raw information of a guild (optional guild ID for other guilds, sends to direct messages) \n`^rawinvite [invitecode]` Shows the raw information of an invite \n`^rawchannel {channelID/mention}` Shows the raw information of a channel (optional channel ID/mention for other channels) \n`^rawmessage [messageID] {channelID/mention}` Shows the raw information of a message (optional channel ID/mention for other channels) \n`^rawemote [emoteID] {guildID}` Shows the raw information of an emote (optional guild ID for other guilds) \n`^rawwebhook [webhookID]` Shows the raw information of an undeleted webhook \n`^report [messageID]` Reports basic information to the bot's owner about a message sent through the bot \n`^toggleforce {channelID/mention}` Toggles the ability to use `.force` commands in a given channel (disabled by default, user must have manage roles permissions in the guild and manage channels permissions for the channel, optional channel for other channels) \n`^togglespy {channelID/mention}` Toggles the ability to spy on a given channel (allowed by default) \n`^togglenonprefix {channelID/mention}` Toggles the ability to use commands and reponses without the standard `^` prefix as a trigger in a given channel (can be used by default) \n`^togglebotuse {channelID/mention}` Toggles the ability for bot accounts to use commands in a given channel except in security cases (enabled by default) \n`^togglesayblock {channelID/mention}` Toggles the blocking of messages sent through the bot for a specific channel (not blocked by default) \n`^guildrankings` Ranks guilds based on their recordered results pre-tested with `^guildinfo` \n`^joinlogs [channelID/mention] [guildID] {message}` Sets a logging message for when a user joins a given guild in a given channel (run without a message to turn off, `{user}` `{user.mention}` `{user.id}` `{user.tag}` `{user.name}` `{user.discrim}` will be replaced by the user, `{guild}` `{guild.name}` `{guild.id}` will be replaced by the guild, requires manage channel permissions, administrator or owner in the channel) \n`^leavelogs [channelID/mention] [guildID] {message}` Sets a logging message for when a user leaves a given guild in a given channel \n`^banlogs [channelID/mention] [guildID] {message}` Sets a logging message for when a user is banned from a given guild in a given channel \n`^unbanlogs [channelID/mention] [guildID] {message}` Sets a logging message for when a user is unbanned from a given guild in a given channel \n`^autorole [guildID] [roleIDs/mentions] {reason}` Adds given roles every time a user (non-bot) joins a guild (the bot and the user must be able to manage roles in the guild) \n`^botautorole [guildID] [roleIDs/mentions] {reason}` Adds given roles every time a bot joins a guild (PARTIALLY BROKEN) \n`^convertf [numerator]/[denominator]` Converts a base 10 fraction into a decimal (has limits, may be imprecise, may send as text file attachment) \n`^convertd [number]` Converts a decimal into a simplified fraction (recurring fraction parts should be surrounded with `(` and `)`) \n`^exponent [number] [power]` Calculates the exponent of a number (may not respond if too large/complicated) \n`^selfroot [number]` Estimates for a specified number `x` when `number = x^x` (recurring fraction parts should be surrounded with `(` and `)`, will not recur if above `9007199254740991`) \n`^exponentr [number] [power]` Tests if an exponent is rational or otherwise (does not check whether answer is imaginary) \n`^exponentr [number] [power]` Tests if an exponent is rational or otherwise (does not test whether answer is imaginary) \n`^addbotrole [roleID/mention/name] {guildID}` Toggles a role, or makes a new one, for a list of roles that can be added by members in a given guild (optional guild ID for other guilds, user must have manage roles permissions in the guild) \n`^addrolelist {guildID}` Shows the list of roles users may add for a given guild (optional guild ID for other guilds) \n`^addrole [roleID/mention/name]` Adds a given allowed role to the user (name may only be used within the same guild as the role) \n`^addreactionrole {channelID/mention} [messageID] [emote] [roleID/mention/name]` Toggles the ability of a guild member to add a role by reacting with a given emote on a given message (optional channel for other channels, user must have manage roles permissions in the guild) \n`^viewreactionroles [messageID]` Displays the roles that can be added by reacting to a given message and the emotes needed to do so \n`^addreactionrolemsg [messageID] [channelinID/mention] [channeloutID/mention/dm] [message]` Adds a message as confirmation whenever a user adds a role by reacting to a given message (user `dm` as the output channel to send to direct messages, use without message to reset to default message, `{user}` `{user.mention}` `{user.id}` `{user.tag}` `{user.name}` `{user.discrim}` will be replaced by the user, `{role}` `{role.mention}` `{role.name}` `{role.id}` will be replaced by the role, user must have manage roles permissions in the guild) \n", { split: true })
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
	out = amount > 9007199254740991  ? BigNumber(amount).times('0.864') : Fraction(amount).mul('0.864')
	msg.reply(out.toString());
    }
    if (type === "imps"){
	out = amount > 9007199254740991 ? BigNumber(amount).div('0.864') : Fraction(amount).div('0.864')
	msg.reply(out.toString());
    }
    if (type === "decm"){
	out = amount > 9007199254740991 ? BigNumber(amount).times('1.44') : Fraction(amount).mul('1.44')
	msg.reply(out.toString());
    }
    if (type === "impm"){
	out = amount > 9007199254740991 ? BigNumber(amount).div('1.44') : Fraction(amount).div('1.44')
	msg.reply(out.toString());
    }
    if (type === "dech"){
	out = amount > 9007199254740991 ? BigNumber(amount).times('2.4') : Fraction(amount).mul('2.4')
	msg.reply(out.toString());
    }
    if (type === "imph"){
	out = amount > 9007199254740991 ? BigNumber(amount).div('2.4') : Fraction(amount).div('2.4')
	msg.reply(out.toString());
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
    if (type === "idutc"){
    if (!args[1]) return
    msg.reply(new Date(Snowflake.deconstruct(amount).timestamp).toGMTString());
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
	msg.reply("`^convert [input] [amount]` Converts between decimal and imperial time units.\nInputs \n`decs` Converts decimal seconds into imperial seconds \n`imps` Converts imperial seconds into decimal seconds \n`decm` Converts decimal minutes into imperial minutes \n`impm` Converts imperial minutes into decimal minutes \n`dech` Converts decimal hours into imperial seconds \n`imph` Converts imperial hours into decimal hours \n`unix` Converts unix time milliseconds into decimal time \n`unixs` Converts unix time seconds into decimal time \n`utc` Converts Universal Coordinated Time into decimal time \n`decu` Converts decimal time with milliseconds into unix time (please provide full padding; `^convert decu 0/0/0 0:01:01:001` not `^convert decu 0/0/0 0:1:1:1`) \n`decsu` Converts decimal time without milliseconds into unix time \n`decutc` Converts decimal time with milliseconds into Universal Coordinated Time (may show as GMT in response) \n`decsutc` Converts decimal time without milliseconds into Universal Coordinated Time \n`id` Finds the decimal time of a Discord ID \n`idutc` Finds the Universal Coordinated Time of a Discord ID \n`decid` Converts decimal time with milliseconds into a Discord ID \n`decsid` Converts decimal time without milliseconds into a Discord ID");
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
	for (role of msg.guild._sortedRoles){
        roles = roles + "`<@&" + role[1].id + "> `" + role[1].name + "\n"
	}
    }
    else{
	for (role of client.guilds.get(guilde)._sortedRoles){
            roles = roles + "`<@&" + role[1].id + "> `" + role[1].name + "\n"
    }}
    msg.author.send(roles, { split: true });
    if (msg.channel.type != "dm") msg.reply("Check your direct messages!");
}
  if (command === '^rolelist.force') {
    let guilde = args[0]
    roles = ''
    if (!client.guilds.get(guilde)){
        if (!msg.guild) return;
	for (role of msg.guild._sortedRoles){
        roles = roles + "`<@&" + role[1].id + "> `" + role[1].name + "\n"
	}
    }
    else{
	for (role of client.guilds.get(guilde)._sortedRoles){
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
    if (msg.channel.type != "dm") msg.reply("Check your direct messages!")
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
    if (msg.channel.type != "dm") msg.reply("Check your direct messages!")
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
    hassafety = false
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
    msg.channel.startTyping(1)
    for (channel of fs.readFileSync('hassafety.txt', 'utf-8').split(/\n+/g)) {
	if (usersend.replace(/\D/g,'') == channel) hassafety = true
    }
    safetymsg = "Hey! Looks like this was the first message I\'ve sent you like this! These messages can be sent through direct messages, public channels or through little bots called webhooks that look like the author! Just going to have give you some information:\nUnless it says it was from the owner of me or anyone who helped create me, they had nothing to do with what I send you like this.\nPlease be aware of the dangers of clicking or loading any links sent, they may look genuine but can often be used by certain individuals to get a lot of information about you that you probably won\'t want them to have! Attachments could also be filled with nasty malware! Again the owners of this bot are not responsible for this.\nRemember that people can fake accounts and identities, if the message is not sent anonymously, it is worth just checking the profile to make sure they are what their name says they are!\nIf someone is doing any of those things, being mean to you, harassing you, or anything else considered unnacceptable, please use `^report [messageID]` replacing `[messageID]` with the ID of the message I sent you! There are great tutorials out there on how to get the message ID, and you can add additional messages or ask for assistance by messaging my owner by using `^message brmbrmcar#1057 [message]`! With this, we can help identify and check for any present bad links or attachments, or if it's going to violate Discord\'s terms of service, help you make a report to Trust and Safety about it!\nPlease have fun with me, because I love you infinitely! You can use `^help` for help with me or even visit https://brmbrmcar.github.io/brmbrmbot.html for more information about me! Stay safe! ❤️🤗❤️"
    let content = msg.content.replace("^message ", "").replace(toreplace, "").replace(new RegExp("\\\\{", "g"), "<").replace(new RegExp("\\\\}", "g"), ">")
    let Attachment = (msg.attachments).array();
    let links = ""
    Attachment.forEach(function(attachment) {
    links = attachment.url
    })
    if (msg.author.bot){
    client.users.get(usersend.replace(/\D/g,'')).send(content + `\nMessage sent by someone messing around a little too much. ` , {file: links}).then(idk => {
msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.users.get(usersend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', usersend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata, function (err) {
   if (err) return console.log(err);
   console.log('Appended!');
});
}).catch(err =>{ console.error(err);   msg.reply(err.toString());   msg.channel.stopTyping(true);})
    }
    else {
    client.users.get(usersend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}>. ` , {file: links}).then(idk => {
msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.users.get(usersend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', usersend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err);  msg.reply(err.toString()); msg.channel.stopTyping(true);}) 
    }
  }
  if (command === '^messageanon') {
    if (!args[0]) return;
    hassafety = false
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
    msg.channel.startTyping(1)
    for (channel of fs.readFileSync('hassafety.txt', 'utf-8').split(/\n+/g)) {
	if (usersend.replace(/\D/g,'') == channel) hassafety = true
    }
    safetymsg = "Hey! Looks like this was the first message I\'ve sent you like this! These messages can be sent through direct messages, public channels or through little bots called webhooks that look like the author! Just going to have give you some information:\nUnless it says it was from the owner of me or anyone who helped create me, they had nothing to do with what I send you like this.\nPlease be aware of the dangers of clicking or loading any links sent, they may look genuine but can often be used by certain individuals to get a lot of information about you that you probably won\'t want them to have! Attachments could also be filled with nasty malware! Again the owners of this bot are not responsible for this.\nRemember that people can fake accounts and identities, if the message is not sent anonymously, it is worth just checking the profile to make sure they are what their name says they are!\nIf someone is doing any of those things, being mean to you, harassing you, or anything else considered unnacceptable, please use `^report [messageID]` replacing `[messageID]` with the ID of the message I sent you! There are great tutorials out there on how to get the message ID, and you can add additional messages or ask for assistance by messaging my owner by using `^message brmbrmcar#1057 [message]`! With this, we can help identify and check for any present bad links or attachments, or if it's going to violate Discord\'s terms of service, help you make a report to Trust and Safety about it!\nPlease have fun with me, because I love you infinitely! You can use `^help` for help with me or even visit https://brmbrmcar.github.io/brmbrmbot.html for more information about me! Stay safe! ❤️🤗❤️"
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
    client.users.get(usersend.replace(/\D/g,'')).send(content + "\nMessage sent by an anonymous user. To reply please run `^messagereply " + encrypted + " [message]`.", {file: links}).then(idk => {
msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.users.get(usersend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', usersend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); idk = err.toString(); msg.channel.stopTyping(true);})
  }
  if (command === '^messagereply') {
    if (!args[0]) return;
    hassafety = false
    let usersend1 = CryptoJS.AES.decrypt(args[0], encryptkey)
    let usersend2 = usersend1.toString(CryptoJS.enc.Utf8);
    let usersend = usersend2.slice(0, -20);
    if (!client.users.get(usersend.replace(/\D/g,''))) return;
    msg.channel.startTyping(1)
    for (channel of fs.readFileSync('hassafety.txt', 'utf-8').split(/\n+/g)) {
	if (usersend.replace(/\D/g,'') == channel) hassafety = true
    }
    safetymsg = "Hey! Looks like this was the first message I\'ve sent you like this! These messages can be sent through direct messages, public channels or through little bots called webhooks that look like the author! Just going to have give you some information:\nUnless it says it was from the owner of me or anyone who helped create me, they had nothing to do with what I send you like this.\nPlease be aware of the dangers of clicking or loading any links sent, they may look genuine but can often be used by certain individuals to get a lot of information about you that you probably won\'t want them to have! Attachments could also be filled with nasty malware! Again the owners of this bot are not responsible for this.\nRemember that people can fake accounts and identities, if the message is not sent anonymously, it is worth just checking the profile to make sure they are what their name says they are!\nIf someone is doing any of those things, being mean to you, harassing you, or anything else considered unnacceptable, please use `^report [messageID]` replacing `[messageID]` with the ID of the message I sent you! There are great tutorials out there on how to get the message ID, and you can add additional messages or ask for assistance by messaging my owner by using `^message brmbrmcar#1057 [message]`! With this, we can help identify and check for any present bad links or attachments, or if it's going to violate Discord\'s terms of service, help you make a report to Trust and Safety about it!\nPlease have fun with me, because I love you infinitely! You can use `^help` for help with me or even visit https://brmbrmcar.github.io/brmbrmbot.html for more information about me! Stay safe! ❤️🤗❤️"
    let content = msg.content.replace("^messagereply ", "").replace(args[0], "").replace(new RegExp("\\\\{", "g"), "<").replace(new RegExp("\\\\}", "g"), ">")
    let Attachment = (msg.attachments).array();
    let links = ""
    Attachment.forEach(function(attachment) {
    links = attachment.url
    })
    if (msg.author.bot){
    client.users.get(usersend.replace(/\D/g,'')).send(content + `\nMessage sent by someone messing around a little too much.`, {file: links}).then(idk => {msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.users.get(usersend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', usersend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err);   msg.reply(err.toString()); msg.channel.stopTyping(true);})
    }
    else {
    client.users.get(usersend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}>.`, {file: links}).then(idk => {
msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.users.get(usersend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', usersend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err);  msg.reply(err.toString()); msg.channel.stopTyping(true);}) 
    }
  }
  if (command === '^messagereplyanon') {
    if (!args[0]) return;
    hassafety = false
    let usersend1 = CryptoJS.AES.decrypt(args[0], encryptkey)
    let usersend2 = usersend1.toString(CryptoJS.enc.Utf8);
    let usersend = usersend2.slice(0, -20);
    if (!client.users.get(usersend.replace(/\D/g,''))) return;
    msg.channel.startTyping(1)
    for (channel of fs.readFileSync('hassafety.txt', 'utf-8').split(/\n+/g)) {
	if (usersend.replace(/\D/g,'') == channel) hassafety = true
    }
    safetymsg = "Hey! Looks like this was the first message I\'ve sent you like this! These messages can be sent through direct messages, public channels or through little bots called webhooks that look like the author! Just going to have give you some information:\nUnless it says it was from the owner of me or anyone who helped create me, they had nothing to do with what I send you like this.\nPlease be aware of the dangers of clicking or loading any links sent, they may look genuine but can often be used by certain individuals to get a lot of information about you that you probably won\'t want them to have! Attachments could also be filled with nasty malware! Again the owners of this bot are not responsible for this.\nRemember that people can fake accounts and identities, if the message is not sent anonymously, it is worth just checking the profile to make sure they are what their name says they are!\nIf someone is doing any of those things, being mean to you, harassing you, or anything else considered unnacceptable, please use `^report [messageID]` replacing `[messageID]` with the ID of the message I sent you! There are great tutorials out there on how to get the message ID, and you can add additional messages or ask for assistance by messaging my owner by using `^message brmbrmcar#1057 [message]`! With this, we can help identify and check for any present bad links or attachments, or if it's going to violate Discord\'s terms of service, help you make a report to Trust and Safety about it!\nPlease have fun with me, because I love you infinitely! You can use `^help` for help with me or even visit https://brmbrmcar.github.io/brmbrmbot.html for more information about me! Stay safe! ❤️🤗❤️"
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
    client.users.get(usersend.replace(/\D/g,'')).send(content + "\nMessage sent by an anonymous user. To reply please run `^messagereply " + encrypted + " [message]`.", {file: links}).then(idk => {msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.users.get(usersend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', usersend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); idk = err.toString(); msg.channel.stopTyping(true);})
  }
  if (command === '^say') {
    if (!args[0]) return;
    let channelsend = args[0]
    hassafety = false
    let channelsendrep = channelsend.replace(/\D/g,'')
    if (!client.channels.get(channelsendrep)) return;
    if (client.channels.get(channelsendrep).type != "text") return;
    for (channel1d of fs.readFileSync('nosaychannels.txt', 'utf-8').split(/\n+/g)) {
	if (channel1d == channelsendrep) return;
    }
    if (channelsendrep == 496014515725402112){
	msg.reply("You know only I'm allowed to speak there! It's ok, I still love you, I'm just joking. But no.") // unnecessary but too nice to remove
	return;
    }
    msg.channel.startTyping(1)
    for (channel of fs.readFileSync('hassafety.txt', 'utf-8').split(/\n+/g)) {
	if (channelsend.replace(/\D/g,'') == channel) hassafety = true
    }
    safetymsg = "Hey! Looks like this was the first message I\'ve sent this channel like this! These messages can be sent through direct messages, public channels or through little bots called webhooks that look like the author! Just going to have give you some information:\nUnless it says it was from the owner of me or anyone who helped create me, they had nothing to do with what I send you like this.\nPlease be aware of the dangers of clicking or loading any links sent, they may look genuine but can often be used by certain individuals to get a lot of information about you that you probably won\'t want them to have! Attachments could also be filled with nasty malware! Again the owners of this bot are not responsible for this.\nRemember that people can fake accounts and identities, if the message is not sent anonymously, it is worth just checking the profile to make sure they are what their name says they are!\nIf someone is doing any of those things, being mean to you, harassing you, or anything else considered unnacceptable, please use `^report [messageID]` replacing `[messageID]` with the ID of the message I sent you! There are great tutorials out there on how to get the message ID, and you can add additional messages or ask for assistance by messaging my owner by using `^message brmbrmcar#1057 [message]`! With this, we can help identify and check for any present bad links or attachments, or if it's going to violate Discord\'s terms of service, help you make a report to Trust and Safety about it!\nPlease have fun with me, because I love you infinitely! You can use `^help` for help with me or even visit https://brmbrmcar.github.io/brmbrmbot.html for more information about me! Stay safe! ❤️🤗❤️"
    let content = msg.content.replace("^say ", "").replace(channelsend, "").replace(new RegExp("\\\\{", "g"), "<").replace(new RegExp("\\\\}", "g"), ">")
    let Attachment = (msg.attachments).array();
    let links = ""
    Attachment.forEach(function(attachment) {
    links = attachment.url
    })
    if (!msg.guild) {
        if(msg.author.bot){
	client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by someone messing around a little too much.`, {file: links}).then(idk => {msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.channels.get(channelsend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', channelsend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); msg.channel.stopTyping(true);})}
        else {
	client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}>.`, {file: links}).then(idk => {msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.channels.get(channelsend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', channelsend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); msg.channel.stopTyping(true);})
        }
    } else {
        if(msg.author.bot){
	client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by someone messing around a little too much.`, {file: links}).then(idk => {msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.channels.get(channelsend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', channelsend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); msg.channel.stopTyping(true);}) 
       }
       else {
	client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}> from ${msg.guild.name} (${msg.guild.id}).`, {file: links}).then(idk => {msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.channels.get(channelsend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', channelsend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); msg.channel.stopTyping(true);})
       }

}
  }
  if (command === '^sayanon') {
    if (!args[0]) return;
    let channelsend = args[0]
    hassafety = false
    let channelsendrep = channelsend.replace(/\D/g,'')
    if (!client.channels.get(channelsendrep)) return;
    if (client.channels.get(channelsendrep).type != "text") return;
    for (channel1d of fs.readFileSync('nosaychannels.txt', 'utf-8').split(/\n+/g)) {
	if (channel1d == channelsendrep) return;
    }
    if (channelsendrep == 496014515725402112){
	msg.reply("You know only I'm allowed to speak there! It's ok, I still love you, I'm just joking. But no.")
	return;
    }
    msg.channel.startTyping(1)
    for (channel of fs.readFileSync('hassafety.txt', 'utf-8').split(/\n+/g)) {
	if (channelsend.replace(/\D/g,'') == channel) hassafety = true
    }
    safetymsg = "Hey! Looks like this was the first message I\'ve sent this channel like this! These messages can be sent through direct messages, public channels or through little bots called webhooks that look like the author! Just going to have give you some information:\nUnless it says it was from the owner of me or anyone who helped create me, they had nothing to do with what I send you like this.\nPlease be aware of the dangers of clicking or loading any links sent, they may look genuine but can often be used by certain individuals to get a lot of information about you that you probably won\'t want them to have! Attachments could also be filled with nasty malware! Again the owners of this bot are not responsible for this.\nRemember that people can fake accounts and identities, if the message is not sent anonymously, it is worth just checking the profile to make sure they are what their name says they are!\nIf someone is doing any of those things, being mean to you, harassing you, or anything else considered unnacceptable, please use `^report [messageID]` replacing `[messageID]` with the ID of the message I sent you! There are great tutorials out there on how to get the message ID, and you can add additional messages or ask for assistance by messaging my owner by using `^message brmbrmcar#1057 [message]`! With this, we can help identify and check for any present bad links or attachments, or if it's going to violate Discord\'s terms of service, help you make a report to Trust and Safety about it!\nPlease have fun with me, because I love you infinitely! You can use `^help` for help with me or even visit https://brmbrmcar.github.io/brmbrmbot.html for more information about me! Stay safe! ❤️🤗❤️"
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
    client.channels.get(channelsend.replace(/\D/g,'')).send(content + "\nMessage sent by an anonymous user. (Sender key `" + encrypted + "`)", {file: links}).then(idk => {msg.reply("Message sent successfully!")
if (hassafety == false) {
  client.channels.get(channelsend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', channelsend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); msg.channel.stopTyping(true);})
  }
  if (command === '^saywebhook') {
    if (!args[0]) return;
    let channelsend = args[0]
    hassafety = false
    let channelsendrep = channelsend.replace(/\D/g,'')
    if (!client.channels.get(channelsendrep)) return;
    if (client.channels.get(channelsendrep).type != "text") return;
    for (channel1d of fs.readFileSync('nosaychannels.txt', 'utf-8').split(/\n+/g)) {
	if (channel1d == channelsendrep) return;
    }
    if (channelsendrep == 496014515725402112){
	msg.reply("You know only I'm allowed to speak there! It's ok, I still love you, I'm just joking. But no.")
	return;
    }
    msg.channel.startTyping(1)
    for (channel of fs.readFileSync('hassafety.txt', 'utf-8').split(/\n+/g)) {
	if (channelsend.replace(/\D/g,'') == channel) hassafety = true
    }
    safetymsg = "Hey! Looks like this was the first message I\'ve sent this channel like this! I made a little bot called a webhook to look like the person who sent the message! These messages can be sent through direct messages, public channels or through webhooks that look like the author! Just going to have give you some information:\nUnless it says it was from the owner of me or anyone who helped create me, they had nothing to do with what I send you like this.\nPlease be aware of the dangers of clicking or loading any links sent, they may look genuine but can often be used by certain individuals to get a lot of information about you that you probably won\'t want them to have! Attachments could also be filled with nasty malware! Again the owners of this bot are not responsible for this.\nRemember that people can fake accounts and identities, if the message is not sent anonymously, it is worth just checking the profile to make sure they are what their name says they are!\nIf someone is doing any of those things, being mean to you, harassing you, or anything else considered unnacceptable, please use `^report [messageID]` replacing `[messageID]` with the ID of the message I sent you! There are great tutorials out there on how to get the message ID, and you can add additional messages or ask for assistance by messaging my owner by using `^message brmbrmcar#1057 [message]`! With this, we can help identify and check for any present bad links or attachments, or if it's going to violate Discord\'s terms of service, help you make a report to Trust and Safety about it!\nPlease have fun with me, because I love you infinitely! You can use `^help` for help with me or even visit https://brmbrmcar.github.io/brmbrmbot.html for more information about me! Stay safe! ❤️🤗❤️"
    let content = msg.content.replace("^saywebhook ", "").replace(channelsend, "").replace(new RegExp("\\\\{", "g"), "<").replace(new RegExp("\\\\}", "g"), ">")
    sendername = msg.author.username;
    if (client.channels.get(channelsendrep).guild.members.get(msg.author.id)) sendername = client.channels.get(channelsendrep).guild.members.get(msg.author.id).nickname ? client.channels.get(channelsendrep).guild.members.get(msg.author.id).nickname : sendername;
    client.channels.get(channelsend.replace(/\D/g,'')).createWebhook(sendername, msg.author.displayAvatarURL.toString()).then(webhook => {
    webhook.send(content).then(idk => {msg.reply("Message sent successfully!");
if (hassafety == false) {
  client.channels.get(channelsend.replace(/\D/g,'')).send(safetymsg);
  fs.appendFileSync('hassafety.txt', channelsend.replace(/\D/g,'') + "\n")
}
msg.channel.stopTyping(true);
webhook.delete("It will never be needed again.")
encrypteddata = CryptoJS.AES.encrypt(idk.channel.id + "#" + idk.id + "#" + msg.channel.id + "#" + msg.id, idk.id)
fs.appendFile('./messagedata.txt', encrypteddata + "\n", function (err) {
   if (err) return console.log(err);
});
}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); msg.channel.stopTyping(true);})}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); msg.channel.stopTyping(true);})
  }
  if (command === '^messagein') {
    let msgid = args[0]
    if (!args[0]) return;
    let msginfo = ""
    if (args[1]){
	if(!client.channels.get(args[1].replace(/\D/g,''))) return;
	if(!client.channels.get(args[1].replace(/\D/g,'')).fetchMessage) return;
	client.channels.get(args[1].replace(/\D/g,'')).fetchMessage(msgid).then(message => { 
	   msginfo = message.channel ? msginfo + "Sent in: " + message.channel.toString() + "/" + message.channel.id + "/" + message.channel.name + ". " : msginfo
	   msginfo = message.author ? msginfo + "Sent by: " + message.author.toString() + "/" + message.author.id + "/" + message.author.tag + "." : msginfo
	   msg.reply('```' + message.content + '```');
	   msg.reply(msginfo) 
	}).catch(err => {
	   msg.reply(err.toString())
	})
    }
    else {
	msg.channel.fetchMessage(msgid).then(message => { 
	   msginfo = message.channel ? msginfo + "Sent in: " + message.channel.toString() + "/" + message.channel.id + "/" + message.channel.name + ". " : msginfo
	   msginfo = message.author ? msginfo + "Sent by: " + message.author.toString() + "/" + message.author.id + "/" + message.author.tag + "." : msginfo
	   msg.reply('```' + message.content + '```');
	   msg.reply(msginfo) 
	}).catch(err => {
	msg.reply("The message was not found in this channel. Please specify a channel if you can, if you cannot but you really need to find the message, run `^messagein.force " + args[0] + "`, but please only use this if absolutely necessary as it can be considered application programming interface abuse to do so.\nThe error: " + err.toString())
    })}
  }
  if (command === '^messagein.force') {
    let msgid = args[0]
    if (!args[0]) return;
    let msginfo = ""
    for (channel of client.channels){
        if (client.channels.get(channel[1].id).type !== "voice") {
        if (client.channels.get(channel[1].id).type !== "category"){
	client.channels.get(channel[1].id).fetchMessage(msgid).then(message => {
	   msginfo = message.channel ? msginfo + "Sent in: " + message.channel.toString() + "/" + message.channel.id + "/" + message.channel.name + ". " : msginfo
	   msginfo = message.author ? msginfo + "Sent by: " + message.author.toString() + "/" + message.author.id + "/" + message.author.tag + "." : msginfo
	   msg.reply('```' + message.content + '```')
	   msg.reply(msginfo) 
	}).catch(err => {})}}
    }
  }
  if (command === '^listguilds') {
      guildlist = "\n"
      for (guild of client.guilds){
        guildlist = guildlist + "`" + guild[1].id + "` " + guild[1].name + "\n"
      }
    if (msg.channel.type != "dm") msg.reply("Check your direct messages!");
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
    if (msg.channel.type != "dm") msg.reply("Check your direct messages!");   
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
    if (!client.guilds.get(guildid).me) return;
    if (!client.guilds.get(guildid).channels.find(c => c.type !== "category" && c.permissionsFor(client.guilds.get(guildid).me).has("CREATE_INSTANT_INVITE", true))) {
	msg.reply("I don't have the permissions to create invites for any channel 😭. Please hug me better......")
	return;
    }
    let invchannel = client.guilds.get(guildid).channels.find(c => c.type !== "category" && c.permissionsFor(client.guilds.get(guildid).me).has("CREATE_INSTANT_INVITE", true)).id;
    //channelid = channel[1].id;
    client.channels.get(invchannel).createInvite({maxAge:0}).then(invite =>
    msg.channel.send(invite.url)
);
  }
  if (command === '^invitechannel') {
    if (!args[0]) return;
    let channelid = args[0].replace(/\D/g,'')
    if (!client.channels.get(channelid)) return;
    if (!client.channels.get(channelid).createInvite) return;
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
    bot = false
    if (client.users.get(userseenid)) {
    if (client.users.get(userseenid).bot) bot = true
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
      if (!bot) msg.reply(seenlist, { split: true })
      if (bot) {
	msg.author.send(seenlist, { split: true })
	if (msg.channel.type != "dm") msg.reply("Check your direct messages!")
      }
  }
  if (command === '^seen.force') {
      if (!args[0]) return;
      let userseenid = args[0].replace(/\D/g,'')
    if(client.users.find(user => user.tag === msg.content.replace('^seen.force ',''))){
	 userseenid = client.users.find(user => user.tag === msg.content.replace('^seen.force ','')).id
    }
    if (client.users.get(userseenid)) {
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
      msg.reply(seenlist, { split: true }) }
  }
  if (command === '^endianswap') { // secret command because I simply don't want to have to deal with it
    swapped = ""
    for (arg of args){
	swapped = arg + ' ' + swapped }
    msg.reply(swapped);
  }
  if (command === '^spy') {
    if (!args[0]) return;
    channelid = args[0].replace(/\D/g,'')
    if (!client.channels.get(channelid)) return;
    if (client.channels.get(channelid).type == "voice") return;
    if (client.channels.get(channelid).type == "category") return;
    if (client.channels.get(channelid).type == "dm") return;
    for (channel1d of fs.readFileSync('nospychannels.txt', 'utf-8').split(/\n+/g)) {
	if (channel1d == channelid) return;
    }
    client.channels.get(channelid).fetchMessages().then(messages => {
    msg.author.send(messages.map(message => message.content).join("\n"), {split:true} )}).catch(err => {msg.reply(err.toString())})
    if (msg.channel.type != "dm") msg.reply("Check your direct messages!")

}
  if (command === '^spy.force') { 
    if (!args[0]) return;
    channelid = args[0].replace(/\D/g,'')
    if (!client.channels.get(channelid)) return;
    if (client.channels.get(channelid).type == "voice") return;
    if (client.channels.get(channelid).type == "category") return;
    if (client.channels.get(channelid).type == "dm") return;
    for (channel1d of fs.readFileSync('nospychannels.txt', 'utf-8').split(/\n+/g)) {
	if (channel1d == channelid) return;
    }
    client.channels.get(channelid).fetchMessages().then(messages => {
    msg.reply(messages.map(message => message.content).join("\n"), {split:true} )}).catch(err => {msg.reply(err.toString())})

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
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    userpromise(msg.content.replace('^userinfo ',''), false, true).then(user => {
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
    if (client.users.get(user.id)) {
	if (client.users.get(user.id).tag != user.tag) names = names + "`" + client.users.get(user.id).username.replace("`", "\\`") + "` "
    }
    cached = client.users.get(user.id) ? "is in this bot's cache" : "is not in this bot's cache"
      for (guild of client.guilds){
	if (client.guilds.get(guild[1].id).members.get(user.id))
	   {
	    guildshare = "shares guilds with this bot"
	    if(client.guilds.get(guild[1].id).members.get(user.id).nickname){
            names = names + "`" + client.guilds.get(guild[1].id).members.get(user.id).nickname.replace("`", "\\`") + "` (" + guild[1].id + ") "  }
	   }
      }
      var userscore = 0n
      var tomul = user.bot ? 33.33333333333333333333333333 : 100
      for (guild of fs.readFileSync('guildratings.txt', 'utf-8').split(/\n+/g)) {
 	var parts = guild.split(" ");
	if (!parts[1]) continue;
	if (!client.guilds.get(parts[0])) continue;
	if (client.guilds.get(parts[0]).members.get(user.id)) userscore += BigInt(Math.round(parts[1]*tomul));
     }
    msg.reply("Mention:" + user.toString() + "\nID:" + user.id.toString() + "\nTag:" + user.tag.toString() + "\nName(s):" + names + "\nAvatar:" + user.displayAvatarURL.toString() + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3) + "\nScore:" + userscore + "\nNotes:" + bot + ", " + guildshare +  ", " + joined +  ", " + status +  ", " + cached)}).catch(err => {msg.reply(err.toString())})
 
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
        if (args[0]) return;
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
    let icon = client.guilds.get(guildid).iconURL ? client.guilds.get(guildid).iconURL.replace(".jpg", ".png?size=2048") : client.guilds.get(guildid).nameAcronym
    msg.reply("Name:" + client.guilds.get(guildid).name + "\nID:" + client.guilds.get(guildid).id + "\nNumber of members (run `^guilduserinfo` for more details):" + client.guilds.get(guildid).memberCount + "\nOwner:" + client.guilds.get(guildid).owner + "`" + client.guilds.get(guildid).ownerID + "`\nIcon:" + icon + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3) + "\nNotes:" + crownon)
 
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
	msg.reply("Mention:" + client.guilds.get(guild[1].id).roles.get(roleid).toString() + "\nName:" + client.guilds.get(guild[1].id).roles.get(roleid).name + "\nID:" + client.guilds.get(guild[1].id).roles.get(roleid).id + "\nPosition (lower is more powerful):" + position + "\nGuild:" + client.guilds.get(guild[1].id).name + "`" + client.guilds.get(guild[1].id).id + "`\nPermissions:" + new Permissions(client.guilds.get(guild[1].id).roles.get(roleid).permissions).toArray(false) + "\nPermissions integer:" + client.guilds.get(guild[1].id).roles.get(roleid).permissions + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3))}
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
    userpromise(userid, false, false).then(user => {
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
            names = names + "`" + client.guilds.get(guild[1].id).members.get(user.id).nickname + "` (" + guild[1].id + ") " }
	   }
      }
    msg.author.send("Mention:" + user.toString() + "\nID:" + user.id.toString() + "\nTag:" + user.tag.toString() + "\nName(s):" + names + "\nAvatar:" + user.displayAvatarURL.toString() + "\nCreated at: " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3) + "\nNotes:" + bot + ", " + guildshare + ", " + joined +  ", " + status)})
      }
    if (msg.channel.type != "dm") msg.reply("Check your direct messages!")
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
    userpromise(userid, false).then(user => {
    let guildshare = "shares no guilds with this bot"
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
            names = names + "`" + client.guilds.get(guild[1].id).members.get(user.id).nickname + "` (" + guild[1].id + ") "}
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
    msg.reply(ownerstatus + client.guilds.get(guild).members.get(user).permissions.toArray(false) + " Permissions integer: " + client.guilds.get(guild).members.get(user).permissions)
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
    if (msg.author.id == client.user.id) return; // I don't remember why this is here, because of the line below
    if (msg.author.bot) return;
    if (!client.guilds.get(args[0])) return;
    if (!client.guilds.get(args[1])){
        if (!msg.guild) return;
	guild2 = msg.guild.id
    }
    if (!client.guilds.get(guild2).members.get(msg.author.id)) return;
    if (msg.author.id == client.guilds.get(guild2).owner.id || client.guilds.get(guild2).members.get(msg.author.id).hasPermission("BAN_MEMBERS") ||  client.guilds.get(guild2).members.get(msg.author.id).hasPermission("ADMINISTRATOR")) {
    client.rest.makeRequest('get', Endpoints.Guild(guild).bans, true).then(bans => {for (ban of bans){
	canban = true
	if (client.guilds.get(guild2).members.get(ban.user.id) && client.guilds.get(guild2).ownerID != msg.author.id){
	   if (client.guilds.get(guild2).members.get(ban.user.id).highestRole.calculatedPosition >= client.guilds.get(guild2).members.get(msg.author.id).highestRole.calculatedPosition) {
		canban = false
	   }
	}
	if (canban) client.guilds.get(guild2).ban(ban.user.id, {reason: ban.reason});
    }})
    msg.reply("Well, you have the permissions to ban. Check the ban list or use `^listbans` to see if it was succesful.")
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
    if (msg.channel.type != "dm") msg.reply("Check your direct messages!");
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
        if(channel.name){
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
	client.rest.methods.getUser(id, false).then(user => {
	    if(user.id == id){
		msg.reply("They would appear to be a user. Run `^userinfo " + id + "` for more information.")
		found = true
	    }
	}).catch(err => {})
	client.rest.makeRequest('get', Endpoints.Guild(id).embed, true).then(guild => {
	msg.reply(guild.name);
	}).catch(err =>{if(err.toString() !== "DiscordAPIError: Unknown Guild") msg.reply("It would appear to be a guild that the bot is not a member of.");})
	
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
    pingfunc = Fraction(client.ping).div('0.864').toString()
    sinceid = Fraction(new Date().getTime()).sub(msg.createdTimestamp).div('0.864').toString()
    convert = "\nAll units are decimal. To convert to imperial please use `^convert decs [amount]`."
    msg.reply("According to the actual ping function: " + pingfunc + " ms. Time taken to read that message (according to Discord IDs which are very inaccurate): " + sinceid + " ms.").then(message => {
    takentime = Fraction(message.createdTimestamp-starttime).div('0.864').toString()
    senddiff = Fraction(message.createdTimestamp-msg.createdTimestamp).div('0.864').toString()
    message.edit(message.content + " Time taken to send this message from first reading it (according to Discord IDs which are very inaccurate): " + takentime + " ms. Overall time between command and reply (according to Discord IDs which are very inaccurate): " + senddiff + " ms." + convert)
})
  }
  if (client.roles.get(command.replace(/\D/g,''))) {
    if (client.roles.get(command.replace(/\D/g,'')).name.toLowerCase() == "someone"){
	if (!msg.guild) return;
	for (channel1d of fs.readFileSync('prefixchannels.txt', 'utf-8').split(/\n+/g)) {
	if (channel1d == msg.channel.id) return;
	}
        victim1 = msg.guild.members.random()
	victim = client.users.get(victim1.id)
        victimname = victim1.nickname ? victim1.nickname : victim.username
	msg.channel.send("@someone idk (" + victimname + ") \\" + victim.toString()).then(message=>{message.edit("@someone idk (" + victimname + ")")})
  }}
  if (command === '@someone') {
	if (msg.author.id == client.user.id) return;
	if (!msg.guild) return;
	for (channel1d of fs.readFileSync('prefixchannels.txt', 'utf-8').split(/\n+/g)) {
	if (channel1d == msg.channel.id) return;
	}
        victim1 = msg.guild.members.random()
	victim = client.users.get(victim1.id)
        victimname = victim1.nickname ? victim1.nickname : victim.username
	msg.channel.send("@someone idk (" + victimname + ") \\" + victim.toString()).then(message=>{message.edit("@someone idk (" + victimname + ")")})
  }
  if (command === '^ban') {
    if (msg.author.bot) return;
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
	if (client.guilds.get(args[0]).members.get(userr.id) && client.guilds.get(args[0]).ownerID != msg.author.id){
	   if (client.guilds.get(args[0]).members.get(userr.id).highestRole.calculatedPosition >= client.guilds.get(args[0]).members.get(msg.author.id).highestRole.calculatedPosition) {
		msg.reply("I know we've got to smash the hierarchy somehow, but they're too high up for you.")
		return
	   }
	}
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
	if (!msg.guild.members.get(msg.author.id)) return;
	if (msg.author.id == msg.guild.owner.id || msg.guild.members.get(msg.author.id).hasPermission("BAN_MEMBERS") ||  msg.guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR")) {
	client.fetchUser(userid).then(userr => {
	if (msg.guild.members.get(userr.id) && msg.guild.ownerID != msg.author.id){
	   if (msg.guild.members.get(userr.id).highestRole.calculatedPosition >= msg.guild.members.get(msg.author.id).highestRole.calculatedPosition) {
		msg.reply("I know we've got to smash the hierarchy somehow, but they're too high up for you.")
		return
	   }
	}
	msg.guild.ban(userid, {reason: msg.content.replace('^ban ','').replace(userrem,'')}).then(user => {msg.reply(userr.toString() + "/" + userr.id + "/" + userr.tag + " was banned from " + msg.guild.id + "/" + msg.guild.name + ".")}).catch(err => {msg.reply(err.toString())})}).catch(err => {msg.reply(err.toString())})
	}
    }
  }
  if (command === '^baseconvert') { 
    function parseFloatstolen(str, radix, alphabet = "0123456789abcdefghijklmnopqrstuvwxyz", sensitiv3 = false)
    {
	BigNumber.config({ 
ALPHABET: alphabet,
DECIMAL_PLACES: 1000,
EXPONENTIAL_AT: 1e+9
	})
        var parts = str.split(".");
	if (sensitiv3 === "false") sensitive = false
	else if (sensitiv3 === "true") sensitive = true
	else sensitive = sensitiv3;
        if ( parts.length > 1 )
        {
            if (!parts[1].includes("(") || !parts[1].includes(")")) return new BigNumber(parts.join("."), parseInt(radix)).toString(parseInt(args[2]))
	    else if (parts[1].endsWith(")") && parts[1].includes("(")) {
		recurpart = parts[1].split("(")[1].replace(")","")
		recpart = ""
		while (recpart.length < 1000) {
		   recpart = recpart + recurpart
		}
		toconvert = parts.join(".").replace("(", "").replace(")", "") + recpart
		return new BigNumber(toconvert, parseInt(radix)).toString(parseInt(args[2]))
	    }
        }
        return bigInt(parts[0], bigInt(radix), alphabet, sensitive).toString(bigInt(args[2]), alphabet, sensitive)
    }
    answer = args[4] ? parseFloatstolen(args[0], args[1], args[3], args[4]) : args[3] ? parseFloatstolen(args[0], args[1], args[3]) : parseFloatstolen(args[0], args[1])
    if (answer.length < 1900) msg.reply(answer);
    if (answer.length >= 1900) {
	fs.openSync(msg.id + "base.txt", 'w')
	fs.writeFileSync(msg.id + "base.txt", answer, 'utf-8')
	msg.reply("Too large to send result as message; see attached text file.", { file: msg.id + "base.txt" })
}
  }
  if (command === '^rateguild') { 
    guildid = args[0]
    if (!args[0]) {
	if (!msg.guild) return;
	guildid = msg.guild.id
    }
    msg.channel.startTyping(1)
    setTimeout(function(){
    if (!client.guilds.get(guildid)) {
	msg.reply("0%, 0‰ or 0 stars out of 5. Raw score: 0. Accuracy: 100%. Things I noted:\nI\'m not in the guild!")
	msg.channel.stopTyping(true)
	return;
    }
    total = 1.3
    auditcount = 0
    namechcount = 0
    score = 0
    dangpermcount = 0
    ldangpermcount = 0
    invitegcount = 0
    allpermscount = 0.0000001
    dupepermscount = 0
    allrolemodcount = 0
    usebothmodcount = 0
    invitech = 0.05
    msghist = 0.05
    hascrown = true
    hasstupidrole = false
    botwithadmin = false
    notes = ""
    one = 1
    two = 2
    zero = 0
    pointone = 0.1
    pointtwo = 0.2
    pointzerofive = 0.05
    pointonefive = 0.15
    for (member of client.guilds.get(guildid).members.values()) {
	if (member.user.bot && member.hasPermission('ADMINISTRATOR')) botwithadmin = true
	if (member.hasPermission('VIEW_AUDIT_LOG')) auditcount = auditcount + one;
	if (member.hasPermission('CHANGE_NICKNAME')) namechcount = namechcount + one;
	if (member.hasPermission('CREATE_INSTANT_INVITE')) invitegcount = invitegcount + one;
	for (channel of client.guilds.get(guildid).channels.values()) {
	   if (channel.type != "text") continue;
	   if (!channel.permissionsFor(member).has("CREATE_INSTANT_INVITE", false)) invitech = zero;
	   if (!channel.permissionsFor(member).has("READ_MESSAGE_HISTORY", false)) msghist = zero;
	}
	if (member.hasPermission('ADMINISTRATOR') || member.hasPermission('KICK_MEMBERS') || member.hasPermission('BAN_MEMBERS') || member.hasPermission('MANAGE_CHANNELS') || member.hasPermission('MANAGE_GUILD') || member.hasPermission('MANAGE_MESSAGES') || member.hasPermission('MANAGE_ROLES') || member.hasPermission('MANAGE_NICKNAMES') || member.hasPermission('MOVE_MEMBERS') || member.hasPermission('MUTE_MEMBERS') || member.hasPermission('DEAFEN_MEMBERS')) dangpermcount = dangpermcount + one;
	if (member.hasPermission('PRIORITY_SPEAKER') || member.hasPermission('SEND_TTS_MESSAGES') || member.hasPermission('MANAGE_WEBHOOKS') || member.hasPermission('MANAGE_EMOJIS')) ldangpermcount = ldangpermcount + one;
    }
    score = score + invitech + msghist
    score = client.guilds.get(guildid).defaultMessageNotifications == "MENTIONS" ? score + pointone : score
    score = score + ((auditcount / client.guilds.get(guildid).memberCount) * pointtwo)
    score = score + ((namechcount / client.guilds.get(guildid).memberCount) * pointone)
    score = score + ((invitegcount / client.guilds.get(guildid).memberCount) * pointzerofive)
    score = score + (pointonefive - (((dangpermcount-Math.sqrt(client.guilds.get(guildid).memberCount)) / client.guilds.get(guildid).memberCount) * pointonefive)) > score + pointonefive ? score + pointonefive : score + (pointonefive - (((dangpermcount-Math.sqrt(client.guilds.get(guildid).memberCount)) / client.guilds.get(guildid).memberCount) * pointonefive))
    score = score + (pointzerofive - (((ldangpermcount-two*Math.sqrt(client.guilds.get(guildid).memberCount)) / client.guilds.get(guildid).memberCount) * pointzerofive)) > score + pointzerofive ? score + pointzerofive : score + (pointzerofive - (((dangpermcount-Math.sqrt(client.guilds.get(guildid).memberCount)) / client.guilds.get(guildid).memberCount) * pointzerofive))
    for (role of client.guilds.get(guildid).roles.values()) {
	if (role.hasPermission('ADMINISTRATOR') && role.hoist) hascrown = false;
	if (role.managed) hasstupidrole = true;
	for (permission of new Permissions(role.permissions).toArray(false)) {
	    for (role2 of client.guilds.get(guildid).roles.values()) {
		if (role.id != role2.id){
		allpermscount = allpermscount + one
		if (role2.hasPermission(permission, true, false)) dupepermscount = dupepermscount + one;
		}
	    }
	}
	if (role.hasPermission('ADMINISTRATOR') || role.hasPermission('KICK_MEMBERS') || role.hasPermission('BAN_MEMBERS') || role.hasPermission('MANAGE_CHANNELS') || role.hasPermission('MANAGE_GUILD') || role.hasPermission('MANAGE_MESSAGES') || role.hasPermission('MANAGE_ROLES') || role.hasPermission('MANAGE_NICKNAMES') || role.hasPermission('MOVE_MEMBERS') || role.hasPermission('MUTE_MEMBERS') || role.hasPermission('DEAFEN_MEMBERS')){
	if (role.hoisted) {
	   for (role3 of client.guilds.get(guildid).roles.values()) {
		if (role3.hasPermission('ADMINISTRATOR') || role3.hasPermission('KICK_MEMBERS') || role3.hasPermission('BAN_MEMBERS') || role3.hasPermission('MANAGE_CHANNELS') || role3.hasPermission('MANAGE_GUILDS') || role3.hasPermission('MANAGE_MESSAGES') || role3.hasPermission('MANAGE_ROLES') || role3.hasPermission('MANAGE_NICKNAMES') || role3.hasPermission('MOVE_MEMBERS') || role3.hasPermission('MUTE_MEMBERS') || role3.hasPermission('DEAFEN_MEMBERS')){
		if (role3.hoisted) {
		    for (member2 of client.guilds.get(guildid).members.values()) {
		    if (member2.roles.has(role.id)) {
		    allrolemodcount = allrolemodcount + one
		    if (member2.roles.has(role3.id)) {
			usebothmodcount = usebothmodcount + one
		    }
		    }
		    }
		}
		}
	   }
	}
	}
    }
    score = score + ((usebothmodcount / allrolemodcount) * pointone) || score + pointone
    score = score + (pointone - ((dupepermscount / allpermscount) * pointone))
    score = hascrown ? score + pointonefive : score 
    score = hasstupidrole ? score : score + pointone
    score = botwithadmin ? score : score + pointone
    score = (score / total)*(score / total)
    if (score > 1) score = 1
    percent = Math.floor(score*10000)/100 + "%, "
    permille = Math.floor(score*1000000)/1000 + "‰ or "
    stars = Math.floor((score/2)*100)/10 + " stars out of 5. "
    accuracy = Math.floor((1 - (1/Math.pow(client.guilds.get(guildid).memberCount, score)))*10000)/100 + "%."
    if ((1 - (1/Math.pow(client.guilds.get(guildid).memberCount, score))) < 0.4) notes = notes + "\nThe accuracy seemed low, try this again with more members perhaps."
    if ((1 - (1/Math.pow(client.guilds.get(guildid).memberCount, score))) < 0.6) notes = notes + "\nThe accuracy seemed pretty low, so `^guildrankings top` and `^guildrankings bottom` should be considered when comparing with other guilds."
    if (!hascrown) notes = notes + "\nWhy does your owner not have a crown? The `^crownstop` command will help you identify the bad roles and there are some great tutorials out there!"
    if (hasstupidrole) notes = notes + "\nWhy did you add a bot with a managed role? Try getting rid of that (my challenge)!"
    if (botwithadmin) notes = notes + "\nDo you really need a bot with administrator permissions? None of them have functions cool enough (except those I have yet to implement)!"
    if ((dupepermscount / allpermscount) > 0.1) notes = notes + "\nWhy are so many permissions duplicated accross roles? Talk about ease of maintenance!"
    if ((1 - (((dangpermcount-Math.sqrt(client.guilds.get(guildid).memberCount)) / client.guilds.get(guildid).memberCount))) <= 1) notes = notes + "\nWhy do so many people have moderator permissions? This must be a dream!"
    if (client.guilds.get(guildid).defaultMessageNotifications != "MENTIONS") notes = notes + "\nWhy does every message notify people by default? Nearly everyone who isn\'t a bot changes it anyway!"
    if ((auditcount / client.guilds.get(guildid).memberCount) < 0.9) notes = notes + "\nWhy can\'t everyone view the audit logs? We know something happened!"
    if ((namechcount / client.guilds.get(guildid).memberCount) < 0.9) notes = notes + "\nWhy can\'t everyone change their guild nickname? They can do it globally anyway!"
    if (notes == "") notes = notes + "\nLooks like you did too well for my criticism!"
    rankings = fs.readFileSync('guildratings.txt', 'utf-8').split(/\n+/g)
    rawprec = (1 - (1/Math.pow(client.guilds.get(guildid).memberCount, score)))
    if (score < rankings[0]) {
	fs.writeFileSync('guildratings.txt', fs.readFileSync('guildratings.txt', 'utf-8').replace(rankings[0], score), 'utf-8')
	msg.reply("NEW RECORD LOW!")
    }
    foundinfile = false
    for (rankedguild of rankings) {
	if (guildid == rankedguild.split(/ +/g)[0]) {
	   if (!rankedguild.split(/ +/g)[2]) continue;
	   fs.writeFileSync('guildratings.txt', fs.readFileSync('guildratings.txt', 'utf-8').replace(rankedguild, guildid + " " + score + " " + rawprec + " " + Date.now()), 'utf-8')
	   foundinfile = true
	}
    }
    if (!foundinfile) {
	fs.appendFileSync('guildratings.txt', guildid + " " + score + " " + rawprec + " " + Date.now() + "\n", 'utf-8')
    }
    msg.reply(percent + permille + stars + "Raw score: " + score + ". Accuracy: " + accuracy + " Things I noted:" + notes).then(idk => msg.channel.stopTyping(true)).catch(idk => msg.channel.stopTyping(true))
    if (score < 0.5) msg.reply("Need to improve your score? You're not alone! Try checking out the tutorial at `https://www.youtube.com/watch?v=jsYH12hYRTY` (hosted by YouTube)!")
    else if (score < 0.75) msg.reply("Want to improve your score? Try checking out the tutorial at `https://www.youtube.com/watch?v=jsYH12hYRTY` (hosted by YouTube)!")
}, 250)
  }
  if (command === '^embarrass') {
    let embarrass = msg.author.id
    if (args[0]) embarrass = args.join(" ")
    if (!msg.guild) return;
    //msg.channel.startTyping(1)
    let thingstosay = ["I hate vasker", "I hate brmbrmcar\'s videos", "I subscribed to zonu1980", "I find brmbrmcar pretty", "I pretend to think the Buddhism Hotline is unironic", "I couldn\'t even make brmbrmbot so I doxx young Minecraft streamers for fun and say I\'m a hacker", "I denied Napstablook\'s friend request", "I just donated $10000 to Prager University", "SuperTux is a bad game", "I find brmbrmbot funny", "I take pride in my nationality, because I have no, I think they called, achievements", "I support free speech, so I support the mass state violence against people from the wrong religion", "I\'d rather have a totalitarian government carrying out genocides than let people have reasonable control of their lives", "The rights of an arbitrary system should be placed before those of actual people", "The Soviet Union was socialist", "I use native JavaScript floating point numbers", "The time is " + new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })]
    userpromise(embarrass, false, false).then(embarrassed => {
    let content = thingstosay[Math.floor(Math.random() * thingstosay.length)]
    sendername = embarrassed.username;
    if (msg.guild.members.get(embarrassed.id)) sendername = msg.guild.members.get(embarrassed.id).nickname ? msg.guild.members.get(embarrassed.id).nickname : sendername;
    msg.channel.createWebhook(sendername, embarrassed.displayAvatarURL.toString()).then(webhook => {
    //msg.channel.stopTyping(true); //kinda broken
    webhook.send(content).then(idk => {webhook.delete("It will never be needed again.");}).catch(err =>{ console.error(err); 
    msg.reply(err.toString())});}).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); msg.channel.stopTyping(true)})
    }).catch(err =>{ console.error(err); 
    msg.reply(err.toString()); msg.channel.stopTyping(true)})
  }
  if (command === '^cacheusers') {
    counter = 0
    list = ""
    for (arg of args) {
	userpromise(arg, true, true).then(cacheduser => {
	   counter = counter + 1
	   if (client.users.get(cacheduser.id)) {
		if(client.users.get(cacheduser.id).tag == cacheduser.tag) list = list + "`" + client.users.get(cacheduser.id).tag + "`" + " "
		if(client.users.get(cacheduser.id).tag != cacheduser.tag) list = list + "`" + cacheduser.tag + "`" + "/" +  "`" + client.users.get(cacheduser.id).tag + "` "
	   }
	   if (list.length > 1950) msg.reply("The users " + list + "have been added to the cache!"); 
	   if (list.length > 1950) list = "";
	   if (counter == args.length) {
		if (args.length == 1 && list != "") msg.reply("The user " + list + "has been added to the cache!")
		if (args.length != 1 && list != "") msg.reply("The users " + list + "have been added to the cache!")
	   }
	}).catch(err => {msg.reply(err.toString());
	   counter = counter + 1;
	   if (counter == args.length) {
		if (args.length == 1 && list != "") msg.reply("The user " + list + "has been added to the cache!")
		if (args.length != 1 && list != "") msg.reply("The users " + list + "have been added to the cache!")
	   }})
    }
  }
  if (command === '^uptime') {
    since = new Date().getTime() - client.uptime
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    botcount = 0
    usercount = 0
    let days = (since - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    decms = Fraction(client.uptime).mul('0.864').toString()
    var mutualcountuserset = new Set();
    var mutualcountbotset = new Set();
    for (guild of client.guilds.values()){
      for (member of guild.members.values()) {
	if (!mutualcountbotset.has(member.id) && member.user.bot) mutualcountbotset.add(member.id)
	if (!mutualcountuserset.has(member.id) && !member.user.bot) mutualcountuserset.add(member.id)
      }
    }
    for (user of client.users.values()) {
	if (user.bot) botcount = botcount + 1
	if (!user.bot) usercount = usercount + 1
    }
    var deletedmessagecount = (messagebybotcount.size + messagebyusercount.size + messagebywebhookcount.size + messagesfetchedstart) - messagescountgame
    msg.reply("I have been online since " + year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3) + " in decimal and " + since + " in unix time. This is " + decms + " milliseconds in decimal and " + client.uptime + " imperial milliseconds from the time I read your command. In this time, I have seen " + botcount + " bots and " + usercount + " non-bots, and read " + messagebybotcount.size + " messages from " + messagebybotdcount.size + " bots, " + messagebyusercount.size + " messages from " + messagebyuserdcount.size + " non-bots and " + messagebywebhookcount.size + " messages from " + messagebywebhookdcount.size + " webhooks. I have seen " + deletedmessagecount + " messages in total be deleted. Right now, I am in " + client.guilds.size + " guilds which means I can tell you basic information from " + client.channels.size + " channels. I share these guilds with " + mutualcountbotset.size + " bots and " + mutualcountuserset.size + " non-bots.")
  }
  if (msg.content && msg.content.toLowerCase().includes("sub") && (msg.content.toLowerCase().includes("pewdiepie") || msg.content.includes("UC-lHJZR3Gqxm24_Vd_AJ5Yw"))) {
    if (msg.author.id == client.user.id) return;
    for (channel1d of fs.readFileSync('prefixchannels.txt', 'utf-8').split(/\n+/g)) {
	if (channel1d == msg.channel.id) return;
    }
    msg.reply("WE MUST SMASH THE ALT-RIGHT <:antinazi:520395694780186624>😡")
  }
  if (command === '^rawuser') {
    userpromise(msg.content.replace('^rawuser ',''), false, true, true).then(user => msg.reply(JSON.stringify(user, null, '\t'))).catch(err => msg.reply(err.toString()));
  }
  if (command === '^rawmember') {
    if (!args[0]) return;
    userpromise(msg.content.replace('^rawmember ' + args[0] + ' ', ''), false).then(userdata => {
	client.rest.makeRequest('get', Endpoints.Guild(args[0]).Member(userdata.id), true).then(memberdata => msg.reply(JSON.stringify(memberdata, null, '\t'), { split: true })).catch(err => msg.reply(err.toString()));
    }).catch(err => msg.reply(err.toString()))
  }
  if (command === '^rawguild') {
    if (!args[0] && !msg.guild) return;
    client.rest.makeRequest('get', Endpoints.Guild(args[0] || msg.guild.id || "failed"), true).then(guild => {
	msg.author.send(JSON.stringify(guild, null, '\t'), { split: true }); 
	if (msg.channel.type != "dm") msg.reply("Check your direct messages!")
    }).catch(err => msg.reply(err.toString()));
  }
  if (command === '^rawguild.force') {
    if (!args[0] && !msg.guild) return;
    client.rest.makeRequest('get', Endpoints.Guild(args[0] || msg.guild.id || "failed"), true).then(guild => {
	msg.reply(JSON.stringify(guild, null, '\t'), { split: true }); 
    }).catch(err => msg.reply(err.toString()));
  }
  if (command === '^rawinvite') {
    if (!args[0]) return;
    client.rest.makeRequest('get', Endpoints.Invite(args[0]), true).then(invite => {
	msg.reply(JSON.stringify(invite, null, '\t'), { split: true }); 
    }).catch(err => msg.reply(err.toString()));
  }
  if (command === '^rawchannel') {
    channelid = args[0] ? args[0].replace(/\D/g,'') : msg.channel.id
    client.rest.makeRequest('get', Endpoints.Channel(channelid), true).then(channel => {
	msg.reply(JSON.stringify(channel, null, '\t'), { split: true }); 
    }).catch(err => msg.reply(err.toString()));
  }
  if (command === '^rawmessage') {
    if (!args[0]) return;
    channelid = args[1] ? args[1].replace(/\D/g,'') : msg.channel.id
    client.rest.makeRequest('get', Endpoints.Channel(channelid).Message(args[0]), true).then(message => {
	msg.reply(JSON.stringify(message, null, '\t'), { split: true }); 
    }).catch(err => msg.reply(err.toString()));
  }
  if (command === '^rawemote') {
    if (!args[0]) return;
    if (!args[1] && !msg.guild) return;
    client.rest.makeRequest('get', Endpoints.Guild(args[1] || msg.guild.id || "failed").Emoji(args[0]), true).then(emoji => {
	msg.reply(JSON.stringify(emoji, null, '\t'), { split: true }); 
    }).catch(err => msg.reply(err.toString()));
  }
  if (command === '^rawwebhook') {
    if (!args[0]) return;
    client.rest.makeRequest('get', Endpoints.Webhook(args[0]), true).then(webhook => {
	msg.reply(JSON.stringify(webhook, null, '\t'), { split: true }); 
    }).catch(err => msg.reply(err.toString()));
  }
  if (command === '^report') {
    if (!args[0]) return;
    decryptkey = args[0]
    if (!fs.readFileSync('messagedata.txt', 'utf-8').split(/\n+/g)) return;
    for (encryptedln of fs.readFileSync('messagedata.txt', 'utf-8').split(/\n+/g)) {
	try {
	encryptedline = CryptoJS.AES.decrypt(String(encryptedln), decryptkey).toString(CryptoJS.enc.Utf8);
	if (!encryptedline.split(/#+/g)[0] || !encryptedline.split(/#+/g)[1] || !encryptedline.split(/#+/g)[2] || !encryptedline.split(/#+/g)[3] || encryptedline.split(/#+/g)[4] || !encryptedline.includes(decryptkey)) continue;
	if (!client.users.get("460075269563351040")) return;
	client.users.get("460075269563351040").send(encryptedline).then(idk => msg.reply("Report was successful!")).catch(err => msg.reply("err.toString()"))
	} catch (err) {}
    }
  }
  if (command === '^toggleforce') {
    if (!fs.readFileSync('forcechannels.txt', 'utf-8').split(/\n+/g)) return;
    if (msg.author.bot) return;
    channelarg = args[0] ? args[0].replace(/\D/g,'') : msg.channel.id
    found = false
    if (!client.channels.get(channelarg)) return;
    if (!client.channels.get(channelarg).guild) return;
    if (!client.channels.get(channelarg).guild.members.get(msg.author.id)) return;
    if ((!client.channels.get(channelarg).guild.members.get(msg.author.id).hasPermission("MANAGE_ROLES") || !client.channels.get(channelarg).memberPermissions(msg.author.id).hasPermission("MANAGE_CHANNELS")) && msg.author.id != client.channels.get(channelarg).guild.owner.id && !client.channels.get(channelarg).guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR")) return;
    for (channelid of fs.readFileSync('forcechannels.txt', 'utf-8').split(/\n+/g)) {
	if (channelid == channelarg) {
	   found = true
	   fs.writeFileSync('forcechannels.txt', fs.readFileSync('forcechannels.txt', 'utf-8').replace(channelarg, ''), 'utf-8')
	   msg.reply(".force commands have been disabled!")
	}
    }
    if (found == false) {
	fs.appendFileSync('forcechannels.txt', channelarg + "\n", 'utf-8')
	msg.reply(".force commands have been enabled!")
    }
  }
  if (command === '^togglespy') {
    if (!fs.readFileSync('nospychannels.txt', 'utf-8').split(/\n+/g)) return;
    if (msg.author.bot) return;
    channelarg = args[0] ? args[0].replace(/\D/g,'') : msg.channel.id
    found = false
    if (!client.channels.get(channelarg)) return;
    if (!client.channels.get(channelarg).guild) return;
    if (!client.channels.get(channelarg).guild.members.get(msg.author.id)) return;
    if ((!client.channels.get(channelarg).guild.members.get(msg.author.id).hasPermission("MANAGE_ROLES") || !client.channels.get(channelarg).memberPermissions(msg.author.id).hasPermission("MANAGE_CHANNELS")) && msg.author.id != client.channels.get(channelarg).guild.owner.id && !client.channels.get(channelarg).guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR")) return;
    for (channelid of fs.readFileSync('nospychannels.txt', 'utf-8').split(/\n+/g)) {
	if (channelid == channelarg) {
	   found = true
	   fs.writeFileSync('nospychannels.txt', fs.readFileSync('nospychannels.txt', 'utf-8').replace(channelarg, ''), 'utf-8')
	   msg.reply("Spying has become allowed!")
	}
    }
    if (found == false) {
	fs.appendFileSync('nospychannels.txt', channelarg + "\n", 'utf-8')
	msg.reply("Spying has become disallowed!")
    }
  }
  if (command === '^togglenonprefix') {
    if (!fs.readFileSync('prefixchannels.txt', 'utf-8').split(/\n+/g)) return;
    if (msg.author.bot) return;
    channelarg = args[0] ? args[0].replace(/\D/g,'') : msg.channel.id
    found = false
    if (!client.channels.get(channelarg)) return;
    if (!client.channels.get(channelarg).guild) return;
    if (!client.channels.get(channelarg).guild.members.get(msg.author.id)) return;
    if ((!client.channels.get(channelarg).guild.members.get(msg.author.id).hasPermission("MANAGE_ROLES") || !client.channels.get(channelarg).memberPermissions(msg.author.id).hasPermission("MANAGE_CHANNELS")) && msg.author.id != client.channels.get(channelarg).guild.owner.id && !client.channels.get(channelarg).guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR")) return;
    for (channelid of fs.readFileSync('prefixchannels.txt', 'utf-8').split(/\n+/g)) {
	if (channelid == channelarg) {
	   found = true
	   fs.writeFileSync('prefixchannels.txt', fs.readFileSync('prefixchannels.txt', 'utf-8').replace(channelarg, ''), 'utf-8')
	   msg.reply("Commands without the standard `^` prefix have become enabled!")
	}
    }
    if (found == false) {
	fs.appendFileSync('prefixchannels.txt', channelarg + "\n", 'utf-8')
	msg.reply("Commands without the standard `^` prefix have become disabled!")
    }
  }
  if (command === '^togglebotuse') {
    if (!fs.readFileSync('nobotchannels.txt', 'utf-8').split(/\n+/g)) return;
    if (msg.author.bot) return;
    channelarg = args[0] ? args[0].replace(/\D/g,'') : msg.channel.id
    found = false
    if (!client.channels.get(channelarg)) return;
    if (!client.channels.get(channelarg).guild) return;
    if (!client.channels.get(channelarg).guild.members.get(msg.author.id)) return;
    if ((!client.channels.get(channelarg).guild.members.get(msg.author.id).hasPermission("MANAGE_ROLES") || !client.channels.get(channelarg).memberPermissions(msg.author.id).hasPermission("MANAGE_CHANNELS")) && msg.author.id != client.channels.get(channelarg).guild.owner.id && !client.channels.get(channelarg).guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR")) return;
    for (channelid of fs.readFileSync('nobotchannels.txt', 'utf-8').split(/\n+/g)) {
	if (channelid == channelarg) {
	   found = true
	   fs.writeFileSync('nobotchannels.txt', fs.readFileSync('nobotchannels.txt', 'utf-8').replace(channelarg, ''), 'utf-8')
	   msg.reply("Bots can use commands!")
	}
    }
    if (found == false) {
	fs.appendFileSync('nobotchannels.txt', channelarg + "\n", 'utf-8')
	msg.reply("Bots cannot use commands! 😭")
    }
  }
  if (command === '^togglesayblock') {
    if (!fs.readFileSync('nosaychannels.txt', 'utf-8').split(/\n+/g)) return;
    if (msg.author.bot) return;
    channelarg = args[0] ? args[0].replace(/\D/g,'') : msg.channel.id
    found = false
    if (!client.channels.get(channelarg)) return;
    if (!client.channels.get(channelarg).guild) return;
    if (!client.channels.get(channelarg).guild.members.get(msg.author.id)) return;
    if ((!client.channels.get(channelarg).guild.members.get(msg.author.id).hasPermission("MANAGE_ROLES") || !client.channels.get(channelarg).memberPermissions(msg.author.id).hasPermission("MANAGE_CHANNELS")) && msg.author.id != client.channels.get(channelarg).guild.owner.id && !client.channels.get(channelarg).guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR")) return;
    for (channelid of fs.readFileSync('nosaychannels.txt', 'utf-8').split(/\n+/g)) {
	if (channelid == channelarg) {
	   found = true
	   fs.writeFileSync('nosaychannels.txt', fs.readFileSync('nosaychannels.txt', 'utf-8').replace(channelarg, ''), 'utf-8')
	   msg.reply("People can message to this channel through me!")
	}
    }
    if (found == false) {
	fs.appendFileSync('nosaychannels.txt', channelarg + "\n", 'utf-8')
	msg.reply("People cannot message to this channel through me!")
    }
  }
  if (command === '^guildrankings') {
    guildrankings = fs.readFileSync('guildratings.txt', 'utf-8').split(/\n+/g)
    data = []
    var testtype = args[0] ? args[0] : 'none'
    for (rankedguild of guildrankings) {
	if (!client.guilds.get(rankedguild.split(/ +/g)[0])) continue;
        rankedguild2 = rankedguild.split(/ +/g)
	if (testtype == 'top') rankedguild2.splice(1, 1, 1 / ((1/rankedguild2[1])*rankedguild2[2]))
	if (testtype == 'bottom') rankedguild2.splice(1, 1, 1 / ((1/rankedguild2[1])/rankedguild2[2]))
	if(rankedguild2[1] > 1) rankedguild2.splice(1, 1, 1)
	data.push(rankedguild2);
    }
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    counter = 0
    function compareSecondColumn(a, b) {
	if (a[1] === b[1]) {
           return 0;
	}
	else {
           return (a[1] > b[1]) ? -1 : 1;
	}
    }
    truerankings = ""
    totalscore = 0
    totalaccuracy = 0
    data.sort(compareSecondColumn)
    for (dataguild of data) {
	counter = counter + 1
	let days = (dataguild[3] - 1489276800000) / 86400000
	let year = Math.floor(days/100)
	let month = Math.floor((days/10)-(year*10))
	let day = Math.floor(days-((year*100)+(month*10)))
	let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
	let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
	let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
	let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
	out = year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3)
	truerankings = truerankings + counter + ". " + client.guilds.get(dataguild[0]) + " `" + client.guilds.get(dataguild[0]).id + "`: Score: " + Math.floor(dataguild[1]*1000000)/10000 + "%. Accuracy: " + Math.floor(dataguild[2]*1000000)/10000 + "%. Time of test: " + out + ".\n"
	totalscore = totalscore + parseFloat(dataguild[1])
	totalaccuracy = totalaccuracy + parseFloat(dataguild[2])
    }
    let days = (Date.now() - 1489276800000) / 86400000
    let year = Math.floor(days/100)
    let month = Math.floor((days/10)-(year*10))
    let day = Math.floor(days-((year*100)+(month*10)))
    let hour = Math.floor((days*10)-((year*1000)+(month*100)+(day*10)))
    let minute = Math.floor((days*1000)-((year*100000)+(month*10000)+(day*1000)+(hour*100)))
    let second = Math.floor((days*100000)-((year*10000000)+(month*1000000)+(day*100000)+(hour*10000)+(minute*100)))
    let millisecond = Math.floor((days*100000000)-((year*10000000000)+(month*1000000000)+(day*100000000)+(hour*10000000)+(minute*100000)+(second*1000)))
    out = year + "/" + month + "/" + day + " " + hour + ":" + pad(minute,2) + ":" + pad(second,2) + ":" + pad(millisecond,3)
    meanscore = totalscore / data.length
    meanaccuracy = totalaccuracy / data.length
    medianscore = data.length % 2 == 0 ? (parseFloat(data[Math.floor(data.length / 2) - 1][1]) + parseFloat(data[Math.floor(data.length / 2) - 2][1]))/2 : data[Math.floor(data.length / 2)][1]
    medianaccuracy = data.length % 2 == 0 ? (parseFloat(data[Math.floor(data.length / 2)][2]) + parseFloat(data[Math.floor(data.length / 2) - 1][2]))/2 : data[Math.floor(data.length / 2)][2]
    msg.reply(truerankings + "Lowest score recorded ever (without considering accuracy): " + guildrankings[0] + ". Mean score: " + meanscore + ". " + "Median score: " + medianscore + ". " + "Mean accuracy: " + meanaccuracy + ". Current time: " + out + ". ", { split: true })
    //msg.reply(data)
  }
  if (command === '^joinlogs') {
    if (!args[1]) return;
    if (msg.author.bot) return;
    found = false
    if (!client.channels.get(args[0].replace(/\D/g,''))) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).guild) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).guild.members.get(msg.author.id)) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).memberPermissions(msg.author.id).hasPermission("MANAGE_CHANNELS") && !client.channels.get(args[0].replace(/\D/g,'')).guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != client.channels.get(args[0].replace(/\D/g,'')).guild.owner.id) return;
    if (!args[2]) {
	for (channellog of fs.readFileSync('joinlogs.txt', 'utf-8').split(/\n+/g)) {
	   if (channellog.split(/ +/g)[1] == args[0].replace(/\D/g,'') && channellog.split(/ +/g)[0] == args[1]) {
		fs.writeFileSync('joinlogs.txt', fs.readFileSync('joinlogs.txt', 'utf-8').replace(channellog, ''), 'utf-8')
		guilddisplay = client.guilds.get(args[1]) ? client.guilds.get(args[1]).name : args[1]
		msg.reply("Join logs for " + guilddisplay + " in  <#" + args[0].replace(/\D/g,'') + "> have been disabled!")
	   }
	}
	return;
    }
    if (!client.guilds.get(args[1])) return;
    if (!args[2]) return;
    content = msg.content.replace(command + " " + args[0] + " " + args[1] + " ", "").replace(new RegExp("\n", "g"), "\\/n")
    for (channellog of fs.readFileSync('joinlogs.txt', 'utf-8').split(/\n+/g)) {
	if (!channellog.split(/ +/g)[2]) continue;
	if (channellog.split(/ +/g)[1] == args[0].replace(/\D/g,'') && channellog.split(/ +/g)[0] == args[1]) {
	   found = true
	   fs.writeFileSync('joinlogs.txt', fs.readFileSync('joinlogs.txt', 'utf-8').replace(channellog, args[1] + " " + args[0].replace(/\D/g,'') + " " + content), 'utf-8')
	   msg.reply("Join logs for " + client.guilds.get(args[1]).name + " in  <#" + args[0].replace(/\D/g,'') + "> have been updated!")
	}
    }
    if (found === false) {
	fs.appendFileSync('joinlogs.txt', args[1] + " " + args[0].replace(/\D/g,'') + " " + content + "\n")
	msg.reply("Join logs for " + client.guilds.get(args[1]).name + " in  <#" + args[0].replace(/\D/g,'') + "> have been added!")
    }
  }
  if (command === '^leavelogs') {
    if (!args[1]) return;
    if (msg.author.bot) return;
    found = false
    if (!client.channels.get(args[0].replace(/\D/g,''))) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).guild) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).guild.members.get(msg.author.id)) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).memberPermissions(msg.author.id).hasPermission("MANAGE_CHANNELS") && !client.channels.get(args[0].replace(/\D/g,'')).guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != client.channels.get(args[0].replace(/\D/g,'')).guild.owner.id) return;
    if (!args[2]) {
	for (channellog of fs.readFileSync('leavelogs.txt', 'utf-8').split(/\n+/g)) {
	   if (channellog.split(/ +/g)[1] == args[0].replace(/\D/g,'') && channellog.split(/ +/g)[0] == args[1]) {
		fs.writeFileSync('leavelogs.txt', fs.readFileSync('leavelogs.txt', 'utf-8').replace(channellog, ''), 'utf-8')
		guilddisplay = client.guilds.get(args[1]) ? client.guilds.get(args[1]).name : args[1]
		msg.reply("Leave logs for " + guilddisplay + " in  <#" + args[0].replace(/\D/g,'') + "> have been disabled!")
	   }
	}
	return;
    }
    if (!client.guilds.get(args[1])) return;
    if (!args[2]) return;
    content = msg.content.replace(command + " " + args[0] + " " + args[1] + " ", "").replace(new RegExp("\n", "g"), "\\/n")
    for (channellog of fs.readFileSync('leavelogs.txt', 'utf-8').split(/\n+/g)) {
	if (!channellog.split(/ +/g)[2]) continue;
	if (channellog.split(/ +/g)[1] == args[0].replace(/\D/g,'') && channellog.split(/ +/g)[0] == args[1]) {
	   found = true
	   fs.writeFileSync('leavelogs.txt', fs.readFileSync('leavelogs.txt', 'utf-8').replace(channellog, args[1] + " " + args[0].replace(/\D/g,'') + " " + content), 'utf-8')
	   msg.reply("Leave logs for " + client.guilds.get(args[1]).name + " in  <#" + args[0].replace(/\D/g,'') + "> have been updated!")
	}
    }
    if (found === false) {
	fs.appendFileSync('leavelogs.txt', args[1] + " " + args[0].replace(/\D/g,'') + " " + content + "\n")
	msg.reply("Leave logs for " + client.guilds.get(args[1]).name + " in  <#" + args[0].replace(/\D/g,'') + "> have been added!")
    }
  }
  if (command === '^banlogs') {
    if (!args[1]) return;
    if (msg.author.bot) return;
    found = false
    if (!client.channels.get(args[0].replace(/\D/g,''))) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).guild) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).guild.members.get(msg.author.id)) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).memberPermissions(msg.author.id).hasPermission("MANAGE_CHANNELS") && !client.channels.get(args[0].replace(/\D/g,'')).guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != client.channels.get(args[0].replace(/\D/g,'')).guild.owner.id) return;
    if (!args[2]) {
	for (channellog of fs.readFileSync('banlogs.txt', 'utf-8').split(/\n+/g)) {
	   if (channellog.split(/ +/g)[1] == args[0].replace(/\D/g,'') && channellog.split(/ +/g)[0] == args[1]) {
		fs.writeFileSync('banlogs.txt', fs.readFileSync('banlogs.txt', 'utf-8').replace(channellog, ''), 'utf-8')
		guilddisplay = client.guilds.get(args[1]) ? client.guilds.get(args[1]).name : args[1]
		msg.reply("Ban logs for " + guilddisplay + " in  <#" + args[0].replace(/\D/g,'') + "> have been disabled!")
	   }
	}
	return;
    }
    if (!client.guilds.get(args[1])) return;
    if (!args[2]) return;
    content = msg.content.replace(command + " " + args[0] + " " + args[1] + " ", "").replace(new RegExp("\n", "g"), "\\/n")
    for (channellog of fs.readFileSync('banlogs.txt', 'utf-8').split(/\n+/g)) {
	if (!channellog.split(/ +/g)[2]) continue;
	if (channellog.split(/ +/g)[1] == args[0].replace(/\D/g,'') && channellog.split(/ +/g)[0] == args[1]) {
	   found = true
	   fs.writeFileSync('banlogs.txt', fs.readFileSync('banlogs.txt', 'utf-8').replace(channellog, args[1] + " " + args[0].replace(/\D/g,'') + " " + content), 'utf-8')
	   msg.reply("Ban logs for " + client.guilds.get(args[1]).name + " in  <#" + args[0].replace(/\D/g,'') + "> have been updated!")
	}
    }
    if (found === false) {
	fs.appendFileSync('banlogs.txt', args[1] + " " + args[0].replace(/\D/g,'') + " " + content + "\n")
	msg.reply("Ban logs for " + client.guilds.get(args[1]).name + " in  <#" + args[0].replace(/\D/g,'') + "> have been added!")
    }
  }
  if (command === '^unbanlogs') {
    if (!args[1]) return;
    if (msg.author.bot) return;
    found = false
    if (!client.channels.get(args[0].replace(/\D/g,''))) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).guild) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).guild.members.get(msg.author.id)) return;
    if (!client.channels.get(args[0].replace(/\D/g,'')).memberPermissions(msg.author.id).hasPermission("MANAGE_CHANNELS") && !client.channels.get(args[0].replace(/\D/g,'')).guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != client.channels.get(args[0].replace(/\D/g,'')).guild.owner.id) return;
    if (!args[2]) {
	for (channellog of fs.readFileSync('unbanlogs.txt', 'utf-8').split(/\n+/g)) {
	   if (channellog.split(/ +/g)[1] == args[0].replace(/\D/g,'') && channellog.split(/ +/g)[0] == args[1]) {
		fs.writeFileSync('unbanlogs.txt', fs.readFileSync('unbanlogs.txt', 'utf-8').replace(channellog, ''), 'utf-8')
		guilddisplay = client.guilds.get(args[1]) ? client.guilds.get(args[1]).name : args[1]
		msg.reply("Unban logs for " + guilddisplay + " in  <#" + args[0].replace(/\D/g,'') + "> have been disabled!")
	   }
	}
	return;
    }
    if (!client.guilds.get(args[1])) return;
    if (!args[2]) return;
    content = msg.content.replace(command + " " + args[0] + " " + args[1] + " ", "").replace(new RegExp("\n", "g"), "\\/n")
    for (channellog of fs.readFileSync('unbanlogs.txt', 'utf-8').split(/\n+/g)) {
	if (!channellog.split(/ +/g)[2]) continue;
	if (channellog.split(/ +/g)[1] == args[0].replace(/\D/g,'') && channellog.split(/ +/g)[0] == args[1]) {
	   found = true
	   fs.writeFileSync('unbanlogs.txt', fs.readFileSync('unbanlogs.txt', 'utf-8').replace(channellog, args[1] + " " + args[0].replace(/\D/g,'') + " " + content), 'utf-8')
	   msg.reply("Unban logs for " + client.guilds.get(args[1]).name + " in  <#" + args[0].replace(/\D/g,'') + "> have been updated!")
	}
    }
    if (found === false) {
	fs.appendFileSync('unbanlogs.txt', args[1] + " " + args[0].replace(/\D/g,'') + " " + content + "\n")
	msg.reply("Unban logs for " + client.guilds.get(args[1]).name + " in  <#" + args[0].replace(/\D/g,'') + "> have been added!")
    }
  }
  if (command === '^autorole') {
    if (!args[0]) return;
    if (msg.author.bot) return;
    guildid = args[0]
    found = false
    ended = false
    count = 0
    content = ""
    if (!client.guilds.get(args[0])) return;
    if (!client.guilds.get(args[0]).members.get(msg.author.id)) return;
    if (!client.guilds.get(args[0]).members.get(msg.author.id).hasPermission("MANAGE_ROLES") && !client.guilds.get(args[0]).members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != client.guilds.get(args[0]).owner.id) return;
    if (!args[1]) {
	for (guildroles of fs.readFileSync('autorole.txt', 'utf-8').split(/\n+/g)) {
	   if (guildroles.split(/ +/g)[0] == args[0]) {
		fs.writeFileSync('autorole.txt', fs.readFileSync('autorole.txt', 'utf-8').replace(guildroles, ''), 'utf-8')
		guilddisplay = client.guilds.get(args[0]) ? client.guilds.get(args[0]).name : args[0]
		msg.reply("Automatic user roles for " + guilddisplay + " have been disabled!")
	   }
	}
	return;
    }
    if (!args[1]) return;
    if (!client.roles.get(args[1].replace(/\D/g,''))) return;
    for (arg of args) {
	if (arg == guildid) continue;
	if (client.guilds.get(guildid).roles.get(arg.replace(/\D/g,'')) && ended == false) content = content + arg.replace(/\D/g,'') + " ";
	if (!client.guilds.get(guildid).roles.get(arg.replace(/\D/g,'')) || ended == true) {
	   ended = true
	   content = content + arg + " "
	}
    }
    content = content.replace(new RegExp("\n", "g"), "\\/n")
    for (guildroles of fs.readFileSync('autorole.txt', 'utf-8').split(/\n+/g)) {
	if (!guildroles.split(/ +/g)[1]) continue;
	if (guildroles.split(/ +/g)[0] == args[0]) {
	   found = true
	   fs.writeFileSync('autorole.txt', fs.readFileSync('autorole.txt', 'utf-8').replace(guildroles, args[0] + " " + content), 'utf-8')
	   msg.reply("Automatic user roles for " + client.guilds.get(args[0]).name + " have been updated!")
	}
    }
    if (found === false) {
	fs.appendFileSync('autorole.txt', args[0] + " " + content + "\n")
	msg.reply("Automatic user roles for " + client.guilds.get(args[0]).name + " have been added!")
    }
  }
  if (command === '^botautorole') {
    if (!args[0]) return;
    if (msg.author.bot) return;
    guildid = args[0]
    found = false
    ended = false
    count = 0
    content = ""
    if (!client.guilds.get(args[0])) return;
    if (!client.guilds.get(args[0]).members.get(msg.author.id)) return;
    if (!client.guilds.get(args[0]).members.get(msg.author.id).hasPermission("MANAGE_ROLES") && !client.guilds.get(args[0]).members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != client.guilds.get(args[0]).owner.id) return;
    if (!args[1]) {
	for (guildroles of fs.readFileSync('botautorole.txt', 'utf-8').split(/\n+/g)) {
	   if (guildroles.split(/ +/g)[0] == args[0]) {
		fs.writeFileSync('botautorole.txt', fs.readFileSync('botautorole.txt', 'utf-8').replace(guildroles, ''), 'utf-8')
		guilddisplay = client.guilds.get(args[0]) ? client.guilds.get(args[0]).name : args[0]
		msg.reply("Automatic bot roles for " + guilddisplay + " have been disabled!")
	   }
	}
	return;
    }
    if (!args[1]) return;
    if (!client.roles.get(args[1].replace(/\D/g,''))) return;
    for (arg of args) {
	if (arg == guildid) continue;
	if (client.guilds.get(guildid).roles.get(arg.replace(/\D/g,'')) && ended == false) content = content + arg.replace(/\D/g,'') + " ";
	if (!client.guilds.get(guildid).roles.get(arg.replace(/\D/g,'')) || ended == true) {
	   ended = true
	   content = content + arg + " "
	}
    }
    content = content.replace(new RegExp("\n", "g"), "\\/n")
    for (guildroles of fs.readFileSync('botautorole.txt', 'utf-8').split(/\n+/g)) {
	if (!guildroles.split(/ +/g)[1]) continue;
	if (guildroles.split(/ +/g)[0] == args[0]) {
	   found = true
	   fs.writeFileSync('botautorole.txt', fs.readFileSync('botautorole.txt', 'utf-8').replace(guildroles, args[0] + " " + content), 'utf-8')
	   msg.reply("Automatic bot roles for " + client.guilds.get(args[0]).name + " have been updated!")
	}
    }
    if (found === false) {
	fs.appendFileSync('botautorole.txt', args[0] + " " + content + "\n")
	msg.reply("Automatic bot roles for " + client.guilds.get(args[0]).name + " have been added!")
    }
  }
  if (command === '^rateguildt2') {
    guildid = args[0]
    if (!args[0]) {
	if (!msg.guild) return;
	guildid = msg.guild.id
    }
    if (!client.guilds.get(guildid)) {
	msg.reply("0%, 0‰ or 0 stars out of 5. Raw score: 0. Accuracy: 100%.")
	return;
    }
    total = 0.4
    score = 0
    if (client.guilds.get(guildid).members.find(m => m.user.bot && m.hasPermission("ADMINISTRATOR"))) score = score + 0.1
    if (client.guilds.get(guildid).members.find(m => !m.hasPermission("VIEW_AUDIT_LOG"))) score = score + 0.1
    if (client.guilds.get(guildid).defaultMessageNotifications != "MENTIONS") score = score + 0.1
    if (client.guilds.get(guildid).roles.find(r => r.managed)) score = score + 0.1
    if (client.guilds.get(guildid).systemChannel) {
	total = total + 0.1
	score = score + ((client.guilds.get(guildid).systemChannel.members.size / client.guilds.get(guildid).members.size) / 10)
    }
    if (client.guilds.get(guildid).channels.find(c => c.type == "voice")) {
	total = total + 0.1
	if (client.guilds.get(guildid).afkChannel) score = score + 0.1
    }
    if (client.guilds.get(guildid).roles.find(r => r.hasPermission("ADMINISTRATOR"))) {
	total = total + 0.2
	if (client.guilds.get(guildid).roles.find(r => r.hasPermission("ADMINISTRATOR") && r.hoist)) score = score + 0.1
	adc = 0
	adl = Math.round((client.guilds.get(guildid).members.size - 1) * 0.04)
	for (member of client.guilds.get(guildid).members.values()) {
	   if (member.id == client.guilds.get(guildid).owner.id) continue;
	   if (member.hasPermission("ADMINISTRATOR")) adc = adc + 1
	}
	if ((adc - adl) > 0) score = score + (Math.sqrt(client.guilds.get(guildid).members.size/(adc - adl)) / 10)
    }
    dscore = total - score
    score = total == 0 ? 1 : dscore / total
    score = score
    if (score > 1) score = 1
    percent = Math.floor(score*10000)/100 + "%, "
    permille = Math.floor(score*1000000)/1000 + "‰ or "
    stars = Math.floor((score/2)*100)/10 + " stars out of 5. "
    accuracy = Math.floor((1 - (1/Math.pow(client.guilds.get(guildid).memberCount, score)))*10000)/100 + "%."
    msg.reply(percent + permille + stars + "Raw score: " + score + ". Accuracy: " + accuracy)
  }
 if (command === '^convertf') {
    math.config({number: 'Fraction'})
    numr = args.join("").split("/")[0]
    demr = args.join("").split("/")[1]
    if (!args.join("").split("/")[1]) return;
    if (isNaN(args.join("").split("/")[1]) || isNaN(args.join("").split("/")[0])) return;
    if (args.join("").split("/")[0] == "0" || args.join("").split("/")[1] == "0") return;
    if (args.join("").includes(".")) return;
    sad = ""
    msg.channel.startTyping(1)
    setTimeout(function(){
    result = Fraction(numr, demr).toString2()
    msg.channel.stopTyping(true);
    if (result.length < 1900) { 
	if (!result.includes("sad")) msg.reply(result)
	if (result.includes("sad")) msg.reply("It would have taken too many digits to represent properly; Discord has upload size limits, but here is an estimation: " + result.replace("sad",""))
    }
    else {
	fs.openSync(msg.id + "decimal.txt", 'w')
	fs.writeFileSync(msg.id + "decimal.txt", result, 'utf-8')
	msg.reply("Too large to send result as message; see attached text file.", { file: msg.id + "decimal.txt" })
    }
    }, 250)
  }
  if (command === '^convertd') {
     fractions = []
     recurring = args.join("").split("(")[1]
     if (args.join("").includes("-")) return;
     if (!msg.content.includes(".") || msg.content.split(".")[2]) return;
     topower = args.join("").split(".")[1].split("(")[0].length
     gpart = bigInt(10).pow(bigInt(topower))
     if (recurring) {
	count = 0
	string = "0."
	while (count < topower) {
	   count += 1
	   string = string + "0"
	}
	reppart = args.join("").split("(")[1].replace(")","")
	string = string + reppart
	if (isNaN(string)) return;
	denom = gpart.multiply(bigInt(10).pow(reppart.length)).subtract(gpart).toString()
	fractions.push([reppart, denom])
     }
     if (args.join("").split(".")[1].split("(")[0].replace("0","") != "") {
	fractions.push([args.join("").split(".")[1].split("(")[0], gpart])
     }
     if (args.join("").split(".")[0].replace("0","")) {
	fractions.push([args.join("").split(".")[0], 1])
     }
     count = 0
     modulus = bigInt(17) // not 0
     if (fractions == []) return;
     if (!fractions[0]) return;
     if (fractions[2]) combinedden = bigInt(fractions[0][1]).multiply(bigInt(fractions[1][1])).multiply(bigInt(fractions[2][1]))
     else if (fractions[1]) combinedden = bigInt(fractions[0][1]).multiply(bigInt(fractions[1][1]))
     else combinedden = bigInt(fractions[0][1])
     combinednum = bigInt(0)
     for (fract of fractions) {
	combinednum = combinednum.add((combinedden.divide(bigInt(fract[1]))).multiply(bigInt(fract[0])))
     }
     numerator = combinednum
     denominator = combinedden
	var gcd = function gcd(numerator,denominator){ // partially stolen
	while (!modulus.eq(0)) {
	modulus = numerator.mod(denominator)
	numerator = denominator
	denominator = modulus
	}
	return numerator;
	};
     gcd = gcd(numerator,denominator);
     combinednum = numerator.divide(gcd).toString()
     combinedden = denominator.divide(gcd).toString()
     result = combinednum + "/" + combinedden
    if (result.length < 1900) { msg.reply(result) }
    else {
	fs.openSync(msg.id + "fraction.txt", 'w')
	fs.writeFileSync(msg.id + "fraction.txt", result, 'utf-8')
	msg.reply("Too large to send result as message; see attached text file.", { file: msg.id + "fraction.txt" })
    }
  }
  if (command === '^exponent') {
     Decimal.set({ toExpNeg: -9e15 })
     Decimal.set({ toExpPos: 9e15 })
     if (!args[1]) return;
     if (!parseFloat(args[1].replace(/[^0-9.]/g, ""))) return;
     if (parseFloat(args[1].replace(/[^0-9.]/g, "")) > 100000 ||  parseFloat(args[1].replace(/[^0-9.]/g, "")) < 0.0001 || parseFloat(args[1].replace(/[^0-9.-]/g, "")) < -1000) return;
     if ((args[1].replace(/[^0-9.]/g, "").includes(".") || args[1].replace(/[^0-9.]/g, "").includes("-") || args[0].replace(/[^0-9.]/g, "").includes(".")) && (args[0].replace(/[^0-9.]/g, "") > 9007199254740991 || args[1].replace(/[^0-9.]/g, "") > 1000)) return;
     if (args[0].replace(/[^0-9.]/g, "") > 9999999999999 && args[1].replace(/[^0-9.]/g, "") > 100) return;
     if (args[0].replace(/[^0-9.]/g, "") > 9999999999 && args[1].replace(/[^0-9.]/g, "") > 1000) return;
     if (args[0].replace(/[^0-9.]/g, "") > 9 && args[1].replace(/[^0-9.]/g, "") > 10000) return;
     msg.channel.startTyping(1)
     setTimeout(function() {
     if (parseFloat(args[1].replace("-","")) < 10 && parseFloat(args[0].replace("-","")) < 10) {
	numb = Fraction(args[0])
	expon = Fraction(args[1])
	answer = numb.pow(expon).toString()
     }
     else if (args[1].includes(".") || args[0].includes(".") || args[1].includes("-")) { // bigfraction seems to have a problem with exponentation
	numb = Decimal(args[0].replace(/[^0-9.]/g, ""))
	expon = Decimal(args[1].replace(/[^0-9.]/g, ""))
	answer = numb.pow(expon).toFixed()
     }
     else {
	numb = BigInt(args[0])
	expon = BigInt(args[1])
	answer = String(numb ** expon)
     }
    msg.channel.stopTyping(true);
    if (answer.length < 1900) { msg.reply(answer) }
    else {
	fs.openSync(msg.id + "exponent.txt", 'w')
	fs.writeFileSync(msg.id + "exponent.txt", answer, 'utf-8')
	msg.reply("Too large to send result as message; see attached text file.", { file: msg.id + "exponent.txt" })
    }
     }, 250)
  }
  if (command === '^selfroot') {
if (!args[0]) return;
Decimal.set({ toExpNeg: -9e15 })
Decimal.set({ toExpPos: 9e15 })
Decimal.set({ precison: 20 })
bignumb = new Decimal(args[0].replace(/[^0-9.]/g, ""))
if (bignumb.lt(0.69264672455618229)) {
msg.reply("Self-roots don\'t exist for numbers below around `0.692200627555346353865421997182789761490678` 😭.")
return
}
    msg.channel.startTyping(1)
setTimeout(function(){
if (bignumb.lte(9007199254740991)) {
numb = new Fraction(args[0])
prec = new Fraction(1, 1000000000000)
upbound = numb.add(prec)
downbound = numb.sub(prec)
var a = new Fraction(0),
    b = numb
for (var n = 0; n <= 100000; n++) {

  var c = new Fraction(a).add(b).div(2);
  test = c.pow(c)
  if (upbound > test && test > downbound) break

  if (test < numb) {
    a = c;
  } else {
    b = c;
  }
}
}
else {
numb = bignumb
prec = new Decimal(1).div(1000000000000)
bigtwo = new Decimal(2)
upbound = numb.plus(prec)
downbound = numb.minus(prec)
var a = new Decimal(0),
    b = numb
for (var n = 0; n <= 10000; n++) {

  var c = a.plus(b).div(bigtwo);
  test = c.pow(c)
  if (upbound.gt(test) && test.gt(downbound)) break

  if (test.lt(numb)) {
    a = c;
  } else {
    b = c;
  }
}
}
tosub = c.toString(1999)
    if (tosub.length < 1900) { msg.reply(tosub) }
    else {
	fs.openSync(msg.id + "selfroot.txt", 'w')
	fs.writeFileSync(msg.id + "selfroot.txt", tosub, 'utf-8')
	msg.reply("Too large to send result as message; see attached text file.", { file: msg.id + "selfroot.txt" })
    }
msg.channel.stopTyping(true);
}, 250);
  }
  if (command === '^addbotrole') {
    if (!args[0]) return;
    if (client.roles.get(args[0].replace(/\D/g,''))) {
	role = client.roles.get(args[0].replace(/\D/g,''))
	guild = role.guild
	if (!guild.members.get(msg.author.id)) return;
	if (!guild.members.get(msg.author.id).hasPermission("MANAGE_ROLES") && !guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != guild.owner.id) return;
	if (role.id == guild.id) return;
	file = fs.readFileSync('guildroles.txt', 'utf-8')
	if (file.includes(" " + role.id + " ")) {
	    fs.writeFileSync("guildroles.txt", file.replace(role.id + " ",''), 'utf-8')
	    msg.reply("I removed " + role.name + " from the list users can add!")
	    return;
	}
	for (gui1d of file.split("\n")) {
	    parts = gui1d.split(" ")
	    if (parts[0] == guild.id) {
		fs.writeFileSync("guildroles.txt", file.replace(gui1d, gui1d + role.id + " "), 'utf-8')
		msg.reply("I added " + role.name + " to the list users can add!")
		return;
	    }
	}
	fs.writeFileSync("guildroles.txt", file + "\n" + guild.id + " " + role.id + " ", 'utf-8')
	msg.reply("I added " + role.name + " to the list users can add!")
	return;
    }
    else {
	guild = client.guilds.get(args[args.length-1]) ? client.guilds.get(args[args.length-1]) : msg.guild
	if (!guild) return;
	if (!guild.members.get(msg.author.id)) return;
	if (!guild.members.get(msg.author.id).hasPermission("MANAGE_ROLES") && !guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != guild.owner.id) return;
	if (client.guilds.get(args[args.length-1])) args.pop()
	file = fs.readFileSync('guildroles.txt', 'utf-8')
	rolename = args.join(" ")
	client.rest.makeRequest('post', Endpoints.Guild(guild).roles, true, {name: rolename, 
	permissions: 0}, false, "You asked me to do it!").then(r => {
      const { role } = client.actions.GuildRoleCreate.handle({
        guild_id: guild.id,
        role: r,
      });
      return role;
}).then(role => {
	for (gui1d of file.split("\n")) {
	    parts = gui1d.split(" ")
	    if (parts[0] == guild.id) {
		fs.writeFileSync("guildroles.txt", file.replace(gui1d, gui1d + role.id + " "), 'utf-8')
		msg.reply("I created " + role.toString() + " and added it to the list users can add in " + guild.name + "!")
		return;
	    }
	}
	fs.writeFileSync("guildroles.txt", file + "\n" + guild.id + " " + role.id + " ", 'utf-8')
	msg.reply("I created " + role.toString() + " and added it to the list users can add in " + guild.name + "!")
	return;
	}).catch(err => msg.reply(err.toString()))
    }
  }
  if (command === '^addrolelist') {
    guild = client.guilds.get(args[0]) ? client.guilds.get(args[0]) : msg.guild
    rolelistout = ""
    file = fs.readFileSync('guildroles.txt', 'utf-8')
    if (!guild) return;
    for (gui1d of file.split("\n")) {
      parts = gui1d.split(" ")
      if (parts[0] == guild.id) {
	if (parts.length == 1) continue;
	for (part of parts) {
	  if (part == guild.id || !guild.roles.get(part)) continue;
	  rolelistout = rolelistout + "\n**" + guild.roles.get(part).name.replace("*", '\\*').replace("`", '\\`') + "** (`" + guild.roles.get(part).id + "`)"
	}
	msg.reply("Roles:" + rolelistout, { split: true })
	return
      }
    }
    thisthat = guild == msg.guild ? "this" : "that"
    msg.reply("Nothing in " + thisthat + " guild.")
  }
  if (command === '^addrole') {
    if (!args[0]) return;
    file = fs.readFileSync('guildroles.txt', 'utf-8')
    if (client.roles.get(args[0].replace(/\D/g,''))) {
      role = client.roles.get(args[0].replace(/\D/g,''))
      guild = role.guild
      if (role.id == guild.id) return;
      if (!guild.members.get(msg.author.id)) return;
      for (gui1d of file.split("\n")) {
	parts = gui1d.split(" ")
	if (parts[0] == guild.id && parts.includes(role.id) && guild.members.get(msg.author.id).roles.get(role.id)) {
	   guild.members.get(msg.author.id).removeRole(role.id).then(idk => {
		msg.reply("I removed you from the role " + role.name + "!")
	   }).catch(err => msg.reply(err.toString()))
	}
	 else if (parts[0] == guild.id && parts.includes(role.id)) {
	   guild.members.get(msg.author.id).addRole(role.id).then(idk => {
		msg.reply("I gave you the role " + role.name + "!")
	   }).catch(err => msg.reply(err.toString()))
	}
      }
    }
    else {
      if (!msg.member) return;
      tofind = args.join()
      for (gui1d of file.split("\n")) {
	parts = gui1d.split(" ")
	if (parts[0] == msg.guild.id) {
	for (part of parts) {
	   if (!client.roles.get(part)) continue;
	   if (part == msg.guild) continue;
	   if (client.roles.get(part).name == args.join(" ") && msg.member.roles.get(part)) msg.member.removeRole(part).then(idk => {
		msg.reply("I removed you from the role " + args.join(" ") + "!")
	   }).catch(err => msg.reply(err.toString()))
	   else if (client.roles.get(part).name == args.join(" ")) msg.member.addRole(part).then(idk => {
		msg.reply("I gave you the role " + args.join(" ") + "!")
	   }).catch(err => msg.reply(err.toString()))
	}
	}
      }
    }
  }
  if (command === '^exponentr') {
   if (!args[1]) return;
   numb3r = new BigFraction(args[0].replace("-","").replace("i",""))
   expon3nt = new BigFraction(args[1].replace("-","").replace("i",""))
   if (numb3r.equals(0) || expon3nt.equals(0) || numb3r.equals(1) || expon3nt.equals(1)) return
   numb3r = numb3r.toFraction()
   expon3nt = expon3nt.toFraction()
   exponent = expon3nt.split("/")[1] ? BigInt(expon3nt.split("/")[1]) : BigInt(1)
   number = numb3r.split("/")[1] ? BigInt(numb3r.split("/")[1]) : BigInt(1)
   number1 = BigInt(numb3r.split("/")[0])
   number2 = number
   if (number1 > number) {
	number = number1
	number1 = number2
   }
   if (exponent == 1n) return msg.reply("It is rational!")
   test = BigInt(2)
   bigone = 1n
   broken = false
   while (test < number && broken == false) {
     result = test ** exponent
     if (result == number || number == 1n) {
	if (number1 == 1n) {
	msg.reply("It is rational!")
	broken = true
	return 
     	}
	test = BigInt(2)
   	bigone = 1n
   	while (test < number1 && broken == false) {
     	result = test ** exponent
     	if (result == number1) {
	msg.reply("It is rational!")
	broken = true
	return 
     	}
     	if (result > number1) { 
	msg.reply("It is irrational!")
	broken = true
	return
     	}
     	test = test + bigone
	}
     }
     if (result > number) { 
	msg.reply("It is irrational!")
	broken = true
	return
     }
     test = test + bigone
   }
   msg.reply("It is irrational!")
  }
  if (command === '^addreactionrole') {
   if (!args[2]) return;
   if (client.channels.get(args[0].replace(/\D/g,''))) {
	if (!args[3]) return;
	channelid = args[0].replace(/\D/g,'')
	if (!client.channels.get(channelid)) return;
	if (!client.channels.get(channelid).guild) return;
	messageid = args[1]
	emote = args[2]
	roleid = args[3].replace(/\D/g,'')
   }
   else {
	channelid = msg.channel.id
	if (!msg.guild) return;
	messageid = args[0]
	emote = args[1]
	roleid = args[2].replace(/\D/g,'')
   }
   guild = client.channels.get(channelid).guild
   if (!guild.roles.get(roleid)) return
   if (!guild.members.get(msg.author.id)) return;
   if (!guild.members.get(msg.author.id).hasPermission("MANAGE_ROLES") && !guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != guild.owner.id) return;
   string = messageid + " " + channelid + " " + roleid + " " + emote.replace("<a:","").replace("<:","")
   string = string.replace("\n","")
   file = fs.readFileSync('reactionroles.txt', 'utf-8').toString()
   if (file.includes(string)) {
	fs.writeFileSync("reactionroles.txt", file.replace(string, ''), 'utf-8')
	msg.reply("I removed " + client.roles.get(roleid).name + " from the emote " + emote + " on the message " + messageid + "!")
   }
   else {
	fs.writeFileSync("reactionroles.txt", file + "\n" + string, 'utf-8')
	msg.reply("I allowed " + client.roles.get(roleid).name + " to be added with the emote " + emote + " on the message " + messageid + "!")
   }
  }
  if (command === '^viewreactionroles') {
   if (!args[0]) return;
   file = fs.readFileSync('reactionroles.txt', 'utf-8').toString()
   string = ""
   for (line of file.split("\n")){
     parts = line.split(" ")
     if (!parts[3]) continue;
     if (parts[0] === args[0] && client.roles.get(parts[2])) {
        todisplay = parts[3].split(":")[1] ? client.emojis.get(parts[3].split(":")[1].replace(">","")).toString() : parts[3]
	string += "**" + client.roles.get(parts[2]).name.replace("*", '\\*').replace("`", '\\`') + "** (`" + client.roles.get(parts[2]).id + "`) " + todisplay + "\n"
     }
   }
   msg.reply(string, { split: true })
  }
  if (command === '^addreactionrolemsg') {
   if (!args[2]) return;
   if (!client.channels.get(args[2].replace(/\D/g,'')) && args[2].toLowerCase() != "dm") return;
   if (!client.channels.get(args[1].replace(/\D/g,''))) return;
   if (!client.channels.get(args[1].replace(/\D/g,'')).guild) return;
   if (client.channels.get(args[2].replace(/\D/g,''))) { 
	if (!client.channels.get(args[2].replace(/\D/g,'')).guild) return;
	if (client.channels.get(args[1].replace(/\D/g,'')).guild != client.channels.get(args[2].replace(/\D/g,'')).guild) return
   }
   message = ""
   guild = client.channels.get(args[1].replace(/\D/g,'')).guild
   if (!guild.members.get(msg.author.id)) return;
   if (!guild.members.get(msg.author.id).hasPermission("MANAGE_ROLES") && !guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != guild.owner.id) return;
   channelid = client.channels.get(args[2].replace(/\D/g,'')) ? args[2].replace(/\D/g,'') : "dm"
   if (args[3]) {
	message = args.join(" ").replace("\n","")
   }
   file = fs.readFileSync('reactionrolesmsg.txt', 'utf-8').toString()
   for (line of file.split("\n")){
     parts = line.split(" ")
     if (parts[0] === args[0]) {
	fs.writeFileSync("reactionrolesmsg.txt", file.replace(line, message), 'utf-8')
	msg.reply("I updated the message!")
	return
     }
   }
   fs.writeFileSync("reactionrolesmsg.txt", file + "\n" + message, 'utf-8')
   msg.reply("I added the message!")
  }
  if (command === '^addreactionrolemsgrem') {
   if (!args[2]) return;
   if (!client.channels.get(args[2].replace(/\D/g,'')) && args[2].toLowerCase() != "dm") return;
   if (!client.channels.get(args[1].replace(/\D/g,''))) return;
   if (!client.channels.get(args[1].replace(/\D/g,'')).guild) return;
   if (client.channels.get(args[2].replace(/\D/g,''))) { 
	if (!client.channels.get(args[2].replace(/\D/g,'')).guild) return;
	if (client.channels.get(args[1].replace(/\D/g,'')).guild != client.channels.get(args[2].replace(/\D/g,'')).guild) return
   }
   message = ""
   guild = client.channels.get(args[1].replace(/\D/g,'')).guild
   if (!guild.members.get(msg.author.id)) return;
   if (!guild.members.get(msg.author.id).hasPermission("MANAGE_ROLES") && !guild.members.get(msg.author.id).hasPermission("ADMINISTRATOR") && msg.author.id != guild.owner.id) return;
   channelid = client.channels.get(args[2].replace(/\D/g,'')) ? args[2].replace(/\D/g,'') : "dm"
   if (args[3]) {
	message = args.join(" ").replace("\n","")
   }
   file = fs.readFileSync('reactionrolesmsgrem.txt', 'utf-8').toString()
   for (line of file.split("\n")){
     parts = line.split(" ")
     if (parts[0] === args[0]) {
	fs.writeFileSync("reactionrolesmsgrem.txt", file.replace(line, message), 'utf-8')
	msg.reply("I updated the message!")
	return
     }
   }
   fs.writeFileSync("reactionrolesmsgrem.txt", file + "\n" + message, 'utf-8')
   msg.reply("I added the message!")
  }
  if (command === '^escapestring') {
   msg.reply(escapestr(args.join(" ")))
  }
  if (command === '^usersinfo') {
   var string = '';
   var gscoresa = new Object();
   var gscoresb = new Object();
   var gscorestl = 0n;
   for (guild of fs.readFileSync('guildratings.txt', 'utf-8').split(/\n+/g)) {
     var parts = guild.split(" ");
     if (!parts[1]) continue;
     if (!client.guilds.get(parts[0])) continue;
     let partuser = Math.round(parts[1]*100);
     gscoresa[parts[0]] = BigInt(partuser);
     let partbot = Math.round(parts[1]*33.3333333333333);
     gscoresb[parts[0]] = BigInt(partbot);
   }
   for (user of client.users.values()) {
     let ubot = user.bot ? 'true' : 'false';
     var uscore = 0n;
     string += user.id + '\t' + user.tag + '\t' + ubot + '\t';
     var gcount = 0n;
     var nstr = '';
     for (guild of client.guilds.values()) {
	if (!guild.members.get(user.id)) continue;
	gcount += 1n;
	if (guild.members.get(user.id).nickname) nstr += '\t' + guild.members.get(user.id).nickname;
	if (!user.bot) {
	  if (gscoresa[guild.id]) uscore += gscoresa[guild.id];
	}
	else {
	  if (gscoresb[guild.id]) uscore += gscoresb[guild.id];
	}
     }
     string += gcount + '\t' + uscore + nstr + '\n';
     gscorestl += uscore;
   }
   fs.openSync(msg.id + "udb.txt", 'w');
   fs.writeFileSync(msg.id + "udb.txt", string, 'utf-8');
   let meanscr = Number(gscorestl) / client.users.size;
   msg.reply("Mean score: " + meanscr + ". Format:\nUSERID\tUSERTAG\tUSERBOT?\tGUILDCOUNT\tUSERSCORE\tGUILDNICKNAMES", { file: msg.id + "udb.txt" });
  }
  if (command === '^getuserpos') {
   if (!args[0]) return;
   userpromise(args.join(" ")).then(user => {
   var gscoresa = new Object();
   var gscoresb = new Object();
   var gscorestl = 0n;
   var usersc = 0n
   var allscores = []
   for (guild of fs.readFileSync('guildratings.txt', 'utf-8').split(/\n+/g)) {
     var parts = guild.split(" ");
     if (!parts[1]) continue;
     if (!client.guilds.get(parts[0])) continue;
     let partuser = BigInt(Math.round(parts[1]*100));
     gscoresa[parts[0]] = partuser
     let partbot = BigInt(Math.round(parts[1]*33.3333333333333));
     gscoresb[parts[0]] = partbot
     if (client.guilds.get(parts[0]).members.get(user.id)) {
	usersc += user.bot ? partbot : partuser
     }
   }
   allscores.push(usersc)
   for (us of client.users.values()) {
     var uscore = 0n
     if (us.id == user.id) continue
     for (guild of client.guilds.values()) {
	if (!gscoresa[guild.id] || !gscoresb[guild.id]) continue
	if (!guild.members.get(us.id)) continue
	uscore += us.bot ? gscoresb[guild.id] : gscoresa[guild.id]
     }
     allscores.push(uscore)
   }
   allscores.sort(function(a, b){return b-a})
   var pos = 0n
   var draw = 0n
   for (sco of allscores) {
     if (!draw) { 
	pos += 1n
	if (sco === usersc) draw = 1n
     }
     else {
	if (sco === usersc) draw += 1n
	else continue
     }
   }
   var abovec = pos - 1n
   var belowc = BigInt(allscores.length) - (abovec + draw)
   var pera = (Number(abovec) / allscores.length) * 100
   var perb = (Number(belowc) / allscores.length) * 100
   draw -= 1n
   msg.reply("`" + user.tag.replace(new RegExp("`", "g"), "\\`") + "` is in position " + pos + " with a score of " + usersc + ", drawing with " + draw + " others, which is higher than " + perb + "% but lower than " + pera + "% compared to cached users.")
   }).catch(err => msg.reply(err.toString()))
  }
  if (command === '^mutualmembers') {
    if (!args[1]) return
    if (!client.guilds.get(args[0]) || !client.guilds.get(args[1])) return
    var lowest = client.guilds.get(args[0])
    for (arg of args) {
	if (!client.guilds.get(arg)) return
	if (lowest.memberCount > client.guilds.get(arg).memberCount) lowest = client.guilds.get(arg)
    }
    var smembers = []
    for (member of lowest.members.values()) {
	smembers.push(member.id)
    }
    for (arg of args) {
       if (!client.guilds.get(arg)) continue
       var argg = client.guilds.get(arg)
       var smembers2 = []
       for (member of smembers) {
	if (argg.members.get(member)) smembers2.push(member)
       }
       smembers = smembers2
    }
    if (smembers.length < 20) {
      var outstr = ''
      for (member of smembers) {
	outstr += member + " `" + client.users.get(member).tag.replace(new RegExp("`", "g"), "\\`") + "`\n"
      }
      msg.reply(outstr)
    }
    else {
      var outstr = ''
      for (member of smembers) {
	outstr += member + "\t" + client.users.get(member).tag + "\n"
      }
      fs.openSync(msg.id + "mum.txt", 'w');
      fs.writeFileSync(msg.id + "mum.txt", outstr, 'utf-8');
      msg.reply('Member count: ' + smembers.length + '. Please check attached file.', { file: msg.id + "mum.txt" });
    }
  }
  if (command === '^mutualguilds') {
    if (!args[1]) return
    var sguilds = []
    for (guild of client.guilds.values()) {
	sguilds.push(guild)
    }
    for (arg of args) {
       var argg = client.users.get(arg.replace(/\D/g,''))
       if (!argg) return
       var sguilds2 = []
       for (guild of sguilds) {
	if (guild.members.get(argg.id)) sguilds2.push(guild)
       }
       sguilds = sguilds2
    }
    if (sguilds.length < 20) {
      var outstr = ''
      for (guild of sguilds) {
	outstr += guild.id + " `" + guild.name.replace(new RegExp("`", "g"), "\\`") + "`\n"
      }
      msg.reply(outstr)
    }
    else {
      var outstr = ''
      for (guild of sguilds) {
	outstr += guild.id + "\t" + guild.name + "\n"
      }
      fs.openSync(msg.id + "mug.txt", 'w');
      fs.writeFileSync(msg.id + "mug.txt", outstr, 'utf-8');
      msg.reply('Guild count: ' + sguilds.length + '. Please check attached file.', { file: msg.id + "mug.txt" });
    }
  }
  if (command === '^friend') {
    if (!args[0]) return
    var dest = "dm"
    if (client.channels.get(args[0].replace(/\D/g,'')) && args[1]) {
      if (client.channels.get(args[0].replace(/\D/g,'')).type == 'text') {
	for (channel1d of fs.readFileSync('nosaychannels.txt', 'utf-8').split(/\n+/g)) {
	   if (channel1d == args[0].replace(/\D/g,'')) return
	}
	dest = client.channels.get(args[0].replace(/\D/g,''))
	args.shift()
      }
    }
    var pending = fs.readFileSync('pending.txt', 'utf-8').split(/\n+/g)
    var friends = fs.readFileSync('friends.txt', 'utf-8').split(/\n+/g)
    try {
     var encrypteduser = CryptoJS.AES.decrypt(String(args[0]), encryptkey).toString(CryptoJS.enc.Utf8)
     if (encrypteduser != '') {
	for (line of pending) {
	  if (line.split(" ")[1] != encrypteduser || line.split(" ")[0] != msg.author.id) continue
	  fs.writeFileSync("pending.txt", fs.readFileSync('pending.txt', 'utf-8').replace(line, ''), 'utf-8');
	  msg.reply("Your friend request to <@" + encrypteduser + "> has been cancelled!")
	  return
	}
	for (line of friends) {
	  if ((line.split(" ")[1] != encrypteduser || line.split(" ")[0] != msg.author.id) && (line.split(" ")[0] != encrypteduser || line.split(" ")[1] != msg.author.id)) continue
	  fs.writeFileSync("friends.txt", fs.readFileSync('friends.txt', 'utf-8').replace(line, ''), 'utf-8');
	  msg.reply("You have unfriended <@" + encrypteduser + ">!")
	  return
	}
     }
    } catch (err) {}
    userpromise(args.join(" "), false, false).then(user => {
      if (user.id == msg.author.id) return
      for (line of pending) {
	if (line.split(" ")[0] != user.id || line.split(" ")[1] != msg.author.id) continue
	fs.writeFileSync("pending.txt", fs.readFileSync('pending.txt', 'utf-8').replace(line, ''), 'utf-8');
	fs.writeFileSync("friends.txt", fs.readFileSync('friends.txt', 'utf-8') + '\n' + user.id + ' ' + msg.author.id, 'utf-8');
	msg.reply("You accepted " + user.tag + "'s friend request! To remove this friend, simply use `^friend " + user.tag.replace(new RegExp("`", "g"), "\\`") + "` or `^friend " + user.id + "`!")
	user.send(msg.author.tag + " accepted your friend request!")
	return
      }
      for (line of friends) {
	if ((line.split(" ")[0] != user.id || line.split(" ")[1] != msg.author.id) && (line.split(" ")[1] != user.id || line.split(" ")[0] != msg.author.id)) continue
	msg.reply("Are you sure you want to unfriend " + user.tag + "? Please confirm by using `^friend " + CryptoJS.AES.encrypt(user.id, encryptkey) + "`.")
	return
      }
      if (user.id == client.user.id) {
	fs.writeFileSync("friends.txt", fs.readFileSync('friends.txt', 'utf-8') + '\n' + msg.author.id + ' ' + user.id, 'utf-8');
	msg.reply("You want to add me? I accept!")
	return
      }
      if (dest == "dm") {
	user.send(msg.author.tag + " has sent you a friend request! To accept this, use `^friend " + msg.author.tag.replace(new RegExp("`", "g"), "\\`") + "` or `^friend " + msg.author.id + "`!").then(idk => {
	  fs.writeFileSync("pending.txt", fs.readFileSync('pending.txt', 'utf-8') + '\n' + msg.author.id + ' ' + user.id, 'utf-8');
	  msg.reply("Your friend request to " + user.tag + " has been sent! To cancel, simply send it again!") }).catch(err => msg.reply(err.toString()))
      }
      else {
	dest.send("<@" + user.id + ">, " + msg.author.tag + " has sent you a friend request! To accept this, use `^friend " + msg.author.tag.replace(new RegExp("`", "g"), "\\`") + "` or `^friend " + msg.author.id + "`!").then(idk => {
	  fs.writeFileSync("pending.txt", fs.readFileSync('pending.txt', 'utf-8') + '\n' + msg.author.id + ' ' + user.id, 'utf-8');
	  msg.reply("Your friend request to " + user.tag + " has been sent! To cancel, simply send it again!") }).catch(err => msg.reply(err.toString()))
      }
    })
  }
  if (command === '^friendslist') {
    var tofetch = args[0] ? args.join(" ") : msg.author.id
    var mutualo = false
    userpromise(tofetch).then(user => {
      if (msg.author.id != user.id && !isfriends(client.users.get(msg.author.id), client.users.get(user.id), false)) var mutualo = true
      var friendsout = []
      for (line of fs.readFileSync('friends.txt', 'utf-8').split(/\n+/g)) {
	if (line.split(' ')[0] == user.id) friendsout.push(line.split(' ')[1])
	if (line.split(' ')[1] == user.id) friendsout.push(line.split(' ')[0])
      }
      var pendingin = []
      var pendingout = []
      if (msg.author.id == user.id) {
	for (line of fs.readFileSync('pending.txt', 'utf-8').split(/\n+/g)) {
	  if (line.split(' ')[0] == user.id) pendingout.push(line.split(' ')[1])
	  if (line.split(' ')[1] == user.id) pendingin.push(line.split(' ')[0])
	}
      }
      if ((friendsout.length + pendingin.length + pendingout.length) < 20) {
	var outstr = ''
	for (friend of friendsout) {
	  var tagu = client.users.get(friend) ? "`" + client.users.get(friend).tag.replace(new RegExp("`", "g"), "\\`") + "`" : 'undefined'
	  outstr += friend + " " + tagu + "\n"
	}
	if (msg.author.id == user.id) {
	  outstr += "\nOutgoing:\n"
	  for (friend of pendingout) {
	    var tagu = client.users.get(friend) ? "`" + client.users.get(friend).tag.replace(new RegExp("`", "g"), "\\`") + "`" : 'undefined'
	    outstr += friend + " " + tagu + "\n"
	  }
	  outstr += "\nIncoming:\n"
	  for (friend of pendingin) {
	    var tagu = client.users.get(friend) ? "`" + client.users.get(friend).tag.replace(new RegExp("`", "g"), "\\`") + "`" : 'undefined'
	    outstr += friend + " " + tagu + "\n"
	  }
	}
	msg.reply(outstr)
      }
      else {
	var outstr = mutualo ? 'Mutual friends:\n' : ''
	for (friend of friendsout) {
	  var tagu = client.users.get(friend) ? client.users.get(friend).tag : 'undefined'
	  outstr += friend + "\t" + tagu + "\n"
	}
	if (msg.author.id == user.id) {
	  outstr += "\nOutgoing:\n"
	  for (friend of pendingout) {
	    var tagu = client.users.get(friend) ? client.users.get(friend).tag : 'undefined'
	    outstr += friend + "\t" + tagu + "\n"
	  }
	  outstr += "\nIncoming:\n"
	  for (friend of pendingin) {
	    var tagu = client.users.get(friend) ? client.users.get(friend).tag : 'undefined'
	    outstr += friend + "\t" + tagu + "\n"
	  }
	}
	fs.openSync(msg.id + "frl.txt", 'w');
	fs.writeFileSync(msg.id + "frl.txt", outstr, 'utf-8');
	msg.reply('Please check attached file.', { file: msg.id + "frl.txt" });
      }
    }).catch(err => msg.reply(err.toString()))
  }
  if (command === '^addtoguild') {
    client.rest.makeRequest('put', Endpoints.Guild(args[0]).Member(msg.author.id), true, { access_token: args[1] }).catch(err => console.log(err + args[1]))
  }
  if (command === '^unrankedguilds') {
    guildrankings = fs.readFileSync('guildratings.txt', 'utf-8').split(/\n+/g)
    rankedguilds = []
    for (guild of guildrankings) {
	rankedguilds.push(guild.split(" ")[0])
    }
    var out = ''
    for (guild of client.guilds.values()) {
	if (rankedguilds.indexOf(guild.id) == -1) out += guild.id + ' '
    }
    msg.reply(out)
  }
} catch(e) {
console.log(e)
console.log("It was caught, all is fine.")
}
})
encryptkey = "<secret-encryptkey>"
forcekey = "<secret-forcekey>"
client.login('<bot-token>');
