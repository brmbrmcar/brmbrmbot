# brmbrmbot
Basic Discord bot running from https://github.com/brmbrmcar/discord.js/tree/stable, crypto-js and ffmpeg from terminal. This is only the code for the bot itself. Many additional libraries are necessary.
Replace &#60;bot-token&#62; with the bot's token. Replace &#60;force-secretkey&#62; with any randomly generated string WITHOUT capital letters. The forcekey should be changed frequently. Replace &#60;force-encryptkey&#62; with any randomly generated string.
https://discordapp.com/oauth2/authorize?client_id=491618805055750144&scope=bot to invite the bot (may be offline).

The empty text files with the names forcechannels.txt, messagedata.txt, nobotchannels.txt, nosaychannels.txt, nospychannels.txt and prefixchannels.txt too name a few must be created in the folder the node process is started from, or the bot will show errors very often. These files change all the time, so please recheck the code for any files needing creating.

Please see https://brmbrmcar.github.io/brmbrmbot.html for more information.
