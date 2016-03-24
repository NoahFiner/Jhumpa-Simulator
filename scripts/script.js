var isTyping = false;
var typingTimeout;
var stress = 0;
var stage = "hanging";
var prevNarr = "";
var writingTime = new Date(1995, 1, 1, 0, 0, 0, 0);
var minutePos = 0;
var hourPos = 0;
var storyCompletion = 0;
var stories = [];
var lettersLeft = 0;
var currStory;

//adds a minute to the time every minute played
var playTimeInterval = setInterval(function() {
  addTime(1);
}, 60000);

//a bunch of global timeouts
var reminderTimeout, reminderStartTimeout;

var mainInterval = setInterval(function() {
  //stress
  $("#anxiety-meter-overlay").css("width", 100 - stress + "%");
  if(stage === "stress") {
    //btw these classes should override any below them e.g. stress5 > stress1
    stress += 2;
    $("#jhumpa-brain").addClass("stress1");
    if(stress >= 100) {
      setStage("anxiety");
    }
    if(stress >= 25) {
      $("#jhumpa-brain").addClass("stress2");
    }
    if(stress >= 50) {
      $("#jhumpa-brain").addClass("stress3");
    }
    if(stress >= 75) {
      $("#jhumpa-brain").addClass("stress4");
    }
  }

  //quicker time when writing stories
  if(stage === "typing") {
    addTime(Math.floor(Math.random()*7500));
  }

  //typing animation
  if(isTyping === true) {
    $("#typing-jhumpa-arm1").css("animation", "type 0.5s infinite");
    $("#typing-jhumpa-arm2").css("animation", "oppotype 0.5s infinite");
  } else {
    $("#typing-jhumpa-arm1, #typing-jhumpa-arm2").css("animation", "none");
  }
}, 250);

var narrate = function(narration, textState, buttonState) {
  $("#narration").html(narration);
  if(textState) {
    $("#narration").removeClass("hidden");
  } else {
    if(narration === "") {
      $("#narration").html(prevNarr);
    }
    $("#narration").addClass("hidden");
  }
  prevNarr = narration;
  if(buttonState) {
    $("#den-button").removeClass("hidden");
    setTimeout(function() {$("#pro-button").removeClass("hidden");}, 250);
    setTimeout(function() {$("#avo-button").removeClass("hidden");}, 500);
    setTimeout(function() {$("#dis-button").removeClass("hidden");}, 750);
  } else {
    $("#den-button, #pro-button, #avo-button, #dis-button").addClass("hidden");
  }
};

//delete this
var exampleStory = {title: "Example Story", description: "a magical turtle who flies around the world stressing about marriage idfk", storyLength: 250};
//requirements: title, description, storyLength
var writeStory = function(storyOb) {
  clearTimeout(reminderStartTimeout);
  clearTimeout(reminderTimeout);
  stress = 25;
  stage = "typing";
  $("#typing-meter-outer").removeClass("hidden");
  currStory = storyOb;
  lettersLeft = storyOb.storyLength;
  narrate("Genius! You'll write a story about "+storyOb.description+"<br>You'll call it \""+storyOb.title+"!\"", true, false);
  setTimeout(function() {
    narrate("", false, false);
  }, 5000);
};

var finishStory = function() {
  stage = "nothing";
  narrate("Great work! You finish the short story in "+writingTime.getYear()+"!");
  $("#typing-meter-outer").addClass("hidden");
  stories.push(currStory);
  $("#written-stories").append("<li class='story-li' id=\"story-"+stories.length+"\">\""+currStory.title+"\"</li>");

  //i have to put this here because jquery is stupid
  $(".story-li").on("click", function() {
    var storyNum = $(this).attr("id").toString().charAt(6);
    var clickedStory = stories[storyNum - 1];
    if(stage === "hanging") {
      stage = "reading";
      clearTimeout(reminderTimeout);
      clearTimeout(reminderStartTimeout);
      narrate("Ahh a favorite! \""+clickedStory.title+",\" about "+clickedStory.description+".", true, false);
      setTimeout(function() {
        setStage("hanging");
      }, 5000);
    }
  });

  setTimeout(function() {
    setStage("hanging");
  }, 5000);
};

var addTime = function(minutes) {
  writingTime.setTime(writingTime.getTime() + 60000*minutes);
  minutePos += minutes*6;
  hourPos += minutes/2;
  $("#minute-hand").css("transform", "rotate("+minutePos+"deg)");
  $("#hour-hand").css("transform", "rotate("+hourPos+"deg)");
  $("#date").html("" + writingTime.getMonth() + "/" + writingTime.getDate() + "/" + writingTime.getFullYear());
};

var reminder = function() {
  clearTimeout(reminderTimeout);
  clearTimeout(reminderStartTimeout);
  reminderStartTimeout = setTimeout(function() {
    reminder();
  }, 7500);
  var reminders = ["You should probably get back to writing that book...",
                  "<i>Interpreter of Maladies</i> isn't going to write itself...",
                  "Now that we have that core issue dealt with, let's get back to writing.",
                  "What are you waiting for? Let's write some short stories!",
                  "You should probably write some stuff, those feelings shouldn't come back soon..."];
  narrate(reminders[Math.floor(Math.random()*reminders.length)], true, false);
  reminderTimeout = setTimeout(function() {
    narrate("", false, false);
  }, 5000);
};

var setStage = function(whatStage) {
  clearTimeout(reminderTimeout);
  clearTimeout(reminderStartTimeout);
  if(whatStage === "hanging") {
    narrate("", false, false);
    stage = "hanging";
    $("#typing-jhumpa").removeClass();
    $("#jhumpa-brain").removeClass();
    stress = 0;
    reminderStartTimeout = setTimeout(function() {
      reminder();
    }, 5000);
  }
  if(whatStage === "anxiety") {
    narrate("WHAT WERE YOU THINKING? THE REPRESSED FEELINGS RETURNED!<br>ANXIETY ATTACK! AHAAAAAHAHAHAHAH!", true, false);
    stage = "anxiety";
    $("#jhumpa-brain").removeClass().addClass("stress5");
    $("#typing-jhumpa").addClass("anxiety");
    setTimeout(function() {
      addTime(20160);
      narrate("You waste two weeks on your anxiety attack.", true, false);
    }, 2500);
    setTimeout(function() {
      setStage("hanging");
    }, 5000);
  }
  if(whatStage === "stress") {
    narrate("Uh oh! For some reason a core issue about your fears of marriage is beginning to return from your subconcious<br>Quick! Choose a way to repress it again!", true, true);
    stage = "stress";
  }
};

var choiceTiming = function(choice) {
  if(stage === "stress") {
    var wastedMinutesMultiplier = 1;
    if(stress >= 0 && stress <= 50) {
      narrate("You "+choice+" your core issues. Unfortunately, you wasted a lot of energy and time.", true, false);
    } else if(stress > 50 && stress <= 75) {
      narrate("You "+choice+" your core issues. Unfortunately, you wasted a good bit of energy and time.", true, false);
    } else if(stress > 75 && stress <= 85) {
      narrate("You "+choice+" your core issues, right on time!", true, false);
    } else if(stress > 75 && stress <= 99) {
      narrate("You "+choice+" your core issues, but pretty late, taking up extra energy and time.", true, false);
    } else {
      setStage("anxiety");
    }
    wastedMinutesMultiplier = (Math.abs(80-stress)*10);
    stress = 0;
    stage = "nothing";
    $("#jhumpa-brain").removeClass().addClass("stress1");
    setTimeout(function() {
      var wastedMinutes = Math.floor(Math.random()*59*wastedMinutesMultiplier + 2);
      addTime(wastedMinutes);
      setStage("hanging");
    }, 5000);
  }
};

$(document).ready(function() {
  reminderStartTimeout = setTimeout(function() {
    reminder();
  }, 5000);

  $("#den-button").click(function() {
    choiceTiming("denied");
  });
  $("#pro-button").click(function() {
    choiceTiming("projected");
  });
  $("#avo-button").click(function() {
    choiceTiming("avoided");
  });
  $("#dis-button").click(function() {
    choiceTiming("displaced");
  });

  $(document).keydown(function() {
    if(stage === "typing" || stage === "hanging") {
      clearTimeout(typingTimeout);
      clearTimeout(reminderTimeout);
      clearTimeout(reminderStartTimeout);
      narrate("", false, false);
      isTyping = true;
      typingTimeout = setTimeout(function() {
        isTyping = false;
      }, 500);
      reminderStartTimeout = setTimeout(function() {
        reminder();
      }, 5000);
      if(stage === "typing") {
        lettersLeft--;
        stress = 25 - (Math.floor(lettersLeft/currStory.storyLength)*25);
        $("#typing-meter-overlay").css("width", lettersLeft/currStory.storyLength*100+"%");
        if(lettersLeft <= 0) {
          finishStory();
        }
      }
      else {
        if(Math.random() < 0.05) {
          setStage("stress");
        }
      }
    }
  });
});
