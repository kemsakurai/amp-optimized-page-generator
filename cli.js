const { program } = require('commander');
const initialize = require('./libs/commands/initialize.js');
const saveUrl = require('./libs/commands/saveUrl.js');
const saveAmpUrl = require('./libs/commands/saveAmpUrl.js');
const dumpData = require('./libs/commands/dumpData.js');
const genAmpHtml = require('./libs/commands/genAmpHtml.js');
const sendReport = require('./libs/commands/sendReport.js');


program.command('init')
    .description('Initialize a sqlite database.')
    .action(initialize);

program.command('saveUrl')
    .description('Save url to database from sitemap.xml.')
    .action(saveUrl);

program.command('saveAmpUrl')
    .description('Save Amp Url to database.')
    .action(saveAmpUrl);

program.command('dumpData')
    .description('Dump data database to json.')
    .action(dumpData);

program.command('genAmpHtml')
    .description('Generate AMP Html.')
    .action(genAmpHtml);

program.command('sendReport')
    .description('Send report by mail')
    .action(sendReport);

program.parse(process.argv);
