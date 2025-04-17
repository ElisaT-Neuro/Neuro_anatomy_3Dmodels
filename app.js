// Select the Sketchfab iframe
var iframe = document.getElementById('api-frame');
var client = new Sketchfab(iframe); // Ensure correct API initialization
var uid = 'fd3ccceafd5947acaacb468be88d1a9c'; // Skull model UID

// Initialize quiz variables
let sketchfabAPI;
let currentQuestionIndex = 0;
let score = 0;
let quizStarted = false;         // Track if the quiz has started
let skipAnnotationEvent = false; // Prevent programmatic selects from firing checkAnswer

var questions = [
    {
        type: "multipleChoice",
        question: "Which bone forms the forehead?",
        options: [
            { answer: "Frontal Bone", correct: true },
            { answer: "Temporal Bone", correct: false }
        ]
    },
    {
        type: "annotation",
        question: "Click on the annotation corresponding to the Optic Canal.",
        annotationId: 3
    }
];

// Initialize Sketchfab Viewer API
client.init(uid, {
    success: function(api) {
        sketchfabAPI = api;
        api.start();

        api.addEventListener('viewerready', function() {
            console.log('Viewer is ready');
            const btn = document.getElementById("start-quiz-button");
            btn.style.display = "block";
            btn.addEventListener("click", startQuiz);
        });

        api.addEventListener('annotationSelect', function(index) {
            if (!quizStarted) return;                            // only during quiz
            let q = questions[currentQuestionIndex];
            if (q.type !== 'annotation') return;                 // only on annotation questions
            if (skipAnnotationEvent) {                           // skip programmatic jump
                skipAnnotationEvent = false;
                return;
            }
            if (index !== q.annotationId) return;                // ignore wrong pins
            checkAnswer(index);                                  // now a real user click
        });
    },
    error: function() {
        console.log('Viewer error');
    }
});

// Start the quiz when user clicks "Start Quiz"
function startQuiz() {
    document.getElementById("start-quiz-button").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    quizStarted = true;
    currentQuestionIndex = 0;
    score = 0;
    nextQuestion();
}

// Load next question
function nextQuestion() {
    if (currentQuestionIndex < questions.length) {
        let q = questions[currentQuestionIndex];
        document.getElementById("question").innerText = q.question;
        document.getElementById("options").innerHTML = "";

        if (q.type === "multipleChoice") {
            q.options.forEach(option => {
                let button = document.createElement("button");
                button.innerText = option.answer;
                button.onclick = () => answer(option.correct);
                document.getElementById("options").appendChild(button);
            });
        }
        else if (q.type === "annotation") {
            document.getElementById("options").innerHTML =
                `<p>Click on Annotation #${q.annotationId}.</p>`;
            skipAnnotationEvent = true;                          // ignore the upcoming programmatic event
            sketchfabAPI.gotoAnnotation(q.annotationId);
        }
    } else {
        alert(`Quiz complete! Your score: ${score}`);
        document.getElementById("quiz-container").style.display = "none";
    }
}

// Handle multiple-choice answers
function answer(isCorrect) {
    if (isCorrect) {
        alert("Correct!");
        score++;
        currentQuestionIndex++;
        setTimeout(nextQuestion, 1000);
    } else {
        alert("Incorrect, try again.");
    }
}

// Handle annotation-based answers
function checkAnswer(selectedAnnotation) {
    // This will only be called for the correct annotation
    alert("Correct!");
    score++;
