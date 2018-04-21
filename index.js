const express = require('express'),
      app= express(),
      io= require('socket.io')

app.set('view engine','ejs');
app.set('views','./views');
app.use(express.static('./public'));

app.get('/', (req,res)=>{
  res.render('index2');
})
app.get('/3', (req,res)=>{
  res.render('index3');
})

app.get('/4', (req,res)=>{
  res.render('index4');
})

app.listen(process.env.PORT||3000, ()=>{
  console.log("Started server");
})
