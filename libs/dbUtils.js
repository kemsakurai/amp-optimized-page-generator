const sqlite3 = require('sqlite3');
let database;
class DBCommon {
  static get() {
    if(!database) {
      database = new sqlite3.Database("db.sqlite3");
    }
    return database;
  }
}
exports.DBComon = DBCommon;

const BEFORE_SAVE_AMP_URL = "BEFORE_SAVE_AMP_URL";

class Task {
  constructor(url, ampUrl, lastmod, status) {
      this.url = url;
      this.ampUrl = ampUrl;
      this.lastmod = lastmod;
      this.status = status;
    }
    static constructBeforeSaveUrl(url, lastmod){
      return new Task(url, "", lastmod, BEFORE_SAVE_AMP_URL);
    }

    static constructByJsonElem(elem){
      return new Task(elem.url, elem.ampUrl, elem.lastmod, elem.status);
  }
}
exports.Task = Task;

const taskManageTableName = "tasks";

class TaskManageRepository {

  static async dropTableIfNotExists() {
    const db = DBCommon.get()
    return new Promise((resolve, reject) => {
      try {
        db.serialize(() => {
          db.run(`drop table if exists ${taskManageTableName}`)
        });
        return resolve()
      } catch (err) {
        return reject(err)
      }
    })
  }

  static async createTableIfNotExists() {
    const db = DBCommon.get()
    return new Promise((resolve, reject) => {
      try {
        db.serialize(() => {
          db.run(`create table if not exists ${taskManageTableName} (
            url text primary key,
            ampurl text,
            lastmod text,
            status text
          )`)
        })
        return resolve()
      } catch (err) {
        return reject(err)
      }
    })
  }
  static async save(task) {
    const db = DBCommon.get()
    return new Promise((resolve, reject) => {
      try {
        db.run(`insert or replace into ${taskManageTableName} 
        (url, ampUrl, lastmod, status) 
        values ($url, $ampUrl, $lastmod, $status)`,
        task.url, task.ampUrl, task.lastmod, task.status
        )
        return resolve()
      } catch (err) {
        return reject(err)
      }
    })
  }
  static async selectByUrl(url) {

    const db = DBCommon.get()
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`select url, ampUrl, lastmod, status from ${taskManageTableName} where url = $url`, url ,
          (err, row) => {
            if (err) {
              return reject(err);
            }
            if(!row) {
              return resolve();
            }
            return resolve(new Task(row["url"], row["ampUrl"], row["lastmod"], row["status"]));
          })
      })
    })
  } 
  static async selectByStatusBeForeSaveAMPUrl() {
    return selectByStatus(BEFORE_SAVE_AMP_URL);
  }

  static async selectByStatus(status) {
    const db = DBCommon.get()
    const result = [];
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`select url, ampUrl, lastmod, status from ${taskManageTableName} where status = $status`, status ,
          (err, row) => {
            if (err) {
              return reject(err);
            }
            if(!row) {
              return resolve();
            }
            rows.forEach(row => {
              result.push(new Task(row["url"], row["ampUrl"], row["lastmod"], row["status"]));
            })
            return resolve(result);
          })
      })
    })
  } 
}
exports.TaskManageRepository = TaskManageRepository;
