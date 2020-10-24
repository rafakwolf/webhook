const express = require('express');

const app = express();
app.use(express.json());

app.post('/hook1', (req, res) => {
    console.info('Request received with data: ', req.body);
    res.status(204).send();
});

app.listen(3001, () => {
    console.info(`Client 1 running at https://localhost:3001`);
});