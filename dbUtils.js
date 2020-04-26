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

class Task {
  constructor(url, ampUrl, lastmod, status) {
      this.url = url;
      this.ampUrl = ampUrl;
      this.lastmod = lastmod;
      this.status = status;
    }
  static constructByJsonElem(elem){
      return new Task(elem.url, elem.ampUrl, elem.lastmod, elem.status);
  }
}
exports.Task = Task;

const taskManageTableName = "tasks";

class TaskManageRepository {
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
        db.get(`select url, ampUrl, lastmod, status from ${taskManageTableName} where url = ${url}`,
          (err, row) => {
            if (err) return reject(err);
            return resolve(new Task(row["url"], row["ampUrl"], row["lastmod"], row["status"]));
          })
      })
    })
  }  
}
exports.TaskManageRepository = TaskManageRepository;
