const {TaskManageRepository} = require('../database/tasks.js');

module.exports = function () {
    TaskManageRepository.dropTableIfNotExists();
    TaskManageRepository.createTableIfNotExists();        
};
