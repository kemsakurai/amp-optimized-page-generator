const { program } = require('commander');
const initialize = require('./libs/commands/initialize.js');
const saveUrl = require('./libs/commands/saveUrl.js');
const saveAmpUrl = require('./libs/commands/saveAmpUrl.js');
const dumpData = require('./libs/commands/dumpData.js');
const ampHtmlGen = require('./libs/commands/ampHtmlGen.js');


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

program.command('genAMPHtml')
    .description('Generate AMP Html.')
    .action(ampHtmlGen);

program.parse(process.argv);
