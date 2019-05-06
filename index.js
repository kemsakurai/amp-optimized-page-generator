const ampOptimizer = require('amp-toolbox-optimizer');
const https = require('https');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: 'ATTR' });
const url = 'https://www.monotalk.xyz/sitemap.xml';
const fs = require('fs');
const runtimeVersion = require('amp-toolbox-runtime-version');
const cheerio = require('cheerio');
const config = require('./config');

function getAmpRuntimeVersion() {
  const p = new Promise((resolve) => {  
    let ampRuntimeVersion = runtimeVersion.currentVersion();  
    resolve(ampRuntimeVersion)
  });
  return p;
}

function getAmpUrlsFromSitemap() {
  const p = new Promise((resolve, reject) => {  
    https.get(url, function(res) {
        let data = '';
        res.on('data', function(stream) {
            data += stream;
        });
        res.on('end', function(){
            parser.parseString(data, function(error, result) {
                if(error === null) {
                    let resultUrls = []
                    for (const elem of result.urlset.url) {
                      resultUrls.push(elem.loc[0].replace('https://www.monotalk.xyz/', 'https://www.monotalk.xyz/amp/'));
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

function createTransformedHtml(url) {
  const elems = url.split('/');
  let fileName = elems[elems.length -2];
  fileName = fileName.slice(0, 100) + '.html';
  const canonicalUrl = url.replace('https://www.monotalk.xyz/amp/', 'https://www.monotalk.xyz/');
  const p = new Promise((resolve) => {
    https.get(url, function(res) {
        let data = '';
        res.setEncoding('utf8');        
        res.on('data', function(stream) {
            data += stream;
        });
        res.on('end', function() {
            getAmpRuntimeVersion().then((ampRuntimeVersion) => {
                // Additional options can be passed as the second argument
                ampOptimizer.transformHtml(data, {
                  ampUrl: canonicalUrl,
                  ampRuntimeVersion: ampRuntimeVersion
                }).then((optimizedHtml) => {
                  const $ = cheerio.load(optimizedHtml);
                  $('head').prepend( config.gtmHeadTag );
                  $('body').prepend( config.gtmNoScriptTag );
                  fs.writeFile('./htmls/' + fileName, $.html(), 'utf8', (error) => {
                    if (error) {
                      console.log(JSON.stringify(error));
                    }
                  });
                  resolve(fileName);
                  /* eslint-disable-next-line no-console */
                }).catch((e) => console.log(e));
            })
        });
    });
  });
  return p;
}

async function syncCreateFiles(resultUrls) {
  for (let url of resultUrls) {
    await createTransformedHtml(url).then((filename) => {
      /* eslint-disable-next-line no-console */
      console.log(filename + ' WRITE DONE')
    })
  }
}

const promise = getAmpUrlsFromSitemap();
promise.then((resultUrls) => {
  syncCreateFiles(resultUrls);
  /* eslint-disable-next-line no-console */
}).catch((e) => console.log(e));
