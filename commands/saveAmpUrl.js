const https = require('https');
const cheerio = require('cheerio');
const config = require('../config.js');
const {Task, TaskManageRepository} = require('../libs/dbUtils.js');

module.exports = function() {
    // Data取得
    const promise = TaskManageRepository.selectByStatusBeForeSaveAMPUrl();
    // Data更新
    promise.then((result) => {
        syncGetUrlAmpUrlRelations(result).then((results) => {
            for (let result of results) {
                TaskManageRepository.save(Task.constructByJsonElem(result));
            }
        })
    });
}

function getUrlAmpUrlRelation(siteMapResult) {
    const p = new Promise((resolve) => {
        https.get(siteMapResult.url, function(res) {
          let data = '';
          res.on('data', function(stream) {
              data += stream;
          });
          res.on('end', function(){
            const $ = cheerio.load(data);
            let link = $("link[rel='amphtml']");
            let result = new Object();
            result.url = siteMapResult.url;
            result.lastmod = siteMapResult.lastmod;
            if(link) {                
                result.ampUrl = config.domainUrl + link.attr('href');
                result.status = "DONE";
            } else {
                result.ampUrl = null;
                result.status = "FAILED";
            }
            resolve(result);
        });
      });
    });
    return p;
}

async function syncGetUrlAmpUrlRelations(inputs) {
    let urlAmpUrlRelations = new Array();
    for (let inputData of inputs) {
        await getUrlAmpUrlRelation(inputData).then((result) => {
            urlAmpUrlRelations.push(result);
        /* eslint-disable-next-line no-console */
        }).catch((e) => console.log(e));
    }
    return urlAmpUrlRelations;
}
