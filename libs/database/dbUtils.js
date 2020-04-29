const sqlite3 = require('sqlite3');
let database;
class DBCommon {
  static getDatabase() {
    if(!database) {
      database = new sqlite3.Database("db.sqlite3");
    }
    return database;
  }
}

exports.getDatabase = DBCommon.getDatabase;
