// app.js
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const iframe        = document.getElementById('api-frame');
  const startBtn      = document.getElementById('start-quiz-button');
  const quizContainer = document.getElementById('quiz-container');
  const questionEl    = document.getElementById('question');
  const optionsEl     = document.getElementById('options');

  // your Sketchfab model UID
  const uid = 'fd3ccceafd5947acaacb468be88d1a9c';

  // quiz state
  let sketchfabAPI;
  let currentQuestionIndex = 0;
  let score = 0;

  const questions = [
    {
      type: 'multipleChoice',
      question: 'Which bone forms the forehead?',
      options: [
        { answer: 'Frontal Bone', correct: true },
        { answer: 'Temporal Bone', correct: false }
      ]
    },
    {
      type: 'annotation',
      question: 'Click on the annotation corresponding to the Optic Canal.',
      annotationId: 3
    }
  ];

  // hide Start until model is ready
  startBtn.style.display = 'none';
  startBtn.addEventListener('click', startQuiz);

  // init Sketchfab viewer
  const client = new Sketchfab(iframe);
  client.init(uid, {
    success(api) {
      sketchfabAPI = api;
      api.start();
      api.addEventListener('viewerready', () => {
        // model loaded → show Start button
        startBtn.style.display = 'inline-block';
      });
    },
    error() {
      console.error('Sketchfab init error');
    }
  });

  // kick off quiz
  function startQuiz() {
    startBtn.style.display = 'none';
    quizContainer.style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    nextQuestion();
  }

  // display next question
  function nextQuestion() {
    // end‑of‑quiz
    if (currentQuestionIndex >= questions.length) {
      alert(`Quiz complete! Your score: ${score}`);
      quizContainer.style.display = 'none';
      return;
    }

    const q = questions[currentQuestionIndex];
    questionEl.innerText = q.question;
    optionsEl.innerHTML = '';

    if (q.type === 'multipleChoice') {
      // render MC options
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt.answer;
        btn.onclick = () => handleMC(opt.correct);
        optionsEl.appendChild(btn);
      });
    }
    else if (q.type === 'annotation') {
      // 1) listen for annotationFocus to know when gotoAnnotation finishes
      const onFocus = focusedIdx => {
        if (focusedIdx !== q.annotationId) return;
        sketchfabAPI.removeEventListener('annotationFocus', onFocus);

        // 2) now install select‑handler for the real click
        const onSelect = selectedIdx => {
          sketchfabAPI.removeEventListener('annotationSelect', onSelect);
          if (selectedIdx === q.annotationId) {
            alert('Correct!');
            score++;
            currentQuestionIndex++;
            setTimeout(nextQuestion, 500);
          } else {
            alert('Incorrect, try again.');
            // if you want them to retry, you could re‑attach:
            // sketchfabAPI.addEventListener('annotationSelect', onSelect);
          }
        };
        sketchfabAPI.addEventListener('annotationSelect', onSelect);
      };
      sketchfabAPI.addEventListener('annotationFocus', onFocus);

      // 3) move camera for hint (fires annotationFocus when done)
      sketchfabAPI.gotoAnnotation(q.annotationId);
    }
  }

  // handle multiple‑choice answers
  function handleMC(isCorrect) {
    if (isCorrect) {
      alert('Correct!');
      score++;
      currentQuestionIndex++;
      setTimeout(nextQuestion, 500);
    } else {
      alert('Incorrect, try again.');
    }
  }
});
