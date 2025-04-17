// app.js

// 1) Grab the iframe and init Sketchfab
const iframe = document.getElementById('api-frame');
const client = new Sketchfab(iframe);
const uid = 'fd3ccceafd5947acaacb468be88d1a9c';

// 2) Quiz state
let sketchfabAPI;
let currentQuestionIndex = 0;
let score = 0;
let quizStarted = false;
let skipAnnotationEvent = false;  // to swallow the programmatic jump

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
    annotationId: 3       // this is *your* target index
  }
];

// 3) Wire up Start button immediately
const startBtn = document.getElementById('start-quiz-button');
startBtn.addEventListener('click', startQuiz);

// 4) Initialize the Sketchfab viewer
client.init(uid, {
  success: function(api) {
    sketchfabAPI = api;
    api.start();

    api.addEventListener('viewerready', function() {
      console.log('Viewer is ready');
      // now it’s safe to show the button
      startBtn.style.display = 'block';
    });

    api.addEventListener('annotationSelect', function(idx) {
      // only during the annotation question of the quiz:
      if (!quizStarted) return;
      const q = questions[currentQuestionIndex];
      if (q.type !== 'annotation') return;

      // swallow the programmatic gotoAnnotation
      if (skipAnnotationEvent) {
        skipAnnotationEvent = false;
        return;
      }

      // now it’s a real user click on *some* pin
      checkAnswer(idx);
    });
  },
  error: function() {
    console.error('Failed to initialize Sketchfab');
  }
});

// 5) startQuiz: hide button, show container, reset state, first question
function startQuiz() {
  startBtn.style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  quizStarted = true;
  currentQuestionIndex = 0;
  score = 0;
  nextQuestion();
}

// 6) nextQuestion: render either MC or annotation
function nextQuestion() {
  // quiz end
  if (currentQuestionIndex >= questions.length) {
    alert(`Quiz complete! Your score: ${score}`);
    document.getElementById('quiz-container').style.display = 'none';
    quizStarted = false;
    return;
  }

  const q = questions[currentQuestionIndex];
  document.getElementById('question').innerText = q.question;
  const opts = document.getElementById('options');
  opts.innerHTML = '';

  if (q.type === 'multipleChoice') {
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.innerText = opt.answer;
      btn.onclick = () => answer(opt.correct);
      opts.appendChild(btn);
    });
  }
  else if (q.type === 'annotation') {
    opts.innerHTML = `<p>Click on Annotation #${q.annotationId}</p>`;
    // swallow the next annotationSelect event
    skipAnnotationEvent = true;
    // little delay to ensure the flag is set
    setTimeout(() => sketchfabAPI.gotoAnnotation(q.annotationId), 50);
  }
}

// 7) Multiple‑choice handler
function answer(isCorrect) {
  if (isCorrect) {
    alert('Correct!');
    score++;
    currentQuestionIndex++;
    setTimeout(nextQuestion, 1000);
  } else {
    alert('Incorrect, try again.');
  }
}

// 8) Annotation‑click handler (any pin click)
function checkAnswer(selectedIdx) {
  const q = questions[currentQuestionIndex];
  // only annotation questions reach here
  if (selectedIdx === q.annotationId) {
    alert('Correct!');
    score++;
    currentQuestionIndex++;
    setTimeout(nextQuestion, 1000);
  } else {
    alert('Incorrect, try again.');
  }
}
