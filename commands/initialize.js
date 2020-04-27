const {TaskManageRepository} = require('../libs/dbUtils.js');

module.exports = function () {
    TaskManageRepository.dropTableIfNotExists();
    TaskManageRepository.createTableIfNotExists();        
};
