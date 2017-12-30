/*
    Adds RegExp support to text event messages.
*/

module.exports = {

    id: 'regExpMessage',

    plugin(bot) {

        bot.mod('text', (data) => {
            const {message, props} = data;
            const text = message.text;

            let promise = Promise.resolve();

            for (let eventType of bot.eventList.keys()) {
                if (eventType instanceof RegExp) {
                    const match = text.match(eventType);
                    if (match) {
                        props.match = match;
                        promise = promise.then(() => bot.event(eventType, message, props));
                    }
                }
            }

            data.promise = promise;

            return data;
        });

    }

};
