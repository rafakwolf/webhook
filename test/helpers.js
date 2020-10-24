const chai = require('chai');
const chaiHttp = require('chai-http');

const assert = chai.assert;

chai.use(chaiHttp);

module.exports = {assert, chai};