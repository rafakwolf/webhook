const express = require('express');
const routes = require('./routes');
const {HookManager} = require('./HookManager');

const PORT = process.env.API_PORT || 3000;

const app = express();
app.use(express.json());

const hookManager = new HookManager();
app.use(routes(hookManager));


if (process.env.NODE_ENV !== 'test') {
    require('./swagger')(app);
}

app.listen(PORT, () => {
    console.info(`API running at https://localhost:${PORT}`);
});


module.exports = app;