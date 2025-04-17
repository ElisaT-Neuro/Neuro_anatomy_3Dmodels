// Select the Sketchfab iframe
const iframe = document.getElementById('api-frame');
const client = new Sketchfab(iframe);
const uid = 'fd3ccceafd5947acaacb468be88d1a9c';

// Quiz state
let sketchfabAPI;
let currentQuestionIndex = 0;
let score = 0;
let quizStarted = false;
let skipAnnotationEvent = false;

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

// Wire up Start button right away
const startBtn = document.getElementById('start-quiz-button');
startBtn.addEventListener('click', startQuiz);

// Initialize Sketchfab viewer
client.init(uid, {
  success: function(api) {
    sketchfabAPI = api;
    api.start();

    api.addEventListener('viewerready', function() {
      console.log('Viewer is ready');
      startBtn.style.display = 'block';
    });

    api.addEventListener('annotationSelect', function(index) {
      if (!quizStarted) return;
      const q = questions[currentQuestionIndex];
      if (q.type !== 'annotation') return;
      if (skipAnnotationEvent) {
        skipAnnotationEvent = false;
        return;
      }
      if (index !== q.annotationId) return;
      checkAnswer(index);
    });
  },
  error: function() {
    console.error('Sketchfab init error');
  }
});

// Start the quiz
function startQuiz() {
  startBtn.style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  quizStarted = true;
  currentQuestionIndex = 0;
  score = 0;
  nextQuestion();
}

// Show the next question
function nextQuestion() {
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
    skipAnnotationEvent = true;
    setTimeout(() => sketchfabAPI.gotoAnnotation(q.annotationId), 50);
  }
}

// Multiple‐choice handler
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

// Annotation click handler
function checkAnswer() {
  alert('Correct!');
  score++;
  currentQuestionIndex++;
  setTimeout(nextQuestion, 1000);
}
