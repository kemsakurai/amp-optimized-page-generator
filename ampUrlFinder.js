const https = require('https');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: 'ATTR' });
const config = require('./config.js');
const {Task, TaskManageRepository} = require('./dbUtils.js');

function getUrlsFromSitemap() {
  const p = new Promise((resolve, reject) => {  
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
  return p;
}

function getUrlAmpUrlRelation(siteMapResult) {
    console.log(siteMapResult);
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

function filterTargetSave(siteMapResults) {
    let results = [];
    for (let siteMapResult of siteMapResults) {
        let task = TaskManageRepository.selectByUrl(siteMapResult.url);
        if(task && task.url === siteMapResult.url && task.lastmod === siteMapResult.lastmod) {
            continue;
        }
        results.push(new Task(siteMapResult.url, "", siteMapResult.lastmod, ));
    }
    return results;
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

// --------------------------
// Main
// -------------------------- 
const promise = getUrlsFromSitemap();
promise.then((siteMapResults) => {
    let inputs = filterTargetSave(siteMapResults);
    syncGetUrlAmpUrlRelations(inputs).then((results) => {
        for (let result of results) {
            TaskManageRepository.save(Task.constructByJsonElem(result));
        }
    })
    /* eslint-disable-next-line no-console */
}).catch((e) => console.log(e));
