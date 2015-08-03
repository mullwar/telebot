/*
  Reporter
  Report events to user list
*/

module.exports = function(bot) {
  // Read config data
  var opt = bot.cfg.reporter;
  if (typeof opt !== 'object') return;
  var eventList = Object.keys(opt);
  // Create event handler
  bot.on(eventList, function(event, info) {
    // Skip event with 'skipReport' option key
    if (
      Object.prototype.toString.call(event) == '[object Arguments]' &&
      event[2].skipReport === true
    ) return;
    // Process event
    event = event || {};
    var type = info.type, to = opt[type].to;
    if (!to || !to.length) return;
    if (typeof to == 'string') to = [to];
    var jsonData = JSON.stringify(event, function(key, value) {
      return value.value instanceof Buffer ? '[Buffer]' : value;
    });
    for (var id of to) {
      if (type == 'error') {
        // Event is an error
        var data = event.data, error = event.error;
        var stack = error.stack ? '🚧 Stack:' + '\n' + error.stack + '\n' : '';
        bot.sendMessage(id,
          '👤 User: ' + data.from.id + ' (' + data.chat.id + ')\n' +
          '⚠ Error: ' + (error.message || error) + '\n' + stack +
          '⏰ Event: ' + type + '\n' +
          '💾 Data: ' + jsonData,
          { skipReport: true }
        );
      } else {
        // Another type of event
        bot.sendMessage(
          id, '⏰ Event: ' + type + '\n' +'💾 Data: ' + jsonData,
          { skipReport: true }
        );
      }
    }
  });
};
