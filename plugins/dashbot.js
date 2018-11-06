/*
	Requires "dashbot" npm package.
	
	Advanced analytics bot - https://www.dashbot.io/docs

	Create a bot to get an API key - https://dashbot.io/bots
	Platform -> Universal
*/

module.exports = {

	id: 'dashbot',
	defaultConfig: null,

	plugin(bot, config) {

		// Create a bot to get an API key - https://dashbot.io/bots
		const API_KEY = config;

		if (API_KEY) {

			const dashbot = require('dashbot')(API_KEY).universal;

			// Track every type of message
			bot.on('text', (data) => {
				const { from, text } = data,
					uName = from.first_name + " "+from.last_name;
				dashbot.logIncoming({
					"text": text,
					"userId": "USER"+from.id,
					"platformJson": JSON.stringify(data)
				});
			});
			bot.on('*', (msg, props) => {
				if(props.type == "text") return;
				dashbot.logIncoming({
					"text": props.type,
					"userId": "USER"+msg.from.id,
					"platformJson": JSON.stringify(msg)
				});
			});

		}
		else
			console.error('[dashbot] API Key not specified');

	}

};
