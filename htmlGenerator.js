const ampOptimizer = require('amp-toolbox-optimizer');
const https = require('https');
const fs = require('fs');
const readline = require("readline");
const runtimeVersion = require('amp-toolbox-runtime-version');

function getAmpRuntimeVersion() {
  const p = new Promise((resolve) => {  
    let ampRuntimeVersion = runtimeVersion.currentVersion();  
    resolve(ampRuntimeVersion)
  });
  return p;
}

function createTransformedHtml(jsonRow) {
  
  const elems = jsonRow.ampUrl.split('/');
  let fileName = elems[elems.length -2];
  fileName = fileName.slice(0, 100) + '.html';
  const canonicalUrl = jsonRow.url;
  const p = new Promise((resolve) => {
    https.get(jsonRow.ampUrl, function(res) {
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
                  fs.writeFile('./htmls/' + fileName, optimizedHtml, 'utf8', (error) => {
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
  for (let jsonRow of resultUrls) {
    await createTransformedHtml(jsonRow).then((filename) => {
      /* eslint-disable-next-line no-console */
      console.log(filename + ' WRITE DONE')
    })
  }
}

function getAmpUrlFromFile() {
  let results = new Array();
  let lines = fs.readFileSync("./urlAmpUrlRelations.json").toString().split('\n');
  for (line of lines) {
    results.push(JSON.parse(line));
  }
  return results;
}

let results = getAmpUrlFromFile();
syncCreateFiles(results);
