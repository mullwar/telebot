/*
  Name: Report
  Description: Reports events (and their data) to user list.
  Module options: {
    report: {
      events: [<event list>]
      to: [<id list>]
    }
  },
  Method options: {
    skipReport: true // Skips report
  }
*/

'use strict';

module.exports = (bot, cfg) => {

  // Read bot config data
  const opt = cfg.report;
  
  // If no module options
  if (typeof opt != 'object')
    return console.error('[report] no config data');

  // Get lists
  let toList = Array.isArray(opt.to) ? opt.to : [];
  let eventList = Array.isArray(opt.events) ? opt.events : [];
  
  // Check lists
  if (!toList.length)
    return console.error('[report] no user list');
  if (!eventList.length)
    return console.error('[report] no event list');

  // Create events handler
  bot.on(eventList, (event={}, props, info) => {

    // Skip event with "skipReport: true" option key
    if (
      Object.prototype.toString.call(event) == '[object Arguments]' &&
      (Array.prototype.slice.call(event).slice(-1)[0]).skipReport === true
    ) return;
    
    const type = info.type;
    const prefix = type.split('.')[0];
    
    // Stringify object data
    const jsonData = s(JSON.stringify(event, (k, v) => {
      return v.value instanceof Buffer ? '[Buffer]' : v;
    }));


    // Send to every user in list
    for (let id of toList) {

      if (prefix == 'error') {

        // Error event
        const { data, error } = event;

        bot.sendMessage(id,
          `👤 <b>User:</b> ${ data.from.id } (${ data.chat.id })\n` +
          `⚠ <b>Error:</b> ${ error.message || error }\n` +
          `${ error.stack ? `🚧 <b>Stack:</b>\n${ s(error.stack) }\n` : '' }` +
          `⏰ <b>Event:</b> ${ type }\n` +
          `💾 <b>Data:</b> ${ jsonData }`,
          { parse: 'html', skipReport: true }
        );

      } else {

        // Another type of event
        bot.sendMessage(id,
          `⏰ <b>Event:</b> ${ type }\n` +
          (jsonData && jsonData != '{}' ? `💾 <b>Data:</b> ${ jsonData }` : ''),
          { parse: 'html', skipReport: true }
        );

      }

    }

  });

};

// Safe string function
function s(str) {
  return String(str).replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
