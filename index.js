var express = require('express'),
    app= express(),
    http= require('http'),
    server= http.createServer(app),
    io= require('socket.io')(server);

app.set('view engine','ejs');
app.set('views','./views');
app.use(express.static('./public'));

var client= [];

app.get('/', (req,res)=>{
  res.render('index2');
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

io.on('connection', socket=>{
  console.log("New client");
  socket.on('reloadList', (data)=>{
    io.emit('sReloadList', client);
  });
  socket.emit('equipInfor', {socketID: socket.id, listItem: client});
  socket.on('newPeer', (peerid)=> {
    console.log('New   peer:          '+peerid);
    io.emit('newClient', {socketid: socket.id, peerid: peerid});
    client.push({socketid: socket.id, peerid: peerid, isCalling: false});
  });
  socket.on('cPeerCalling', data=>{
    let index= client.findIndex((c)=>{
      return c.peerid==data.peerCall;
    });
    if (index>=0) client[index].isCalling= true;
    index= client.findIndex((c)=>{
      return c.peerid==data.peerReceive;
    });
    if (index>=0) client[index].isCalling= true;
    io.emit('sReloadList', client);
  })

  socket.on('cPeerEndCall', data=>{
    let index= client.findIndex((c)=>{
      return c.peerid==data.peerCall;
    });
    if (index>=0) client[index].isCalling= false;
    index= client.findIndex((c)=>{
      return c.peerid==data.peerReceive;
    });
    if (index>=0) client[index].isCalling= false;
    io.emit('sReloadList', client);
  })
  socket.on('disconnect', function(){
    console.log('disconnect');
    let index= client.findIndex((c)=>{
      return c.socketid==socket.id
    });
    client.splice(index, 1);
    io.emit('delClient', client);
  });
})

server.listen(process.env.PORT||3000, ()=>{
  console.log("Started server");
})
