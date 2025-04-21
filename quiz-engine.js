// quiz-engine.js

// Grab the Sketchfab iframe and initialize the client
const iframe = document.getElementById('api-frame');
const client = new Sketchfab(iframe);

// Read model UID and questions array from page-local config
const uid = window.modelUID;
const questions = window.questions;

let api;
let currentQuestionIndex = 0;
let score = 0;
let quizStarted = false;

// Initialize the Sketchfab viewer with the dynamic UID
client.init(uid, {
  success: function(sdk) {
    api = sdk;
    sdk.start();

    // Once the viewer is ready, show the Start Quiz button
    sdk.addEventListener('viewerready', () => {
      document.getElementById('start-quiz-button').style.display = 'block';
    });

    // Listen for annotation clicks during annotation questions
    sdk.addEventListener('annotationSelect', idx => {
      if (quizStarted) handleAnnotation(idx);
    });
  },
  error: function() {
    console.error('Sketchfab initialization failed');
  }
});

// Start the quiz
function startQuiz() {
  quizStarted = true;
  currentQuestionIndex = 0;
  score = 0;

  document.getElementById('start-quiz-button').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  nextQuestion();
}

// Load and render the next question
function nextQuestion() {
  if (currentQuestionIndex >= questions.length) {
    alert(`Quiz complete! Your score: ${score}`);
    document.getElementById('quiz-container').style.display = 'none';
    return;
  }

  const q = questions[currentQuestionIndex];
  document.getElementById('question').innerText = q.question;
  const optsDiv = document.getElementById('options');
  optsDiv.innerHTML = '';

  if (q.type === 'multipleChoice') {
    // Render multiple-choice buttons
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.innerText = opt.answer;
      btn.addEventListener('click', () => {
        if (opt.correct) {
          score++;
          alert('Correct!');
          currentQuestionIndex++;
          setTimeout(nextQuestion, 500);
        } else {
          alert('Incorrect, try again.');
        }
      });
      optsDiv.appendChild(btn);
    });
  } else if (q.type === 'annotation') {
    // Prompt user to click the correct annotation
   // optsDiv.innerHTML = `<p>Click on annotation #${q.annotationId}.</p>`;
    //api.gotoAnnotation(q.annotationId);
    
 } 
}

// Handle annotation-based answers
function handleAnnotation(selection) {
  if (selection==-1) return;
  const q = questions[currentQuestionIndex];
  if (q.type !== 'annotation') return;

  if (selection === q.annotationId) {
    score++;
    alert('Correct!');
    currentQuestionIndex++;
    setTimeout(nextQuestion, 500);
  } else {
    alert('Incorrect, try again.');
  }
}

// Wire up the Start Quiz button (in case HTML doesn’t use inline onclick)
document.getElementById('start-quiz-button').addEventListener('click', startQuiz);
