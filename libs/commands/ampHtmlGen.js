const AmpOptimizer = require('@ampproject/toolbox-optimizer');
const ampOptimizer = AmpOptimizer.create();
const https = require('https');
const fs = require('fs');
const runtimeVersion = require('@ampproject/toolbox-runtime-version');
const {TaskManageRepository, Status} = require('../database/tasks.js');

module.exports = function() {
  // Data取得
  const promise = TaskManageRepository.selectByStatusBeForeGenAMPHtml();
  // Data更新
  promise.then((result) => {
      for (let elem of result) {
        createTransformedHtml(elem).then((filename) => {
          console.log(`Generate AMP HTML DONE.. ${filename}`);
          elem.status = Status.DONE;
          TaskManageRepository.save(elem);
        }).catch((filename) => {
          console.log(`Generate AMP HTML FAILED.. ${filename}`);
          elem.status = Status.FAILED_AMP_HTML_GEN;
          TaskManageRepository.save(elem);
        })
      }
  });
}

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
                      reject(fileName);
                    }
                  });
                  resolve(fileName);
                }).catch((e) => reject(fileName));
            })
        });
    }).on('error', function (error) {
      reject(fileName);
    });
  });
  return p;
}
