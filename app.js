client.init(uid, {
  success: function(api) {
    sketchfabAPI = api;
    api.start();

    api.addEventListener('viewerready', function() {
      const btn = document.getElementById("start-quiz-button");
      btn.style.display = "block";
      btn.addEventListener("click", startQuiz);
    });

-   api.addEventListener('annotationSelect', function(index) {
-     // only during annotation question…
-     let q = questions[currentQuestionIndex];
-     if (!quizStarted || q.type !== 'annotation') return;
-     if (skipAnnotationEvent) {
-       skipAnnotationEvent = false;
-       return;
-     }
-     checkAnswer(index);
-   });
+   api.addEventListener('annotationSelect', function(index) {
+     // 1) must be in the quiz
+     if (!quizStarted) return;
+
+     // 2) must be the annotation question
+     let q = questions[currentQuestionIndex];
+     if (q.type !== 'annotation') return;
+
+     // 3) skip our own programmatic jump
+     if (skipAnnotationEvent) {
+       skipAnnotationEvent = false;
+       return;
+     }
+
+     // 4) only react if they actually clicked the *correct* pin
+     if (index !== q.annotationId) {
+       return;
+     }
+
+     // 5) now give feedback
+     checkAnswer(index);
+   });

