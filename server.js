const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const pug = require('pug');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/data', (req, res) => {
    fs.readFile('./data.json', 'utf-8', (error, content) => {
        if (error) {
            throw new Error(error);
        }

        res.json(JSON.parse(content));
    });
});

app.listen(8080);