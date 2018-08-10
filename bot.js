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
    msg.reply('I will be offline most of the time. You should contact <@226602566912442370> and/or join https://discord.gg/2k6NAzu. Source code is available at `https://github.com/brmbrmcar/brmbrmbot/blob/master/bot.js`.\nCommands \n`^help` Shows this dialogue \n`^invite` Shows an invite for this bot \n`^convert [input] [amount]` Converts between decimal and imperial time units, use just `^convert help` for more information \n`^time` Shows decimal time in format `hours`:`minutes`:`seconds` \n`^roleping [rolename]` Shows the code needed to mention a role \n`^everyone {guild ID}` Shows how to mention everyone individually (possible limit of around 100 users, optional guild ID for other guilds) \n`^everyonehide {guild ID}` Shows how to mention everyone individually like with `^everyone` but will show the pings by ID \n`^message [userID] [message]` Allows the messaging of another user through a user ID (user must share a guild with the bot) \n`^messageanon [userID] [message]` Allows the messaging of another user through a user ID anonymously \n`^messagein [messageID]` Shows the input of a message (only works for current channel) \n`^listguilds` Lists all the guilds the bot is a member of \n`^inviteguild [guild ID]` **Attempts** to create an invite for a guild (the bot must be a member of the guild) \n`^seen [user ID]` Shows what guilds, if any, the user shares with the bot');
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
  if (command === 'everyone') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (msg.channel.type == "dm") return;
      memberlist = "`"
      for (user of msg.guild.members){
        memberlist = memberlist + "<@" + user[1].id + "> "
      }
    }
    else {
      memberlist = "`"
      for (user of client.guilds.get(guilde).members){
        memberlist = memberlist + "<@" + user[1].id + "> "
      }}
    msg.reply(memberlist +'`');
  }
  if (command === 'everyonehide') {
    let guilde = args[0]
    if (!client.guilds.get(guilde)){
      if (msg.channel.type == "dm") return;
      memberlist = "`"
      for (user of msg.guild.members){
        memberlist = memberlist + "\\<@" + user[1].id + "> "
      }
    }
    else {
      memberlist = "`"
      for (user of client.guilds.get(guilde).members){
        memberlist = memberlist + "\\<@" + user[1].id + "> "
      }}
    msg.reply(memberlist +'`');
  }
  if (command === 'message') {
    let usersend = args[0]
    if (!client.users.get(usersend)) return;
    let content = msg.content.replace("^message ", "").replace(usersend, "");
    client.users.get(usersend).send(content + `\nMessage sent by <@${msg.author.id}>.`);
    msg.reply("I have seen the user at least. Don't ask if they recieved the message or not though, I think they have.");
  }
  if (command === 'messageanon') {
    let usersend = args[0]
    if (!client.users.get(usersend)) return;
    let content = msg.content.replace("^messageanon ", "").replace(usersend, "");
    client.users.get(usersend).send(content + `\nMessage sent by an anonymous user.`);
    msg.reply("I have seen the user at least. Don't ask if they recieved the message or not though, I think they have.");
  }
  if (command === 'messagein') {
    let msgid = args[0]
    msg.channel.fetchMessage(msgid).then(message => { msg.reply('```' + message.content + '```') })
  }
  if (command === 'listguilds') {
      guildlist = "`\n"
      for (guild of client.guilds){
        guildlist = guildlist + guild[1].id + " " + guild[1].name + "\n"
      }
    msg.reply(guildlist + '`');    
  }
  if (command === 'inviteguild') {
    let guildid = args[0]
    if (!client.guilds.get(guildid)) return;
    let invchannel = client.guilds.get(guildid).channels.find(c => c.position === 0).id;
    //channelid = channel[1].id;
    client.channels.get(invchannel).createInvite().then(invite =>
    msg.channel.send(invite.url)
);
  }
  if (command === 'seen') {
      let userseenid = args[0]
      let seenlist = "`"
      for (guild of client.guilds){
	if (client.guilds.get(guild[1].id).members.get(userseenid))
	   {
	    seenlist = seenlist + '\n' + guild[1].id + ' ' + guild[1].name
	   }
      }
      msg.reply(seenlist + '`')
  }
});


client.login('<bot-token>');
