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
            // 1) only during the quiz
            if (!quizStarted) return;
            // 2) only on annotation questions
            let q = questions[currentQuestionIndex];
            if (q.type !== 'annotation') return;
            // 3) skip our own programmatic jump
            if (skipAnnotationEvent) {
                skipAnnotationEvent = false;
                return;
            }
            // 4) only if the correct annotation was clicked
            if (index !== q.annotationId) return;
            // 5) now give feedback
            checkAnswer(index);
        });
    },
    error: function() {
        console.log('Viewer error');
    }
});

// Start the quiz when user clicks "Start Quiz"
function startQuiz() {
    document.getElementById("start-quiz-button").style.display = "none"; // Hide Start button
    document.getElementById("quiz-container").style.display = "block";   // Show quiz UI
    quizStarted = true;       // Set quiz status
    currentQuestionIndex = 0; // Reset question index
    score = 0;                // Reset score
    nextQuestion();           // Start first question
}

// Load next question
function nextQuestion() {
    if (currentQuestionIndex < questions.length) {
        let q = questions[currentQuestionIndex];
        document.getElementById("question").innerText = q.question;
        document.getElementById("options").innerHTML = "";

        if (q.type === "multipleChoice") {
            q.options.forEach(option => {
                let btn = document.createElement("button");
                btn.innerText = option.answer;
                btn.onclick = () => answer(option.correct);
                document.getElementById("options").appendChild(btn);
            });
        }
        else if (q.type === "annotation") {
            document.getElementById("options").innerHTML =
                `<p>Click on Annotation #${q.annotationId}.</p>`;
            // Prevent the ensuing annotationSelect from firing checkAnswer
            skipAnnotationEvent = true;
            setTimeout(() => {
                sketchfabAPI.gotoAnnotation(q.annotationId);
            }, 50);
        }
    }
    else {
        alert(`Quiz complete! Your score: ${score}`);
        document.getElementById("quiz-container").style.display = "none";
        quizStarted = false;
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
    let q = questions[currentQuestionIndex];
    if (q.type !== "annotation") return;

    alert("Correct!");
    score++;
    currentQuestionIndex++;
    setTimeout(nextQuestion, 1000);
}
