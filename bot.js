const Discord = require('discord.js');
const client = new Discord.Client();
var cli = new Discord.Client({autoReconnect:true});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setGame('^help')
});
client.on("guildMemberAdd", user => {
})



client.on('message', msg => {
  const prefix = "^"

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === 'help') {
    msg.author.send('I will be offline most of the time. You should contact <@226602566912442370> and/or join https://discord.gg/2k6NAzu. Source code is available at `https://github.com/brmbrmcar/brmbrmbot/blob/master/bot.js`.')
    msg.author.send('Commands \n`^help` Shows this dialogue \n`^invite` Shows an invite for this bot \n`^convert [input] [amount]` Converts between decimal and imperial time units, use just `^convert help` for more information \n`^time` Shows decimal time in format `hours`:`minutes`:`seconds` \n`^roleping [rolename]` Shows the code needed to mention a role \n`^rolepingext [rolename] [guildID]` Shows the code needed to mention a role in another guild \n`^rolelist {guildID}` Shows a list of all roles, with ping codes (optional guild ID for other guilds) \n`^everyone {guildID}` Shows how to mention everyone individually (optional guild ID for other guilds) \n`^everyonehide {guildID}` Shows how to mention everyone individually like with `^everyone` but will show the pings by ID \n`^message [userID/mention] [message]` Allows the messaging of another user through a user ID (user must share a guild with the bot) \n`^messageanon [userID/mention] [message]` Allows the messaging of another user through a user ID anonymously \n`^say [channelID/mention] [message]` Allows the messaging of another channel through a channel ID (bot must be able to write messages to it) \n`^sayanon [channelID/mention] [message]` Allows the messaging of another channel through a channel ID anonymously \n`^messagein [messageID]` Shows the input of a message \n`^listguilds` Lists all the guilds the bot is a member of \n`^listchannels {guild ID}` Lists all the channels in a guild (optional guild ID for other guilds) \n`^inviteguild [guild ID]` **Attempts** to create an invite for a guild (the bot must be a member of the guild, `^invitechannel` may work better in some poorly set-up guilds) \n`^invitechannel [channelID/mention]` **Attempts** to create an invite for a channel (the bot must be a member of the guild the channel is in) \n`^seen [userID/mention]` Shows what guilds, if any, the user shares with the bot \n`^spy [channelID/mention]` Shows some recent messages in a channel (the bot must be able to read messages in the channel)');
msg.reply("Check your direct messages!")
  }
  if (command === 'help.force.' + forcekey) { //All .force  are hidden commands, DO NOT use in guilds where bot cannot delete your message, they should be for ease of testing only 
    msg.delete(0);
    msg.reply('I will be offline most of the time. You should contact <@226602566912442370> and/or join https://discord.gg/2k6NAzu. Source code is available at `https://github.com/brmbrmcar/brmbrmbot/blob/master/bot.js`.')
    msg.reply('Commands \n`^help` Shows this dialogue \n`^invite` Shows an invite for this bot \n`^convert [input] [amount]` Converts between decimal and imperial time units, use just `^convert help` for more information \n`^time` Shows decimal time in format `hours`:`minutes`:`seconds` \n`^roleping [rolename]` Shows the code needed to mention a role \n`^rolepingext [rolename] [guildID]` Shows the code needed to mention a role in another guild \n`^rolelist {guildID}` Shows a list of all roles, with ping codes (optional guild ID for other guilds) \n`^everyone {guildID}` Shows how to mention everyone individually (optional guild ID for other guilds) \n`^everyonehide {guildID}` Shows how to mention everyone individually like with `^everyone` but will show the pings by ID \n`^message [userID/mention] [message]` Allows the messaging of another user through a user ID (user must share a guild with the bot) \n`^messageanon [userID/mention] [message]` Allows the messaging of another user through a user ID anonymously \n`^say [channelID/mention] [message]` Allows the messaging of another channel through a channel ID (bot must be able to write messages to it) \n`^sayanon [channelID/mention] [message]` Allows the messaging of another channel through a channel ID anonymously \n`^messagein [messageID]` Shows the input of a message \n`^listguilds` Lists all the guilds the bot is a member of \n`^listchannels {guild ID}` Lists all the channels in a guild (optional guild ID for other guilds) \n`^inviteguild [guild ID]` **Attempts** to create an invite for a guild (the bot must be a member of the guild, `^invitechannel` may work better in some poorly set-up guilds) \n`^invitechannel [channelID/mention]` **Attempts** to create an invite for a channel (the bot must be a member of the guild the channel is in) \n`^seen [userID/mention]` Shows what guilds, if any, the user shares with the bot \n`^spy [channelID/mention]` Shows some recent messages in a channel (the bot must be able to read messages in the channel)');     
  }
  if (command === 'invite') {
    msg.reply('Invite me to your guild! `https://discordapp.com/oauth2/authorize?client_id=476875155554172930&scope=bot`');
  }
  if (command === 'convert') {
    let type = args[0]
    let amount = args[1]
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
	out = parseFloat(amount)*2.4
	msg.reply(out);
    }
    if (type === "help"){
	msg.reply("`^convert [input] [amount]` Converts between decimal and imperial time units.\nInputs \n`decs` Converts decimal seconds into imperial seconds \n`imps` Converts imperial seconds into decimal seconds \n`decm` Converts decimal minutes into imperial minutes \n`impm` Converts imperial minutes into decimal minutes \n`dech` Converts decimal hours into imperial seconds \n`imph` Converts imperial hours into decimal hours");
    }
  }
  if (command === 'time') {
    function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
    date = new Date();
    secs = date.getUTCSeconds() + (60 * date.getUTCMinutes()) + (60 * 60 * date.getUTCHours());
    dt = secs/0.864
    hours = Math.floor(dt/10000)
    minutes = Math.floor(dt/100) - (100*hours)
    seconds = Math.floor(dt) - (10000*hours) - (100*minutes)
    msg.reply(`${hours}:${pad(minutes,2)}:${pad(seconds,2)}`);
  }
  if (command === 'roleping') {
    if (msg.channel.type == "dm") return;
    let rolename = msg.content.replace("^roleping ", "");
    let role = msg.guild.roles.find(r => r.name === rolename);
    if (!role) return;
    let roleid = role.id
    msg.reply('`<@&' + roleid + '>`');
  }
  if (command === 'rolepingext') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)) return;
    let rolename = msg.content.replace("^rolepingext ", "").replace(guilde + " ", "");
    let role = client.guilds.get(guilde).roles.find(r => r.name === rolename);
    if (!role) return;
    let roleid = role.id
    msg.reply('`<@&' + roleid + '>`');
  }
  if (command === 'rolelist') {
    let guilde = args[0]
    roles = ''
    if (!client.guilds.get(guilde)){
        if (msg.channel.type == "dm") return;
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
  if (command === 'rolelist.force.' + forcekey) {
    msg.delete(0);
    let guilde = args[0]
    roles = ''
    if (!client.guilds.get(guilde)){
        if (msg.channel.type == "dm") return;
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
  
  if (command === 'everyone') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (msg.channel.type == "dm") return;
      memberlist = ""
      for (user of msg.guild.members){
        memberlist = memberlist + "`<@" + user[1].id + ">`\n "
      }
    }
    else {
      memberlist = "`"
      for (user of client.guilds.get(guilde).members){
        memberlist = memberlist + "`<@" + user[1].id + ">`\n "
      }}
    msg.author.send(memberlist, { split: true });
    msg.reply("Check your direct messages!")
  }
  if (command === 'everyonehide') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (msg.channel.type == "dm") return;
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
  if (command === 'everyone.force.' + forcekey) {
    msg.delete(0);
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (msg.channel.type == "dm") return;
      memberlist = ""
      for (user of msg.guild.members){
        memberlist = memberlist + "`<@" + user[1].id + ">`\n "
      }
    }
    else {
      memberlist = "`"
      for (user of client.guilds.get(guilde).members){
        memberlist = memberlist + "`<@" + user[1].id + ">`\n "
      }}
    msg.reply(memberlist, { split: true });
  }
  if (command === 'everyonehide.force.' + forcekey) {
    msg.delete(0);
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (msg.channel.type == "dm") return;
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
    
  if (command === 'message') {
    if (!args[0]) return;
    let usersend = args[0]
    if (!client.users.get(usersend.replace(/\D/g,''))) return;
    msg.reply("If there are no further errors, assume the message sent successfully.").then(idk => {
    let content = msg.content.replace("^message ", "").replace(usersend, "");
    client.users.get(usersend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}>.`).catch(err =>{ console.error(err);  msg.guild.members.get("476875155554172930").lastMessage.delete(0); msg.reply(err.toString());})})
  }
  if (command === 'messageanon') {
    if (!args[0]) return;
    let usersend = args[0]
    if (!client.users.get(usersend.replace(/\D/g,''))) return;
    msg.reply("If there are no further errors, assume the message sent successfully.").then(idk => {
    let content = msg.content.replace("^messageanon ", "").replace(usersend, "");
    client.users.get(usersend.replace(/\D/g,'')).send(content + `\nMessage sent by an anonymous user.`).catch(err =>{ console.error(err); msg.guild.members.get("476875155554172930").lastMessage.delete(0);
    msg.reply(err.toString()); idk = err.toString();})})
  }
  if (command === 'say') {
    if (!args[0]) return;
    let channelsend = args[0]
    let channelsendrep = channelsend.replace(/\D/g,'')
    if (!client.channels.get(channelsendrep)) return;
    msg.reply("If there are no further errors, assume the message sent successfully.").then(idk => { 
    let content = msg.content.replace("^say ", "").replace(channelsend, "");
    if (msg.channel.type == "dm") {
	client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}>.`).catch(err =>{ console.error(err); msg.guild.members.get("476875155554172930").lastMessage.delete(0);
    msg.reply(err.toString());})
    } else {
	client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by <@${msg.author.id}> from ${msg.guild.name} (${msg.guild.id}).`).catch(err =>{ console.error(err); msg.guild.members.get("476875155554172930").lastMessage.delete(0);
    msg.reply(err.toString());})}})
  }
  if (command === 'sayanon') {
    if (!args[0]) return;
    let channelsend = args[0]
    let channelsendrep = channelsend.replace(/\D/g,'')
    if (!client.channels.get(channelsendrep)) return;
    msg.reply("If there are no further errors, assume the message sent successfully.").then(idk => {
    let content = msg.content.replace("^sayanon ", "").replace(channelsend, "");
    client.channels.get(channelsend.replace(/\D/g,'')).send(content + `\nMessage sent by an anonymous user.`).catch(err =>{ console.error(err); msg.guild.members.get("476875155554172930").lastMessage.delete(0);
    msg.reply(err.toString());})})
  }
  if (command === 'messagein') {
    let msgid = args[0]
    for (channel of client.channels){
        if (client.channels.get(channel[1].id).type !== "voice") {
        if (client.channels.get(channel[1].id).type !== "category"){
	client.channels.get(channel[1].id).fetchMessage(msgid).then(message => { msg.reply('```' + message.content + '```') })}}
    }
  }
  if (command === 'listguilds') {
      guildlist = "\n"
      for (guild of client.guilds){
        guildlist = guildlist + "`" + guild[1].id + "` " + guild[1].name + "\n"
      }
    msg.reply("Check your direct messages!");
    msg.author.send(guildlist, { split: true });    
  }
  if (command === 'listguilds.force.' + forcekey) {
      msg.delete(0);
      guildlist = "\n"
      for (guild of client.guilds){
        guildlist = guildlist + "`" + guild[1].id + "` " + guild[1].name + "\n"
      }
    msg.reply(guildlist, { split: true }); 
  }
  if (command === 'listchannels') {
    channellist = "\n"
    guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (msg.channel.type == "dm") return;
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
  if (command === 'listchannels.force.' + forcekey) {
    msg.delete(0);
    channellist = "\n"
    guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (msg.channel.type == "dm") return;
      for (channel of msg.guild.channels){
        channellist = channellist + "`" + channel[1].id + "` " + "<#" + channel[1].id + "> " + channel[1].name + "\n"
      }}
    else {
      for (channel of client.guilds.get(guilde).channels){
        channellist = channellist + "`" + channel[1].id + "` " + "<#" + channel[1].id + "> " + channel[1].name + "\n"
      }}
    
    msg.reply(channellist, { split: true });   
  }
  if (command === 'inviteguild') {
    let guildid = args[0]
    if (!client.guilds.get(guildid)) return;
    if (!client.guilds.get(guildid).channels.find(c => c.position === 0)) return;
    let invchannel = client.guilds.get(guildid).channels.find(c => c.position === 0).id;
    //channelid = channel[1].id;
    client.channels.get(invchannel).createInvite().then(invite =>
    msg.channel.send(invite.url)
);
  }
  if (command === 'invitechannel') {
    if (!args[0]) return;
    let channelid = args[0].replace(/\D/g,'')
    if (!client.channels.get(channelid)) return;
    client.channels.get(channelid).createInvite().then(invite =>
    msg.channel.send(invite.url)
);
  }
  if (command === 'seen') {
      if (!args[0]) return;
      let userseenid = args[0].replace(/\D/g,'')
      let seenlist = ""
      for (guild of client.guilds){
	if (client.guilds.get(guild[1].id).members.get(userseenid))
	   {
	    seenlist = seenlist + '\n`' + guild[1].id + '` ' + guild[1].name
	   }
      }
      msg.reply(seenlist, { split: true })
  }
  if (command === 'endianswap') { // secret command because I simply don't want to have to deal with it
    swapped = ""
    for (arg of args){
	swapped = arg[0] + arg[1] + ' ' + swapped }
    msg.reply(swapped);
  }
  if (command === 'spy') {
    if (!args[0]) return;
    channelid = args[0].replace(/\D/g,'')
    if (!client.channels.get(channelid)) return;
    if (client.channels.get(channelid).type == "voice") return;
    if (client.channels.get(channelid).type == "category") return;
    client.channels.get(channelid).fetchMessages().then(messages => {
    msg.author.send(messages.map(message => message.content).join("\n"), {split:true} )})
    msg.reply("Check your direct messages!")

}
  if (command === 'spy.force.' + forcekey) { 
    if (!args[0]) return;
    channelid = args[0].replace(/\D/g,'')
    if (!client.channels.get(channelid)) return;
    if (client.channels.get(channelid).type == "voice") return;
    if (client.channels.get(channelid).type == "category") return;
    client.channels.get(channelid).fetchMessages().then(messages => {
    msg.reply(messages.map(message => message.content).join("\n"), {split:true} )})

}
})
forcekey = "<secret-forcekey>"
client.login('<bot-token>');
