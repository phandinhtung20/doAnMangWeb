navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// PeerJS object
var peer = new Peer({
      host: 'peerjs-dut.herokuapp.com',
      port: 443
    }),
    mySocket='',
    myPeer='',
    peerCalling=''
    socket = io(),
    name= ''

peer.on('open', function() {
  myPeer= peer.id;
  $('#my-id').text(myPeer);
});

peer.on('call', function(call) {
  call.answer(window.localStream);
  step3(call);
});

peer.on('error', function(err) {
  console.log(err.message);
  step2();
});

$(() => {
  $('.list-items').hide();
  $('.messageArea').hide();

  $('#make-call').click(()=>{
    if ($('#myName').val()=='') {
      alert("Hãy nhập username trước khi bắt đầu")
    } else {
      name= $('#myName').val();
      $('.list-items').show();
      $('.messageArea').show();
      socket.emit('newPeer', {myPeer: $('#my-id').text(), name: name});
    }
  })

  $('#end-call').click(function() {
    $('.list-items').show();
    socket.emit('cPeerEndCall', {peerCall: myPeer, peerReceive: peerCalling});
    window.existingCall.close();
    step2();
  });

  // Retry if getUserMedia fails
  $('#step1-retry').click(function() {
    $('#step1-error').hide();
    step1();
  });

  $('#refresh').click(()=>{
    socket.emit('reloadList',{});
  });

  $('.list-items').click((e)=> {
    $('.list-items').hide();
    var call = peer.call(e.target.id, window.localStream);
    step3(call);
    peerCalling= e.target.id;
    socket.emit('cPeerCalling',{peerCall: myPeer, peerReceive: e.target.id});
  });

  $('#btnSend').click(()=>{
    if ($('#message').val()!='') {
      socket.emit('cSendMessage',{name: name, message: $('#message').val()})
    }
    $('#message').val('');
  });

  socket.on('equipInfor', (data)=>{
    mySocket= data.socketID
    // show clientList
    let listItem='';
    for( let i=0; i<data.listItem.length; i++) {
      listItem= listItem+ '<li "'+data.listItem[i].peerid+'">'+data.listItem[i].name+'</li>';
    }
    $('.list-items').html(listItem);
  })
  socket.on('newClient', (data)=>{
    console.log('Me: '+myPeer+', other: '+data.peerid);
    if (data.peerid != myPeer) {
      $('.list-items').append('<li id="'+data.peerid+'">'+data.name+'</li>')
    }
  })
  socket.on('delClient', (data)=>{
    // Update new list client
    let listItem='';
    for( let i=0; i<data.length; i++) {
      if (data[i].socketid!= mySocket)
        listItem= listItem+ '<li id="'+data[i].peerid+'">'+data[i].name+'</li>';
    }
    $('.list-items').html(listItem);
  })
  socket.on('sReloadList', (data)=>{
    $('.list-items').show();
    // Update new list client
    let listItem='';
    for( let i=0; i<data.length; i++) {
      if (data[i].socketid!= mySocket && data[i].isCalling==false)
        listItem= listItem+ '<li id="'+data[i].peerid+'">'+data[i].name+'</li>';
    }
    $('.list-items').html(listItem);
  })
  socket.on('sNewMessage', (data)=>{
    if (data.socketId==mySocket) {
      $('.listMessage').append('<br><span class="textRight"><b>'+data.name+':</b> '+data.message+'</span>')
    } else {
      $('.listMessage').append('<br><span><b>'+data.name+':</b> '+data.message+'</span>')
    }
  })
  // Get things started
  step1();
});

function step1() {
  // Get audio/video stream
  navigator.getUserMedia({
    audio: true,
    video: true
  }, function(stream) {
    // Set your video displays
    $('#my-video').prop('src', URL.createObjectURL(stream));
    window.localStream = stream;
    step2();
  }, function() {
    $('#step1-error').show();
  });
}
function step2() {
  $('#step1, #step3').hide();
  $('#step2').show();
}
function step3(call) {
  // Hang up on an existing call if present
  if (window.existingCall) {
    window.existingCall.close();
  }
  // Wait for stream on the call, then set peer video display
  call.on('stream', function(stream) {
    $('#their-video').prop('src', URL.createObjectURL(stream));
  });
  // UI stuff
  window.existingCall = call;
  $('#their-id').text(call.peer);
  call.on('close', step2);
  $('#step1, #step2').hide();
  $('#step3').show();
}
