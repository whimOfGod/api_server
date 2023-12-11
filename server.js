// import express from 'express';
var express = require('express');
let bodyParser = require('body-parser');
let apiRouter = require('./apiRouter').router;

// instantiate express
var server = express();
let port = 8080;

// body-parser configuration
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json())



// configure Routes
server.get('/', function(request, response ) {
    response.setHeader('Content-Type','text/html');
    response.status(200).send('<h1 style="color:green;!color:red;">...Connexion succeded ! </h1>')
});

server.use('/api/', apiRouter);

// launch server
server.listen(port, function(){
    console.log('...server listen on :' + port);
});