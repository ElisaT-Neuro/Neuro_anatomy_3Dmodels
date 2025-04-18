// 1) In your init, remove the global annotationSelect handler altogether:
client.init(uid, {
  success(api) {
    sketchfabAPI = api;
    api.start();
    api.addEventListener('viewerready', () => {
      startBtn.style.display = 'block';
    });
    // NO more global api.addEventListener('annotationSelect', ...) here
  },
  error() { console.error('Sketchfab init error'); }
});

// 2) In nextQuestion(), when you hit an annotation question, add a one‑off listener:
function nextQuestion() {
  if (currentQuestionIndex >= questions.length) {
    alert(`Quiz complete! Your score: ${score}`);
    quizStarted = false;
    document.getElementById('quiz-container').style.display = 'none';
    return;
  }

  const q = questions[currentQuestionIndex];
  document.getElementById('question').innerText = q.question;
  const opts = document.getElementById('options');
  opts.innerHTML = '';

  if (q.type === 'multipleChoice') {
    // …your existing MC code…
  }
  else if (q.type === 'annotation') {
    // Optionally pan/zoom to the pin as a hint
    sketchfabAPI.gotoAnnotation(q.annotationId);

    // Create a one‑off handler
    const handler = function(selectedIdx) {
      sketchfabAPI.removeEventListener('annotationSelect', handler);
      if (selectedIdx === q.annotationId) {
        alert('Correct!');
        score++;
        currentQuestionIndex++;
        setTimeout(nextQuestion, 500);
      } else {
        alert('Incorrect, try again.');
        // we leave the same question in place until they pick the right pin
        // you could re‑attach the handler here if you want multiple attempts
      }
    };

    // Now listen *only* for the student’s click on a pin
    sketchfabAPI.addEventListener('annotationSelect', handler);
  }
}
