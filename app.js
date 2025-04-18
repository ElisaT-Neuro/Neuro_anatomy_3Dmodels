// app.js

document.addEventListener('DOMContentLoaded', () => {
  // grab DOM elements
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

  // hide Start button until model is ready
  startBtn.style.display = 'none';
  startBtn.addEventListener('click', startQuiz);

  // initialize Sketchfab viewer
  const client = new Sketchfab(iframe);
  client.init(uid, {
    success(api) {
      sketchfabAPI = api;
      api.start();
      api.addEventListener('viewerready', () => {
        // reveal the Start button when the model is fully loaded
        startBtn.style.display = 'inline-block';
      });
    },
    error() {
      console.error('Sketchfab init error');
    }
  });

  // start the quiz
  function startQuiz() {
    startBtn.style.display = 'none';
    quizContainer.style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    nextQuestion();
  }

  // load the next question
  function nextQuestion() {
    // if we’re out of questions, end the quiz
    if (currentQuestionIndex >= questions.length) {
      alert(`Quiz complete! Your score: ${score}`);
      quizContainer.style.display = 'none';
      return;
    }

    const q = questions[currentQuestionIndex];
    questionEl.innerText = q.question;
    optionsEl.innerHTML = '';

    if (q.type === 'multipleChoice') {
      // render multiple-choice buttons
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt.answer;
        btn.onclick = () => handleMC(opt.correct);
        optionsEl.appendChild(btn);
      });
    }
    else if (q.type === 'annotation') {
      // annotation question: pan/zoom as a hint
      let skipProgrammatic = true;

      // one-off handler for annotationSelect
      const handler = selectedIdx => {
        if (skipProgrammatic) {
          // ignore the automatic event from gotoAnnotation()
          skipProgrammatic = false;
          return;
        }
        // remove listener after first real click
        sketchfabAPI.removeEventListener('annotationSelect', handler);

        if (selectedIdx === q.annotationId) {
          alert('Correct!');
          score++;
          currentQuestionIndex++;
          setTimeout(nextQuestion, 500);
        } else {
          alert('Incorrect, try again.');
          // if you want to allow repeated tries:
          // skip
