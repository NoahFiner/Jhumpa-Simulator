var isTyping = false;
var typingTimeout;
var stress = 0;
var stage = "hanging";
var prevNarr = "";
var writingTime = new Date(1995, 0, 0, 0, 0, 0, 0);
var minutePos = 0;
var hourPos = 0;
var storyCompletion = 0;
var stories = [];
var lettersLeft = 0;
var currStory;
var proActions = [];
var avoActions = [];
var disActions = [];
var denActions = [];

//adds a minute to the time every minute played
var playTimeInterval = setInterval(function() {
  addTime(1);
}, 60000);

//a bunch of global timeouts
var reminderTimeout, reminderStartTimeout, talkTimeout, typingTalkTimeout;

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

var Story = function(title, description, storyLength, rating=3) {
  this.title = title;
  this.description = description;
  this.storyLength = storyLength;
  this.rating = rating;
};

// rank should be 0-100, with 100 being the best
var StoryAction = function(story, rank, customNarration="") {
  this.actionType = "s";
  this.story = story;
  this.rank = rank;
  this.customNarration = customNarration;
};

var LoopAction = function(customNarration, image, time, rank) {
  this.actionType = "l";
  this.customNarration = customNarration;
  this.image = image;
  this.time = time;
  this.rank = rank;
  this.execute = function() {
    $("#custom-background").attr("src", this.image);
    $("#custom-background-outer").removeClass("hidden");
    stage = "misc";
    narrate(customNarration, true, false);
    var that = this;
    setTimeout(function() {
      setStage("hanging");
      $("#custom-background-outer").addClass("hidden");
      addTime(that.time);
    }, 5000);
  };
};

// proActions[0] = new StoryAction(new Story("Really Bad Projection Story", "story description here", 500, 0), 10, "You write an example story about stuff.");
proActions[1] = new StoryAction(new Story("Sort of Bad Projection Story", "story description here", 500, 1), 20, "You write an example story about stuff.");
// proActions[2] = new StoryAction(new Story("Bad Projection Story", "story description here", 500, 2), 40, "You write an example story about stuff.");
// proActions[3] = new StoryAction(new Story("Ok Projection Story", "story description here", 500, 3), 80, "You write an example story about stuff.");
// proActions[4] = new StoryAction(new Story("Good Projection Story", "story description here", 500, 4), 90, "You write an example story about stuff.");
// proActions[5] = new StoryAction(new Story("Amazing Projection Story", "story description here", 500, 5), 97, "You write an example story about stuff.");
proActions[0] = new LoopAction("You magically become one of these things", "backgrounds/geese.jpg", 60000, 25);

denActions[0] = new StoryAction(new Story("Really Bad Denial Story", "story description here", 500, 0), 10, "You write an example story about stuff.");
denActions[1] = new StoryAction(new Story("Sort of Bad Denial Story", "story description here", 500, 1), 20, "You write an example story about stuff.");
denActions[2] = new StoryAction(new Story("Bad Denial Story", "story description here", 500, 2), 40, "You write an example story about stuff.");
denActions[3] = new StoryAction(new Story("Ok Denial Story", "story description here", 500, 3), 80, "You write an example story about stuff.");
denActions[4] = new StoryAction(new Story("Good Denial Story", "story description here", 500, 4), 90, "You write an example story about stuff.");
denActions[5] = new StoryAction(new Story("Amazing Denial Story", "story description here", 500, 5), 97, "You write an example story about stuff.");

avoActions[0] = new StoryAction(new Story("Really Bad Avoidance Story", "story description here", 500, 0), 10, "You write an example story about stuff.");
avoActions[1] = new StoryAction(new Story("Sort of Bad Avoidance Story", "story description here", 500, 1), 20, "You write an example story about stuff.");
avoActions[2] = new StoryAction(new Story("Bad Avoidance Story", "story description here", 500, 2), 40, "You write an example story about stuff.");
avoActions[3] = new StoryAction(new Story("Ok Avoidance Story", "story description here", 500, 3), 80, "You write an example story about stuff.");
avoActions[4] = new StoryAction(new Story("Good Avoidance Story", "story description here", 500, 4), 90, "You write an example story about stuff.");
avoActions[5] = new StoryAction(new Story("Amazing Avoidance Story", "story description here", 500, 5), 97, "You write an example story about stuff.");

disActions[0] = new StoryAction(new Story("Really Bad Displacement Story", "story description here", 500, 0), 10, "You write an example story about stuff.");
disActions[1] = new StoryAction(new Story("Sort of Bad Displacement Story", "story description here", 500, 1), 20, "You write an example story about stuff.");
disActions[2] = new StoryAction(new Story("Bad Displacement Story", "story description here", 500, 2), 40, "You write an example story about stuff.");
disActions[3] = new StoryAction(new Story("Ok Displacement Story", "story description here", 500, 3), 80, "You write an example story about stuff.");
disActions[4] = new StoryAction(new Story("Good Displacement Story", "story description here", 500, 4), 90, "You write an example story about stuff.");
disActions[5] = new StoryAction(new Story("Amazing Displacement Story", "story description here", 500, 5), 97, "You write an example story about stuff.");


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

var talk = function(narration, talkState) {
  clearTimeout(talkTimeout);
  if(talkState) {
    $("#speech-bubble").removeClass("hidden");
    $("#speech-bubble > p").html(narration);
  } else {
    if(narration === "") {
      talkTimeout = setTimeout(function() {$("#speech-bubble > p").html("");}, 250);
    }
    $("#speech-bubble").addClass("hidden");
  }
};

var findClosestRank = function(val, searchArray) {
  var bestDiff = 100;
  var bestResult = 0;
  for(var i = 0; i < searchArray.length; i++) {
    if(Math.abs(searchArray[i].rank - val) < bestDiff) {
      bestDiff = Math.abs(searchArray[i].rank - val);
      bestResult = i;
    }
  }
  return bestResult;
};

//delete this
var exampleStory = {title: "Example Story", description: "a magical turtle who flies around the world stressing about marriage idfk", storyLength: 250};
//requirements: title, description, storyLength
var writeStory = function(storyOb, customNarration = "") {
  console.log(storyOb);
  clearTimeout(reminderStartTimeout);
  clearTimeout(reminderTimeout);
  clearTimeout(typingTalkTimeout);
  $("#typing-meter-overlay").css("width", "100%");
  stress = 25;
  stage = "typing";
  $("#typing-meter-outer").removeClass("hidden");
  currStory = storyOb;
  lettersLeft = storyOb.storyLength;
  if(customNarration === "") {
    narrate("Genius! You'll write a story about "+storyOb.description+"<br>You'll call it \""+storyOb.title+"!\"", true, false);
  }
  else {
    narrate(customNarration, true, false);
  }
  setTimeout(function() {
    narrate("", false, false);
  }, 5000);
};

var finishStory = function() {
  stage = "nothing";
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

  narrate("Great work! You finish \""+currStory.title+",\" short story #"+stories.length+", in '"+writingTime.getYear()+"!", true, false);
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
  $("#date").html("" + (writingTime.getMonth() + 1) + "/" + (writingTime.getDate() + 1) + "/" + writingTime.getFullYear());
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
  clearTimeout(typingTalkTimeout);
  if(whatStage === "hanging") {
    talk("", false);
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
    // if(stress >= 0 && stress <= 50) {
    //   narrate("You "+choice+" your core issues. Unfortunately, you wasted a lot of energy and time.", true, false);
    // } else if(stress > 50 && stress <= 75) {
    //   narrate("You "+choice+" your core issues. Unfortunately, you wasted a good bit of energy and time.", true, false);
    // } else if(stress > 75 && stress <= 85) {
    //   narrate("You "+choice+" your core issues, right on time!", true, false);
    // } else if(stress > 75 && stress <= 99) {
    //   narrate("You "+choice+" your core issues, but pretty late, taking up extra energy and time.", true, false);
    // } else {
    if(stress > 99) {
      setStage("anxiety");
      return;
    }
    var choiceActions;
    switch(choice) {
      case "projected":
        choiceActions = proActions;
        break;
      case "denied":
        choiceActions = denActions;
        break;
      case "displaced":
        choiceActions = disActions;
        break;
      case "avoided":
        choiceActions = avoActions;
        break;
    }
    var keyAction = choiceActions[findClosestRank(100-Math.abs(80-stress), choiceActions)];
    if(keyAction.actionType === "s") {
      writeStory(keyAction.story, keyAction.customNarration);
      wastedMinutesMultiplier = (Math.abs(80-stress)*10);
      stress = 0;
      // stage = "nothing";
      $("#jhumpa-brain").removeClass().addClass("stress1");
      // setTimeout(function() {
      //   var wastedMinutes = Math.floor(Math.random()*59*wastedMinutesMultiplier + 2);
      //   addTime(wastedMinutes);
      //   setStage("hanging");
      // }, 5000);
    }
    else if (keyAction.actionType === "l") {
      keyAction.execute();
    }
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
        //also some fun narration
        if(Math.random() < 0.01) {
          clearTimeout(typingTalkTimeout);
          typingTalkTimeout = setTimeout(function() {
            talk("", false);
          }, 3000);
          var typingTalks = ["I feel the words flowing from my hands!",
                            "This is the opposite of writer's block!",
                            "I'm writing faster than ever before!",
                            "Gotta type fast!",
                            "I've been inspired and I feel fantastic!",
                            "The ideas are coming too quickly! Type faster!",
                            "I will be known as the fastest typer in town!"];
          talk(typingTalks[Math.floor(Math.random()*typingTalks.length)], true);
        }

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
