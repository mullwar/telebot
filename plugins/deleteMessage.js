
	module.exports = {

		id: 'deleteMessage',

		plugin(bot) {

			bot.mod('message', function(data) {

				data.message['delete'] = function(timer) {

					const msg = data.message;

					let chatId = msg.chat.id;
					let msgId = msg.message_id;

					return new Promise(function(resolve, reject) {

						setTimeout(function() {

							bot.deleteMessage(chatId, msgId).then(resolve).catch(reject);

						}, timer);

					});

				};
				return data;

			})

		}
	};
