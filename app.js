function nextQuestion() {
  // end‑of‑quiz check
  if (currentQuestionIndex >= questions.length) {
    alert(`Quiz complete! Your score: ${score}`);
    quizContainer.style.display = 'none';
    quizStarted = false;
    return;
  }

  const q = questions[currentQuestionIndex];
  questionEl.innerText = q.question;
  optionsEl.innerHTML = '';

  if (q.type === 'multipleChoice') {
    // … your multiple‑choice code …
  }
  else if (q.type === 'annotation') {
    // 1) set a flag so we skip the first (programmatic) annotationSelect
    let skip = true;

    // 2) create the handler *before* we pan/zoom
    const handler = function(selectedIdx) {
      if (skip) {
        // swallow the automatic event
        skip = false;
        return;
      }
      // now it’s the student's click—remove listener and grade
      sketchfabAPI.removeEventListener('annotationSelect', handler);

      if (selectedIdx === q.annotationId) {
        alert('Correct!');
        score++;
        currentQuestionIndex++;
        setTimeout(nextQuestion, 500);
      } else {
        alert('Incorrect, try again.');
        // if you want to let them try again, you could re‑attach:
        // skip = true;
        // sketchfabAPI.addEventListener('annotationSelect', handler);
      }
    };

    // 3) attach, then jump the camera
    sketchfabAPI.addEventListener('annotationSelect', handler);
    sketchfabAPI.gotoAnnotation(q.annotationId);
  }
}
