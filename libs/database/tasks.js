const { getDatabase } = require("./dbUtils.js");

const Status = {
    BEFORE_SAVE_AMP_URL : "BEFORE_SAVE_AMP_URL",
    BEFORE_GEN_AMP_HTML : "BEFORE_GEN_AMP_HTML",
    FAILED_GET_AMP_URL : "FAILED_GET_AMP_URL",
    FAILED_GEN_AMP_HTML : "FAILED_GEN_AMP_HTML",
    DONE : "DONE"
}
exports.Status = Status;

class Task {
    constructor(url, ampUrl, lastmod, status) {
      this.url = url;
      this.ampUrl = ampUrl;
      this.lastmod = lastmod;
      this.status = status;
    }
    static constructBeforeSaveUrl(url, lastmod){
      return new Task(url, "", lastmod, Status.BEFORE_SAVE_AMP_URL);
    }
    static constructByRow(row) {
      return new Task(row["url"], row["ampurl"], row["lastmod"], row["status"]);
    }
    static constructByJsonElem(elem){
      return new Task(elem.url, elem.ampUrl, elem.lastmod, elem.status);
  }
}
exports.Task = Task;

const taskManageTableName = "tasks";

class TaskManageRepository {

  static async dropTableIfNotExists() {
    const db = getDatabase()
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
    const db = getDatabase()
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
    const db = getDatabase()
    return new Promise((resolve, reject) => {
      try {
        db.run(`insert or replace into ${taskManageTableName} 
        (url, ampurl, lastmod, status) 
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

    const db = getDatabase()
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`select url, ampurl, lastmod, status from ${taskManageTableName} where url = $url`, url ,
          (err, row) => {
            if (err) {
              return reject(err);
            }
            if(!row) {
              return resolve();
            }
            return resolve(Task.constructByRow(row));
          })
      })
    })
  } 
  static async selectByStatusBeForeGenAMPHtml() {
    return this.selectByStatus(Status.BEFORE_GEN_AMP_HTML);
  }

  static async selectByStatusBeForeSaveAMPUrl() {
    return this.selectByStatus(Status.BEFORE_SAVE_AMP_URL);
  }

  static async selectByStatus(status) {
    const db = getDatabase()
    const result = [];
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`select url, ampurl, lastmod, status from ${taskManageTableName} where status = $status`, status ,
          (err, rows) => {
            if (err) {
              return reject(err);
            }
            if(!rows) {
              return resolve();
            }
            rows.forEach(row => {
              result.push(Task.constructByRow(row));
            })
            return resolve(result);
          })
      })
    })
  }
  static async selectAll() {
    const db = getDatabase()
    const result = [];
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all(`select url, ampurl, lastmod, status from ${taskManageTableName}`, (err, rows) => {
            if (err) {
              return reject(err);
            }
            if(!rows) {
              return resolve();
            }
            rows.forEach(row => {
              result.push(Task.constructByRow(row));
            })
            return resolve(result);
          })
      })
    })
  } 
}
exports.TaskManageRepository = TaskManageRepository;
