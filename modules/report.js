/*
  Name: Report
  Description: Reports events (and their data) to user list.
  Bot Options: {
    report: {
      // Event list
      <event name>: [<id list>]
    }
  },
  Action Options: {
    skipReport: true // Skips report
  }
*/

module.exports = function(bot) {
  // Read bot config data
  var opt = bot.cfg.report;
  if (typeof opt !== 'object') return;
  var eventList = Object.keys(opt);
  // Create events handler
  bot.on(eventList, function(event, info) {
    // Skip event with "skipReport: true" option key
    if (
      Object.prototype.toString.call(event) == '[object Arguments]' &&
      (Array.prototype.slice.call(event).slice(-1)[0]).skipReport === true
    ) return;
    // Process event
    event = event || {};
    var type = info.type, to = opt[type];
    if (!to || !to.length) return;
    if (typeof to == 'string') to = [to];
    // Stringify object data
    var jsonData = JSON.stringify(event, function(key, value) {
      return value.value instanceof Buffer ? '[Buffer]' : value;
    });
    // Send to every user in list
    for (var id of to) {
      if (type == 'error') {
        // Error event
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
          id, '⏰ Event: ' + type + '\n' +
          (jsonData && jsonData != '{}' ? '💾 Data: ' + jsonData : ''),
          { skipReport: true }
        );
      }
    }
  });
};
