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
let skipAnnotationEvent = false;  // swallow programmatic jumps

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
    annotationId: 3       // target pin index
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
      // show Start only after model loaded
      startBtn.style.display = 'block';
    });

    api.addEventListener('annotationSelect', function(idx) {
      if (!quizStarted) return;                   // not in quiz
      const q = questions[currentQuestionIndex];
      if (q.type !== 'annotation') return;        // only on annotation questions

      // swallow our own gotoAnnotation call
      if (skipAnnotationEvent) {
        skipAnnotationEvent = false;
        return;
      }

      // now it’s a real student click
      checkAnswer(idx);
    });
  },
  error: function() {
    console.error('Sketchfab init error');
  }
});

// 5) startQuiz: hide button, show quiz, reset state
function startQuiz() {
  startBtn.style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  quizStarted = true;
  currentQuestionIndex = 0;
  score = 0;
  nextQuestion();
}

// 6) nextQuestion: render MC or annotation
function nextQuestion() {
  // if done
  if (currentQuestionIndex >= questions.length) {
    alert(`Quiz complete! Your score: ${score}`);
    document.getElementById('quiz-container').style.display = 'none';
    quizStarted = false;
    return;
  }

  const q = questions[currentQuestionIndex];
  document.getElementById('question').innerText = q.question;
  const opts = document.getElementById('options');
  opts.innerHTML = '';  // clear previous buttons or hints

  if (q.type === 'multipleChoice') {
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.innerText = opt.answer;
      btn.onclick = () => answer(opt.correct);
      opts.appendChild(btn);
    });
  }
  else if (q.type === 'annotation') {
    // No hint about the numeric ID—just let them click the model!
    skipAnnotationEvent = true;
    setTimeout(() => sketchfabAPI.gotoAnnotation(q.annotationId), 50);
  }
}

// 7) answer handler for MC
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

// 8) checkAnswer for annotation clicks
function checkAnswer(selectedIdx) {
  const q = questions[currentQuestionIndex];
  if (selectedIdx === q.annotationId) {
    alert('Correct!');
    score++;
    currentQuestionIndex++;
    setTimeout(nextQuestion, 1000);
  } else {
    alert('Incorrect, try again.');
  }
}
