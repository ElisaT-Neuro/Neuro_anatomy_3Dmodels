// … in your client.init success block …

-    api.addEventListener('annotationSelect', function(index) {
-      if (!quizStarted) return;
-      if (skipAnnotationEvent) {
-        skipAnnotationEvent = false;
-        return;
-      }
-      checkAnswer(index);
-    });

+    api.addEventListener('annotationSelect', function(index) {
+      // 1) only during the quiz…
+      if (!quizStarted) return;
+
+      // 2) only if we're on an annotation question
+      let q = questions[currentQuestionIndex];
+      if (q.type !== 'annotation') return;
+
+      // 3) ignore the programmatic “gotoAnnotation” event
+      if (skipAnnotationEvent) {
+        skipAnnotationEvent = false;
+        return;
+      }
+
+      // 4) now it really is the student clicking the pin—give feedback
+      checkAnswer(index);
+    });
