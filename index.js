const express = require('express');
const fs = require('fs');
const eventEmitter = require('./events');

const PORT = process.env.API_PORT || 3000;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
      status: 'ok'  
    });
});

app.post('/webhook', (req, res) => {
    const {hookUrl, eventName} = req.body;
    if (!hookUrl) {
        return res.status(400).json({message: 'The parameter "hookUrl" should be informed.'});
    }

    if (!eventName) {
        return res.status(400).json({message: 'The parameter "eventName" should be informed.'});
    }    

    const HOOKS_DB_FILE = './hooks.json';

    let hooks = [];

    try {
        if (fs.existsSync(HOOKS_DB_FILE)) {
            hooks = JSON.parse(fs.readFileSync(HOOKS_DB_FILE, {encoding: 'utf8'}));
        }
    
        hooks.push({hookUrl, eventName});
        fs.writeFileSync('./hooks.json', JSON.stringify(hooks), {encoding: 'utf8'});
    
        res.status(204).send();
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

app.post('/send-to-hooks', (req, res) => {
    let hooks = [];
    if (fs.existsSync(HOOKS_DB_FILE)) {
        hooks = JSON.parse(fs.readFileSync(HOOKS_DB_FILE, {encoding: 'utf8'}));

        const data = req.body;

        for (const hook of hooks) {
            const {eventName, hookUrl} = hook;
            eventEmitter.emit(eventName, {url: hookUrl, data});
        }
    }
});

app.listen(PORT, () => {
    console.info(`API running at https://localhost:${PORT}`);
});