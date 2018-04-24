navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// PeerJS object
var peer = new Peer({
      host: 'peerjs-dut.herokuapp.com',
      port: 80
    }),
    mySocket='',
    myPeer='',
    peerCalling=''
    socket = io();

peer.on('open', function() {
  myPeer= peer.id;
  $('#my-id').text(myPeer);
  socket.emit('newPeer', myPeer);
});
peer.on('call', function(call) {
  call.answer(window.localStream);
  step3(call);
});
peer.on('error', function(err) {
  // alert(err.message);
  console.log(err.message);
  step2();
});

$(() => {
  $('#make-call').click(function() {
    // Initiate a call!
    var call = peer.call($('#callToID').val(), window.localStream);
    step3(call);
  });
  $('#end-call').click(function() {
    $('.list-items').show();
    socket.emit('cPeerEndCall',{peerCall: myPeer, peerReceive: peerCalling});
    window.existingCall.close();
    step2();
  });
  // Retry if getUserMedia fails
  $('#step1-retry').click(function() {
    $('#step1-error').hide();
    step1();
  });
  $('#refresh').click(()=>{
    // $('.listPaticipant').append("<video id=\"my-video1\" class=\"videoItem\" muted=\"true\" autoplay src=\"https://www.w3schools.com/tags/movie.ogg\"></video>")
    socket.emit('reloadList',{});
  });
  // $('#addDiv').click(()=>{
    // $('.listPaticipant').append("<video id=\"my-video1\" class=\"videoItem\" muted=\"true\" autoplay src=\"https://www.w3schools.com/tags/movie.ogg\"></video>")
    // socket.emit('reloadList
  // });
  $('.list-items').click((e)=> {
    $('.list-items').hide();
    var call = peer.call(e.target.innerText, window.localStream);
    step3(call);
    peerCalling= e.target.innerText;
    socket.emit('cPeerCalling',{peerCall: myPeer, peerReceive: e.target.innerText});
    // console.log('Here: '+e.target.innerText+'.');
  });

  socket.on('equipInfor', (data)=>{
    mySocket= data.socketID
    // alert('Đã kết nối socket server, your id: '+mySocket);
    // show clientList
    let listItem='';
    for( let i=0; i<data.listItem.length; i++) {
      listItem= listItem+ '<li>'+data.listItem[i].peerid+'</li>';
    }
    $('.list-items').html(listItem);
  })

  // Have new client
  socket.on('newClient', (data)=>{
    console.log('Me: '+myPeer+', other: '+data.peerid);
    if (data.peerid != myPeer) {
      $('.list-items').append('<li>'+data.peerid+'</li>')
    }
  })

  socket.on('delClient', (data)=>{
    // Update new list client
    let listItem='';
    for( let i=0; i<data.length; i++) {
      if (data[i].socketid!= mySocket)
        listItem= listItem+ '<li>'+data[i].peerid+'</li>';
    }
    $('.list-items').html(listItem);
  })

  socket.on('sReloadList', (data)=>{
    // Update new list client
    let listItem='';
    for( let i=0; i<data.length; i++) {
      if (data[i].socketid!= mySocket && data[i].isCalling==false)
        listItem= listItem+ '<li>'+data[i].peerid+'</li>';
    }
    $('.list-items').html(listItem);
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
