const TeleBot = require('../');

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    usePlugins: ['deleteMessage']
});


/*

	Note: The telegram bot API has some limitations regarding which messages can be deleted:
	
		- A message can only be deleted if it was sent less than 48 hours ago.
		- Bots can delete outgoing messages in groups and supergroups.
		- Bots granted can_post_messages permissions can delete outgoing messages in channels.
		- If the bot is an administrator of a group, it can delete any message there.
		- If the bot has can_delete_messages permission in a supergroup or a channel, it can delete any message there.

*/

bot.on('text', msg => {

    msg.delete(100).then(function() {
		
		console.log('Message deleted');
		
	}).catch(function(error) {
		console.log('Error deleting the message :c');
		console.log(error);
	});

});

bot.start();