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
            // Reveal and hook up the Start button
            const btn = document.getElementById("start-quiz-button");
            btn.style.display = "block";
            btn.addEventListener("click", startQuiz);
        });

        api.addEventListener('annotationSelect', function(index) {
            if (!quizStarted) return;
            if (skipAnnotationEvent) {
                skipAnnotationEvent = false;
                return;
            }
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
    nextQuestion();           // Start first question
}

// Load next question
function nextQuestion() {
    if (currentQuestionIndex < questions.length) {
        let questionData = questions[currentQuestionIndex];
        document.getElementById("question").innerText = questionData.question;
        document.getElementById("options").innerHTML = "";

        if (questionData.type === "multipleChoice") {
            questionData.options.forEach(option => {
                let button = document.createElement("button");
                button.innerText = option.answer;
                button.onclick = () => answer(option.correct);
                document.getElementById("options").appendChild(button);
            });
        }
        else if (questionData.type === "annotation") {
            document.getElementById("options").innerHTML =
              `<p>Click on Annotation #${questionData.annotationId}.</p>`;
            // Prevent the ensuing annotationSelect event from being treated as a user click
            skipAnnotationEvent = true;
            sketchfabAPI.gotoAnnotation(questionData.annotationId);
        }
    }
    else {
        alert(`Quiz complete! Your score: ${score}`);
        document.getElementById("quiz-container").style.display = "none";
    }
}

// Handle multiple-choice answers
function answer(isCorrect) {
    if (isCorrect) {
        alert("Correct!");
        score++;
        currentQuestionIndex++; // Move to next question
        setTimeout(nextQuestion, 1000); // Delay before moving
    } else {
        alert("Incorrect, try again.");
    }
}

// Handle annotation-based answers
function checkAnswer(selectedAnnotation) {
    let questionData = questions[currentQuestionIndex];
    if (questionData.type !== "annotation") return;

    if (selectedAnnotation === questionData.annotationId) {
        alert("Correct!");
        score++;
        currentQuestionIndex++;
        setTimeout(nextQuestion, 1000);
    } else {
        alert("Incorrect, try again.");
    }
}
