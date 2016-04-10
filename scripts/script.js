var isTyping = false;
var typingTimeout;
var stress = 0;
var prevStress = stress;
var stage = "instructions";
var prevNarr = "";
var writingTime = new Date(1995, 0, 0, 0, 0, 0, 0);
var maxTime = new Date(2005, 0, 0, 0, 0, 0, 0);
var minutePos = 0;
var hourPos = 0;
var storyCompletion = 0;
var stories = [];
var lettersLeft = 0;
var starsRemoved = 0;
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

var Story = function(title, description, storyLength, rating) {
  this.title = title;
  this.description = description;
  this.storyLength = storyLength;
  this.rating = rating || 3;
};

// rank should be 0-100, with 100 being the best
var StoryAction = function(story, rank, customNarration) {
  this.actionType = "s";
  this.story = story;
  this.rank = rank;
  this.customNarration = customNarration || "";
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

// proActions[0] = new StoryAction(new Story("Really Bad Projection Story", "story description here", 50,0), 10, "You write an example story about stuff.");
proActions[1] = new StoryAction(new Story("Sort of Bad Projection Story", "story description here", 50,1), 20, "You write an example story about stuff.");
// proActions[2] = new StoryAction(new Story("Bad Projection Story", "story description here", 50,2), 40, "You write an example story about stuff.");
// proActions[3] = new StoryAction(new Story("Ok Projection Story", "story description here", 50,3), 80, "You write an example story about stuff.");
// proActions[4] = new StoryAction(new Story("Good Projection Story", "story description here", 50,4), 90, "You write an example story about stuff.");
// proActions[5] = new StoryAction(new Story("Amazing Projection Story", "story description here", 50,5), 97, "You write an example story about stuff.");
proActions[0] = new LoopAction("You magically become one of these things", "backgrounds/geese.jpg", 60000, 25);

denActions[0] = new StoryAction(new Story("Really Bad Denial Story", "story description here", 50,0), 10, "You write an example story about stuff.");
denActions[1] = new StoryAction(new Story("Sort of Bad Denial Story", "story description here", 50,1), 20, "You write an example story about stuff.");
denActions[2] = new StoryAction(new Story("Bad Denial Story", "story description here", 50,2), 40, "You write an example story about stuff.");
denActions[3] = new StoryAction(new Story("Ok Denial Story", "story description here", 50,3), 80, "You write an example story about stuff.");
denActions[4] = new StoryAction(new Story("Good Denial Story", "story description here", 50,4), 90, "You write an example story about stuff.");
denActions[5] = new StoryAction(new Story("Amazing Denial Story", "story description here", 50,5), 97, "You write an example story about stuff.");

avoActions[0] = new StoryAction(new Story("Rice", "your father's stragies for cooking rice. Previously published in the New Yorker, why not put it in <i>Intepreter of Maladies</i>?", 500, 2), 10, "You avoid your fears of marriage and write about rice.");
avoActions[1] = new StoryAction(new Story("The Long Way Home", "yourself learning how to cook Indian food by watching your parents as a child.", 400, 2), 15, "You avoid your fears of marriage by writing about how you learned to cook food.");
avoActions[2] = new LoopAction("You avoid your fears of marriage and go on a vacation.", "backgrounds/vacation.jpg", 90000, 50);
avoActions[3] = new LoopAction("You avoid your fears of marriage and go eat some food.", "backgrounds/food.jpg", 1440, 75);
avoActions[4] = new LoopAction("You avoid your fears of marriage by contemplating if you should just be a reporter again.", "backgrounds/contemplation.jpg", 45000, 20);

disActions[0] = new StoryAction(new Story("The Treatment of Bibi Haldar", "Bibi Haldar, an ugly Indian single young lady, searching for a man who could marry her due to Indian pressures. She unfortunately fails.", 250, 5), 85, "You displace your fears of marriage on Indian culture pressuring you too much.");
disActions[1] = new StoryAction(new Story("The Third and Final Continent", "an Indian immigrant works at MIT and has a brief connection with his incredibly old landlord until his new wife arrives. When his wife arrives, though, it's very awkward.", 250, 5), 95, "You displace your fears of marriage on Indian culture and your parents pressuring you too much.");


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
var writeStory = function(storyOb, customNarration) {
  customNarration = customNarration || "";
  console.log(storyOb);
  clearTimeout(reminderStartTimeout);
  clearTimeout(reminderTimeout);
  clearTimeout(typingTalkTimeout);
  $("#typing-meter-overlay").css("width", "100%");
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
};

var finishStory = function() {
  clearTimeout(reminderTimeout);
  clearTimeout(reminderStartTimeout);
  stage = "nothing";
  $("#typing-meter-outer").addClass("hidden");
  stories.push(currStory);
  $("#written-stories, #final-stories").append("<li class='story-li' id=\"story-"+stories.length+"\">\""+currStory.title+"\"</li>");

  if(stories.length >= 9) {
    endGame();
  }

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

  narrate("Great work! You finish \""+currStory.title+",\" short story #"+stories.length+", in '"+writingTime.getYear()+"!<br><br>It's about "+currStory.description+"", true, false);
  setTimeout(function() {
    setStage("hanging");
  }, (4000 + currStory.description.length/60*1000));
};

var addTime = function(minutes) {
  writingTime.setTime(writingTime.getTime() + 60000*minutes);
  minutePos += minutes*6;
  hourPos += minutes/2;
  $("#minute-hand").css("transform", "rotate("+minutePos+"deg)");
  $("#hour-hand").css("transform", "rotate("+hourPos+"deg)");
  $("#date").html("" + (writingTime.getMonth() + 1) + "/" + (writingTime.getDate() + 1) + "/" + writingTime.getFullYear());
  if(writingTime.getTime() >= maxTime.getTime()) {
    loseGame();
  }
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
      addTime(20160*30);
      narrate("You waste two months on your anxiety attack. This will probably affect your writing in the future.", true, false);
      starsRemoved++;
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

var Review = function(content, author) {
  this.content = content;
  this.author = author;
  this.build = function() {
    return "<p class='review'>\"<i>" + this.content + "</i>\" - " + this.author + "</p>";
  };
};

var loseGame = function() {
  $("#lose-game-outer, #loss-message, #loss-desc, #failure-book").removeClass("hidden");
  stage = "loss";
};

var endGame = function() {
  var startTime = new Date(1995, 0, 0, 0, 0, 0, 0);
  var timeDiff = Math.abs(startTime - writingTime);
  var yearDiff = Math.ceil(timeDiff / (1000 * 3600 * 24 * 365));
  var dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) % 365;
  var hourDiff = Math.ceil(timeDiff / (1000 * 3600)) % 24;
  var minuteDiff = Math.ceil(timeDiff / (1000 * 60)) % 60;
  $("#timing").html("You finished <i>Interpreter of Maladies</i> in "+yearDiff+" years, "+dayDiff+" days, "+hourDiff+" hours, and "+minuteDiff+" minutes.");
  $("#book-prev, #message, #end-game-outer").removeClass("hidden");
  var reviews = [new Review("You should make this book into a movie!", "Franklin Russel"),
                new Review("Jhumpa Lahiri's first collection of short stories is a bit like a buffet table - lots of variety with a few recurring themes and motifs.", "Shankar Vedantam"),
                new Review("No explanation is provided to justify the unlikely behavior. Good narrative demands that we be pulled along into an imaginary world, where characters act in interesting but consistent ways. A misplaced phrase or action jerks us out of the trance into wary suspicion.", "Shankar Vedantam"),
                new Review("idk placeholder placeholder", "placeholder man")];
  for(i = 0; i < 3; i++) {
    $("#score-outer").append(reviews[Math.floor(Math.random()*reviews.length)].build());
  }
  var ratingSum = 0;
  for(i = 0; i < stories.length; i++) {
    ratingSum += stories[i].rating;
  }
  ratingSum = Math.round((ratingSum - starsRemoved)/stories.length);
  $("#score-outer > h1").html("Final rating: "+Math.round(ratingSum)+"/5 stars");
  for(i = 0; i <= ratingSum; i++) {
    $(".star:nth-child("+i+")").addClass("active");
  }
  if(ratingSum >= 4) {
    $("#pulitzer").removeClass("hidden");
  }
  stage = "done";
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
    if(choiceActions.length === 1) {
      console.log(choice.substr(0, 3));
      $("#"+choice.substr(0, 3)+"-button").addClass("disabled");
    }

    var keyIndex = findClosestRank(100-Math.abs(100-stress), choiceActions);
    var keyAction = choiceActions[keyIndex];
    choiceActions.splice(keyIndex, 1);
    if(keyAction.actionType === "s") {
      prevStress = stress;
      writeStory(keyAction.story, keyAction.customNarration);
      wastedMinutesMultiplier = (Math.abs(100-stress)*10);
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
        stress = Math.floor((lettersLeft/currStory.storyLength)*prevStress);
        console.log(stress);
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
