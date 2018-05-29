var express = require('express'),
    app= express(),
    http= require('http'),
    server= http.createServer(app),
    io= require('socket.io')(server);

app.set('view engine','ejs');
app.set('views','./views');
app.use(express.static('./public'));

var client= [];
require('./handle/socket.js')(io, client);

app.get('/', (req,res)=>{
  res.render('index4');
})
app.get('/3', (req,res)=>{
  res.render('index3');
})

app.get('/4', (req,res)=>{
  res.render('index4');
})

app.get('/clear', (req,res)=>{
  client= [];
  res.send('clear done!')
})

app.get('/client', (req,res)=>{
  res.send(client)
})

server.listen(process.env.PORT||3000, ()=>{
  console.log("Started server");
})
