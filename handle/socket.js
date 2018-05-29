exports= module.exports = function(io, client){
  io.on('connection', socket=>{
    console.log("New client");
    socket.on('reloadList', (data)=>{
      io.emit('sReloadList', client);
    });
    socket.emit('equipInfor', {socketID: socket.id, listItem: client});
    socket.on('newPeer', (data)=> {
      console.log('New   peer:          '+data.myPeer);
      io.emit('newClient', {socketid: socket.id, peerid: data.myPeer, name: data.name});
      client.push({socketid: socket.id, peerid: data.myPeer, isCalling: false, name: data.name});
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

    socket.on('cSendMessage', (data)=>{
      io.emit('sNewMessage', {name: data.name, message: data.message, socketId: socket.id});
    })
  })
}
