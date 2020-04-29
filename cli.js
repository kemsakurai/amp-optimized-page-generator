const { program } = require('commander');
const initialize = require('./commands/initialize.js');
const saveUrl = require('./commands/saveUrl.js');
const saveAmpUrl = require('./commands/saveAmpUrl.js');
const dumpData = require('./commands/dumpData.js');


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

program.parse(process.argv);
