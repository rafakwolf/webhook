const axios = require('axios').default;
const events = require('../events');

function hook (url, data) {
    axios({
        baseURL: url,
        data,
        method: 'POST'
    })
    .then(() => console.info(`hook ${url} executed sucessfully`))
    .catch(console.error);
}

function initialize(event) {
    events.on(event, (data) => {
        const {url, data} = data;
        hook(url, data);
    });
}

module.exports = {initialize};