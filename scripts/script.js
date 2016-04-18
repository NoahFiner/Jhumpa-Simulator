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
var reminderTimeout, reminderStartTimeout, talkTimeout, typingTalkTimeout, storyNarrTimeout;
var resetNarr = true;

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
    addTime(Math.floor(Math.random()*7500)*currStory.timeMultiplier);
  }

  //typing animation
  if(isTyping === true) {
    $("#typing-jhumpa-arm1").css("animation", "type 0.5s infinite");
    $("#typing-jhumpa-arm2").css("animation", "oppotype 0.5s infinite");
  } else {
    $("#typing-jhumpa-arm1, #typing-jhumpa-arm2").css("animation", "none");
  }
}, 250);

var Story = function(title, description, storyLength, rating, timeMultiplier) {
  this.title = title;
  this.description = description;
  this.storyLength = storyLength;
  this.rating = rating || 3;
  if(rating === 0) {
    this.rating = 0;
  }
  this.timeMultiplier = timeMultiplier || 1;
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

proActions[0] = new StoryAction(new Story("A Temporary Matter", "an Indian couple, separated by the death of their child, getting together by telling secrets until everything falls apart.", 250, 5, 2), 95, "You project your fear of losing a loved one if you become too attached, inspired by your ignorant parents, onto characters in one of your short stories who lose a child and have a fear of intimacy.");
proActions[1] = new StoryAction(new Story("When Mr. Pirzada Came to Dine", "Mr. Pirzada, a Pakistani, visiting the young protagonist's house to hope that the rest of his family, stuck in Pakistan, are okay.", 300, 5, 2), 94, "You project your fear of losing your family, like your parents ignored you and you 'lost' them, onto a character almost loses his entire family.");
proActions[2] = new StoryAction(new Story("Sexy", "a woman participating in an affair with another man who calls her 'sexy,' while her friend, at the same time, has a cousin going through a harsh divorce.", 300, 4, 2), 85, "You project your fear of intimacy, sparked by your parents ignoring you despite your love, onto a character in a short story.");
proActions[3] = new StoryAction(new Story("This Blessed House", "a successful Indian man's wife finding dozens of Christian symbols in his house, which he doesn't like due to how he wants to look proffessional. But the wife insists on keeping them up, and during a party, everyone except the protagonist, searches the house to find more.", 500, 5, 2), 93, "You project your fear of your partner not giving you enough time to write onto a character whose wife refuses to do what he wants.");
proActions[4] = new StoryAction(new Story("Mrs. Sen's", "a young protagonist being babysat by an Indian housewife, who feels alone and refuses to drive or go into society.", 300, 4, 2), 90, "You project your fear of being an outsider, inspired by your childhood outside of India and constantly moving, onto a character in a short story.");
proActions[5] = new StoryAction(new Story("The Rejected Dog", "a dog being left as a stray in India and being ignored by everyone. This short story follows its travels.", 500, 0, 4), 15, "You project your fear of eternal loneliness onto a story about a rejected dog.");
proActions[6] = new StoryAction(new Story("In Altre Parole", "an Indian love affair, but written originally in Italian.", 500, 1, 2), 35, "You project your fear of intimacy onto a character in a love affair, but you also decide to write the book in Italian.");
proActions[7] = new StoryAction(new Story("Interpreter of Maladies", "a tour guide falling in love with one of his Indian customers who takes interest in his job of intepreting patients' maladies.", 250, 5, 2), 97, "You project your fear of your husband not loving you, like your parents who didn't love you as much as you would have liked.");

denActions[0] = new StoryAction(new Story("A Study on the Renaissance", "the renaissance, using research from your degree in it.", 500, 0, 3), 10, "You deny that anything's wrong and go on with life, writing about the renaissance.");
denActions[1] = new StoryAction(new Story("The U.S. Is Cool", "moveming to the U.S. being really easy and fun, making you immediately feel right at home.", 250, 2, 2), 40, "You deny that you feel like an outsider and are nervous about marriage and write a story about America!");
denActions[2] = new StoryAction(new Story("My Parents Are Cool", "your parents loving you and your environment seeming approachable as a child, which totally happened by the way!", 250, 1, 2), 60, "You deny your child traumas and ignorant parents and write a story about how cool they were!");
denActions[3] = new StoryAction(new Story("How to Get Married", "marriage in the U.S. and what a dream wedding would look like.", 500, 1, 2), 50, "You deny that you're afraid of marriage and just write about how to get married.");

avoActions[0] = new StoryAction(new Story("Rice", "your father's stragies for cooking rice. Previously published in the New Yorker, why not put it in <i>Intepreter of Maladies</i>?", 500, 2), 10, "You avoid your fears of marriage and write about rice.");
avoActions[1] = new StoryAction(new Story("The Long Way Home", "yourself learning how to cook Indian food by watching your parents as a child.", 400, 2, 10), 15, "You avoid your fears of marriage by writing about how you learned to cook food.");
avoActions[2] = new StoryAction(new Story("Teach Yourself Italian", "yourself learning Italian.", 600, 1, 5), 30, "You avoid your fears of marriage by writing about learning Italian.");
avoActions[3] = new LoopAction("You avoid your fears of marriage and go on a vacation.", "backgrounds/vacation.jpg", 90000, 50);
avoActions[4] = new LoopAction("You avoid your fears of marriage and go eat some food.", "backgrounds/food.jpg", 1440, 75);
avoActions[5] = new LoopAction("You avoid your fears of marriage by contemplating if you should just be a reporter again.", "backgrounds/contemplation.jpg", 45000, 20);
avoActions[6] = new StoryAction(new Story("A Real Durwan", "a cleaning lady telling everyone very detailed but unrealistic stories, but being kicked out when she tells the truth about robbers.", 600, 4, 2), 95, "You avoid your fears of marriage by just writing a story about telling stories.");

disActions[0] = new StoryAction(new Story("The Treatment of Bibi Haldar", "Bibi Haldar, an ugly Indian single young lady, searching for a man who could marry her due to Indian pressures. She unfortunately fails.", 250, 5, 2), 85, "You displace your fears of marriage on Indian culture pressuring you too much.");
disActions[1] = new StoryAction(new Story("The Third and Final Continent", "an Indian immigrant working at MIT and has a brief connection with his incredibly old landlord until his new wife arrives. When his wife arrives, though, it's very awkward.", 250, 5, 2), 95, "You displace your fears of marriage on Indian culture and your parents pressuring you too much.");
disActions[4] = new StoryAction(new Story("The Dog of Death", "people that have far too strong emotional connections to their dogs and how they manipulate their real emotions and feelings toward loved ones.", 500, 1, 10), 40, "You displace your fears of marriage on your dog.");
disActions[3] = new LoopAction("You displace your fears of marriage and blame your current boyfriend for making you not want to do marriage. You fight with him for a little.", "backgrounds/boyfriend.jpg", 20000, 30);
disActions[4] = new LoopAction("You displace your fears of marriage and blame your parents for not caring enough for you. You call them for a few days.", "backgrounds/parents.jpg", 100000, 20);
disActions[2] = new LoopAction("You displace your fears of marriage on your food for some reason.", "backgrounds/food.jpg", 100000, 5);


var narrate = function(narration, textState, buttonState) {
  if(resetNarr) {
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
  clearTimeout(reminderStartTimeout);
  clearTimeout(reminderTimeout);
  clearTimeout(typingTalkTimeout);
  clearTimeout(storyNarrTimeout);
  $("#typing-meter-overlay").css("width", "100%");
  stage = "typing";
  $("#typing-meter-outer").removeClass("hidden");
  currStory = storyOb;
  lettersLeft = storyOb.storyLength;
  if(customNarration === "") {
    narrate("<strong>Genius! You'll write a story about "+storyOb.description+"</strong><br>You'll call it \""+storyOb.title+"!\"", true, false);
  }
  else {
    narrate(customNarration, true, false);
  }
  resetNarr = false;
  storyNarrTimeout = setTimeout(function() {
    resetNarr = true;
  }, 5000);
};
var storyUsed = function(story) {
  for(i = 0; i < stories.length; i++) {
    if(stories[i].title === story) {
      return true;
    }
  }
  return false;
};

var finishStory = function() {
  clearTimeout(reminderTimeout);
  clearTimeout(reminderStartTimeout);
  stage = "nothing";
  $("#typing-meter-outer").addClass("hidden");
  stories.push(currStory);
  $("#written-stories, #final-stories").append("<li class='story-li' id=\"story-"+stories.length+"\">\""+currStory.title+"\"</li>");

  if(stories.length >= 9) {
    setTimeout(function() {
      endGame();
    }, (3500 + currStory.description.length/60*1000));
  }

  //i have to put this here because jquery is stupid
  $(".story-li").on("click", function() {
    var storyNum = $(this).attr("id").toString().charAt(6);
    var clickedStory = stories[storyNum - 1];
    if(stage === "hanging") {
      stage = "reading";
      clearTimeout(reminderTimeout);
      clearTimeout(reminderStartTimeout);
      narrate("Ahh a favorite! \""+clickedStory.title+",\" about "+clickedStory.description+"", true, false);
      setTimeout(function() {
        setStage("hanging");
      }, 5000);
    }
  });

  narrate("<strong>Great work! You finish \""+currStory.title+",\" short story #"+stories.length+"!</strong><br>It receives "+currStory.rating+"/5 stars.<br><br>It's about "+currStory.description+"", true, false);
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
                  "Let's get to writing!",
                  "What are you waiting for? Let's write some short stories!",
                  "You should probably write some stuff..."];
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
    narrate("<strong>WHAT WERE YOU THINKING? THE REPRESSED FEELINGS RETURNED!</strong><br>ANXIETY ATTACK! AHAAAAAHAHAHAHAH!", true, false);
    stage = "anxiety";
    $("#jhumpa-brain").removeClass().addClass("stress5");
    $("#typing-jhumpa").addClass("anxiety");
    setTimeout(function() {
      addTime(20160*30);
      narrate("<strong>You waste two months on your anxiety attack.</strong><br>This will probably affect your writing in the future.", true, false);
      starsRemoved++;
    }, 2500);
    setTimeout(function() {
      setStage("hanging");
    }, 5000);
  }
  if(whatStage === "stress") {
    narrate("<strong>Uh oh!</strong><br>For some reason a core issue about your fears of marriage is beginning to return from your subconcious.<br>Choose a way to repress it again, but not too quick!", true, true);
    stage = "stress";
  }
};

var Review = function(content, author, story) {
  this.content = content;
  this.author = author;
  this.story = story || "none";
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
  var reviews = [new Review("The books should be a movie!", "Frank Franklin"),
                new Review("<i>Interpreter of Maladies</i> had me furiously turning its pages.", "Edward Scott"),
                new Review("The collection of short stories had some hits and some misses, but mostly hits.", "Justin	Reed"),
                new Review("I was very impressed by the collection of short stories.", "Gary Williams"),
                new Review("Jhumpa Lahiri must have worked hard! I wonder why there was so much marriage in it though.", "Brian Edwards"),
                new Review("The other stories were fantastic, but there was way too much about cooking.", "Greg	Malone", "Rice"),
                new Review("Why can't she just talk English? I don't want to learn Italian!", "Ruby	Nelson", "In Altre Parole"),
                new Review("Why am I learning Italian?", "Clarisse Finklestein", "Teach Yourself Italian"),
                new Review("I don't care about the Renaissance. It would have been excellent if Lahiri wrote more fiction, which she is actually good at.", "Phillip Adams", "A Study on the Renaissance"),
                new Review("I don't want to learn about Lahiri's parents, just give me some fiction!", "Melissa	Robinson", "The Long Way Home"),
                new Review("I'm not Christian, but \"This Blessed House\" was an awesome story!", "Clarence	Phillips", "This Blessed House"),
                new Review("I really related to Mr. Pirzada. ", "Mildred Johnson", "When Mr. Pirzada Came to Dine"),
                new Review("Why does Jhumpa talk so much about dogs?", "Steve Russel", "The Dog of Death"),
                new Review("\"The Third and Final Continent\" really tugged with my emotions.", "Michael Goldwater", "The Third and Final Continent"),
                new Review("\"How to Get Married\" was weird, especially since Lahiri wasn't married when she wrote it.", "Barry McDuffie", "The Third and Final Continent"),
                new Review("Interpreter of Maladies was great, but what was with all the dogs?", "Brenda Morgan", "The Rejected Dog")];
  var goodReviews = [];
  while(goodReviews.length <= 5) {
    var potentialIndex = Math.floor(Math.random()*reviews.length);
    var potentialReview = reviews[potentialIndex];
    if(storyUsed(potentialReview.story) || potentialReview.story === "none") {
      reviews[potentialIndex].story = "used";
      goodReviews.push(potentialReview);
    }
  }
  for(i = 0; i < goodReviews.length; i++) {
    $("#score-outer").append(goodReviews[i].build());
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
        if((lettersLeft % 200) === 42) {
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
                            "I am writing the best short story in existance!",
                            "This is certain to get incredible ratings.",
                            "My mind is going to explode with all of these ideas! I must write them down!",
                            "I will be known as the fastest typer in town!"];
          talk(typingTalks[Math.floor(Math.random()*typingTalks.length)], true);
        }

        lettersLeft--;
        stress = Math.floor((lettersLeft/currStory.storyLength)*prevStress);
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
