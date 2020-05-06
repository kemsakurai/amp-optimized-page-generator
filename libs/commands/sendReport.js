const nodemailer = require("nodemailer");
const fs = require('fs');
const mustache = require('mustache');
const {TaskManageRepository} = require('../database/tasks.js');
const config = require('../../config.js');
const os = require('os');
const templateDir = './templates/report/';

module.exports = function() {
    // Data取得
    const promise = TaskManageRepository.selectAll();    
    let transporter = nodemailer.createTransport(config.mailTransportSetttings);

    promise.then((result) => {
        let subject = fs.readFileSync(`${templateDir}subject.tpl`, 'utf8').toString('utf8');
        let text = fs.readFileSync(`${templateDir}textMail.tpl`, 'utf8').toString('utf8');
        let htmlMail = fs.readFileSync(`${templateDir}htmlMail.tpl`, 'utf8').toString('utf8');
        let ampHtmlMail = fs.readFileSync(`${templateDir}ampHtmlMail.tpl`, 'utf8').toString('utf8');
        
        let data = {
            tasks : result,
            date : getNowDateWithString(),
            hostname : os.hostname()
        }

        let messageConfig =  Object.assign(config.mailMessageConfig, {
                    subject: subject,
                    text: mustache.render(text, data),
                    html: mustache.render(htmlMail, data),
                    amp: mustache.render(ampHtmlMail, data),
                }
            );
        transporter.sendMail(messageConfig, (err) => {
            if(err) {
                console.log(err);
            }
        })
    });
};

function getNowDateWithString(){
    var dt = new Date();
    var y = dt.getFullYear();
    var m = ("00" + (dt.getMonth()+1)).slice(-2);
    var d = ("00" + dt.getDate()).slice(-2);
    var result = m + "/" + d + "/" + y;
    return result;
}
