// app.js

// grab DOM elements
const iframe       = document.getElementById('api-frame');
const startBtn     = document.getElementById('start-quiz-button');
const quizContainer= document.getElementById('quiz-container');
const questionEl   = document.getElementById('question');
const optionsEl    = document.getElementById('options');

// your Sketchfab model UID
const uid = 'fd3ccceafd5947acaacb468be88d1a9c';

// quiz state
let sketchfabAPI;
let currentQuestionIndex = 0;
let score = 0;
let quizStarted = false;

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

// hide Start until model is loaded
startBtn.style.display = 'none';
startBtn.addEventListener('click', startQuiz);

// init Sketchfab viewer
const client = new Sketchfab(iframe);
client.init(uid, {
  success(api) {
    sketchfabAPI = api;
    api.start();
    api.addEventListener('viewerready', () => {
      // now the model is ready to interact with
      startBtn.style.display = 'block';
    });
  },
  error() {
    console.error('Sketchfab init error');
  }
});

function startQuiz() {
  startBtn.style.display = 'none';
  quizContainer.style.display = 'block';
  quizStarted = true;
  currentQuestionIndex = 0;
  score = 0;
  nextQuestion();
}

function nextQuestion() {
  // quiz end
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
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.innerText = opt.answer;
      btn.onclick = () => handleMC(opt.correct);
      optionsEl.appendChild(btn);
    });
  }
  else if (q.type === 'annotation') {
    // pan/zoom to the pin as a hint
    sketchfabAPI.gotoAnnotation(q.annotationId);

    // install a one‑off listener for the student’s pin click
    const handler = function(selectedIdx) {
      sketchfabAPI.removeEventListener('annotationSelect', handler);
      if (selectedIdx === q.annotationId) {
        alert('Correct!');
        score++;
        currentQuestionIndex++;
        setTimeout(nextQuestion, 500);
      } else {
        alert('Incorrect, try again.');
        // if you want to allow repeated tries, re-attach here:
        // sketchfabAPI.addEventListener('annotationSelect', handler);
      }
    };

    sketchfabAPI.addEventListener('annotationSelect', handler);
  }
}

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
