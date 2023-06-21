var RefCountryService = require('../models/RefCountries');
var RefUserRolesService = require('../models/refUserRoles');

exports.getAllCountries = async function (req, res, next) {
    // console.log('In getAllCountries');
    // console.log('req.body: ' + JSON.stringify(req.body));

    const records = await RefCountryService.getAll();
    // console.log('records: ' + JSON.stringify(records));

    return res.status(200).send({ status: 'sucess', records: records });
}

exports.getAllUserRoles = async function (req, res, next) {
    // console.log('In getAllCountries');
    // console.log('req.body: ' + JSON.stringify(req.body));

    const records = await RefUserRolesService.getAll();
    // console.log('records: ' + JSON.stringify(records));

    return res.status(200).send({ status: 'sucess', records: records });
}