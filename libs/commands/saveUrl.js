const https = require('https');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: 'ATTR' });
const config = require('../../config.js');
const {Task, TaskManageRepository} = require('../database/tasks.js');

module.exports = function() {
    const promise = getUrlsFromSitemap();
    promise.then((siteMapResults) => {        
        const promiseFilterTargetSave = filterTargetSave(siteMapResults);
            promiseFilterTargetSave.then((targets) => {
                for (let target of targets) {
                    TaskManageRepository.save(Task.constructByJsonElem(target));
                }
            /* eslint-disable-next-line no-console */
            }).catch((e) => console.log(e));

    /* eslint-disable-next-line no-console */
    }).catch((e) => console.log(e));
}

function getUrlsFromSitemap() {
  const promise = new Promise((resolve, reject) => {  
    https.get(config.siteMapUrl, function(res) {
        let data = '';
        res.on('data', function(stream) {
            data += stream;
        });
        res.on('end', function(){
            parser.parseString(data, function(error, result) {
                if(error === null) {
                    let results = []
                    for (const elem of result.urlset.url) {
                        let sitemapElement = {};
                        sitemapElement.url = elem.loc[0];
                        if(elem.lastmod) {
                            sitemapElement.lastmod = elem.lastmod[0]
                        } else {
                            sitemapElement.lastmod = elem.lastmod;
                        }
                        results.push(sitemapElement);
                    }
                    resolve(results);
                }
                else {
                    reject(error);
                }
            });
        });
    });
  });
  return promise;
}

async function filterTargetSave(siteMapResults) {
    let results = [];
    for (let siteMapResult of siteMapResults) {
        let task = await TaskManageRepository.selectByUrl(siteMapResult.url);
        if(task && task.url === siteMapResult.url && (!task.lastmod || task.lastmod === siteMapResult.lastmod)) {
            continue;
        }
        results.push(Task.constructBeforeSaveUrl(siteMapResult.url, siteMapResult.lastmod));
    }
    return results;
}
