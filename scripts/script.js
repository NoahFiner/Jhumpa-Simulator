var isTyping = false;
var typingTimeout;

var testIfTypingTrue = setInterval(function() {
  if(isTyping === true) {
    $("#typing-jhumpa-arm1").css("animation", "type 0.5s infinite");
    $("#typing-jhumpa-arm2").css("animation", "oppotype 0.5s infinite");
  } else {
    $("#typing-jhumpa-arm1, #typing-jhumpa-arm2").css("animation", "none");
  }

}, 250);

$(document).ready(function() {
  $(document).keydown(function() {
    clearTimeout(typingTimeout);
    isTyping = true;
    typingTimeout = setTimeout(function() {
      isTyping = false;
    }, 500);
  });
});
