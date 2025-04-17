// … your existing top‐of‐file declarations …
let skipAnnotationEvent = false;

// Initialize Sketchfab Viewer API
client.init(uid, {
  success: function(api) {
    sketchfabAPI = api;
    api.start();

    api.addEventListener('viewerready', function() {
      console.log('Viewer is ready');
      const btn = document.getElementById("start-quiz-button");
      btn.style.display = "block";
      btn.addEventListener("click", startQuiz);
    });

    api.addEventListener('annotationSelect', function(index) {
      console.log('→ annotationSelect event', { index, skipAnnotationEvent });
      if (!quizStarted) return;
      if (skipAnnotationEvent) {
        console.log('   skipping programmatic event');
        skipAnnotationEvent = false;
        return;
      }
      console.log('   treating as user click');
      checkAnswer(index);
    });
  },
  error: function() {
    console.log('Viewer error');
  }
});

function nextQuestion() {
  if (currentQuestionIndex < questions.length) {
    let q = questions[currentQuestionIndex];
    document.getElementById("question").innerText = q.question;
    document.getElementById("options").innerHTML = "";

    if (q.type === "multipleChoice") {
      // … unchanged …
    }
    else if (q.type === "annotation") {
      document.getElementById("options").innerHTML =
        `<p>Click on Annotation #${q.annotationId}.</p>`;

      // 1) set the flag
      skipAnnotationEvent = true;
      console.log('→ will skip the next annotationSelect');

      // 2) give the API a moment to settle, then jump
      setTimeout(() => {
        sketchfabAPI.gotoAnnotation(q.annotationId);
      }, 50);
    }
  }
  else {
    // … quiz end …
  }
}
