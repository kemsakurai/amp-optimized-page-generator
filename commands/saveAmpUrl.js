const https = require('https');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: 'ATTR' });
const config = require('./config.js');
const {Task, TaskManageRepository} = require('./dbUtils.js');

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
            if(link) {
                let result = new Object();
                result.ampUrl = config.domainUrl + link.attr('href');
                result.url = siteMapResult.url;
                result.lastmod = siteMapResult.lastmod;
                result.status = siteMapResult.status;
                resolve(JSON.stringify(result));
            } else {
                let result = null;
                resolve(result);
            }
        });
      });
    });
    return p;
}

async function syncGetUrlAmpUrlRelations(inputs) {
    let urlAmpUrlRelations = new Array();
    for (let inputData of inputs) {
        if (inputData.status === "DONE") {
            urlAmpUrlRelations.push(inputData);
        } else {
            await getUrlAmpUrlRelation(inputData).then((result) => {
                if(result) {
                    urlAmpUrlRelations.push(result);
                }
            /* eslint-disable-next-line no-console */
            }).catch((e) => console.log(e));
        }
    }
    return urlAmpUrlRelations;
}
