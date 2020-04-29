const {TaskManageRepository} = require('../libs/dbUtils.js');

module.exports = function () {
    const promise = TaskManageRepository.selectAll();
    promise.then((result) => {
        console.log(JSON.stringify(result, null, 4));
    });
};
