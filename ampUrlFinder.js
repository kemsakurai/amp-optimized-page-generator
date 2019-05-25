const https = require('https');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: 'ATTR' });
const fs = require('fs');
const config = require('./config.js');

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
                    let resultUrls = []
                    for (const elem of result.urlset.url) {
                      resultUrls.push(elem.loc[0]);
                    }
                    resolve(resultUrls);
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

function getUrlAmpUrlRelation(url) {
    const p = new Promise((resolve) => {  
        https.get(url, function(res) {
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
                result.url = url;
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
async function syncGetUrlAmpUrlRelations(resultUrls) {
    let urlAmpUrlRelations = new Array();
    for (resultUrl of resultUrls) {
        await getUrlAmpUrlRelation(resultUrl).then((result) => {
            if(result) {
                urlAmpUrlRelations.push(result);
            }
        /* eslint-disable-next-line no-console */
        }).catch((e) => console.log(e));
    }
    return urlAmpUrlRelations;
}


const promise = getUrlsFromSitemap();

promise.then((resultUrls) => {
  syncGetUrlAmpUrlRelations(resultUrls).then((results) => {
    fs.writeFileSync('./urlAmpUrlRelations.json', results.join('\n'));
  })
  /* eslint-disable-next-line no-console */
}).catch((e) => console.log(e));
