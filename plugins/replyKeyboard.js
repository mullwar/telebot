/* eslint-disable indent,no-trailing-spaces */


module.exports = {

    id: 'replyKeyboard',

	defaultConfig: {
		cancelLabel: '🚪 Exit',
        labelsPerRow: 2,
		logDeleteErrors: true
	},

    plugin(bot, config) {

        bot.mod('message', (data) => {

            data.message.replyKeyboard = function(text, keyboardConfig) {

                // Extract chatId and messageId
                let chatId = this.data.message.chat.id;
                let messageId = this.data.message.message_id;

                // Delete initial message
                bot.deleteMessage(chatId, messageId).catch(() => {
                    if (config.logDeleteErrors) {
						console.log('[bot.plugin.replyKeyboard] can\'t delete message');
					}
				});

                // Create keyboard

                    // Extract labels from keyboardConfig
                    let labels = [];

                    keyboardConfig.labels.forEach(label => {
                        labels.push(label.text);
                    });

                    // Create keyboard
                    let replyMarkup = bot.keyboard(parseKeyboard(labels), {
                        resize: true,
                        once: true
                    });

                // Send keyboard

                    let askId = 'replyKeyboard.' + chatId + messageId + Math.random();
                    bot.sendMessage(chatId, text, {replyMarkup: replyMarkup, ask: askId})
                    .then(function (response) {

                        // Get messageId

                        let keyboardMsgId = response.result.message_id;

						// Create listener for response

						bot.on('ask.' + askId, function(replyMsg) {

							let option = replyMsg.text;
							let chatId = replyMsg.chat.id;
							let messageId = replyMsg.message_id;

							// Delete keyboard message
							bot.deleteMessage(chatId, keyboardMsgId).catch(() => {
								if (config.logDeleteErrors) {
									console.log('[bot.plugin.replyKeyboard] can\'t delete message');
								}
							});

							// Delete response message
							bot.deleteMessage(chatId, messageId).catch(() => {
								if (config.logDeleteErrors) {
									console.log('[bot.plugin.replyKeyboard] can\'t delete message');
								}
							});

							if (option === config.cancelLabel) {
								keyboardConfig.onCancel(replyMsg);
							} else if (labels.indexOf(option) > -1) {

								keyboardConfig.labels.forEach(label => {

									if (label.text === option) {
										label.call(replyMsg);
									}

								});

							} else {
								keyboardConfig.onUnknown(replyMsg);
							}

						}.bind({keyboardConfig}));

                    })
                    .catch(console.error);

            }.bind({bot, data});
            return data;

        });

        function parseKeyboard(labels) {

			let keyboard = [];

			let i;
			let j;
			let chunk = config.labelsPerRow;
			for (i = 0, j = labels.length; i < j; i += chunk) {
				keyboard.push(labels.slice(i, i+chunk));
			}

			// Add cancel label as last label.
			keyboard.push([config.cancelLabel]);

			return keyboard;

        }

    }

};
