navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// PeerJS object
var peer = new Peer({
  host: 'peerjs-dut.herokuapp.com',
  port: 80
});

peer.on('open', function() {
  $('#my-id').text(peer.id);
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
    window.existingCall.close();
    step2();
  });
  // Retry if getUserMedia fails
  $('#step1-retry').click(function() {
    $('#step1-error').hide();
    step1();
  });

  $('video.videoItem').click(function(e) {
    let id=e.target.id;
    console.log(e);
    $('#their-video').prop('src', e.target.currentSrc);
    console.log(e.target.currentSrc);
  });

  // $('ul.list-item li ').click(function(e) {
  //   alert(this);
  //   console.log(e.target.innerText);
  //   console.log("ele: ");
  //   console.log(e);
  // });
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
