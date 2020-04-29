const {TaskManageRepository} = require('../database/tasks.js');

module.exports = function () {
    const promise = TaskManageRepository.selectAll();
    promise.then((result) => {
        console.log(JSON.stringify(result, null, 4));
    });
};
