var iframe = document.getElementById('api-frame');
var client = new Sketchfab(iframe);
var uid = 'fd3ccceafd5947acaacb468be88d1a9c'; // Skull model UID

let sketchfabAPI;
let currentQuestionIndex = 0;
let score = 0;

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

client.init(uid, {
    success: function(api) {
        sketchfabAPI = api;
        api.start();
        api.addEventListener('viewerready', function() {
            console.log('Viewer is ready');
            document.getElementById("start-quiz-button").style.display = "block"; // Show quiz button
        });

        api.addEventListener('annotationFocus', function(index) {
            checkAnswer(currentQuestionIndex, index);
        });
    },
    error: function() {
        console.log('Viewer error');
    }
});

function startQuiz() {
    document.getElementById("start-quiz-button").style.display = "block"; // Hide start button
    document.getElementById("quiz-container").style.display = "block"; // Show quiz UI
    nextQuestion();
}

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
        } else if (questionData.type === "annotation") {
            document.getElementById("options").innerHTML = `<p>Click on Annotation #${questionData.annotationId}.</p>`;
            sketchfabAPI.gotoAnnotation(questionData.annotationId);
        }

        currentQuestionIndex++;
    } else {
        alert(`Quiz complete! Your score: ${score}`);
        document.getElementById("quiz-container").style.display = "none"; // Hide quiz after completion
    }
}

function answer(isCorrect) {
    if (isCorrect) {
        alert("Correct!");
        score++;
    } else {
        alert("Incorrect, try again.");
    }
    document.getElementById("next-button").style.display = "block"; // Show next question button
}

function checkAnswer(questionIndex, selectedAnnotation) {
    if (questions[questionIndex].type === "annotation" && selectedAnnotation === questions[questionIndex].annotationId) {
        alert("Correct!");
        score++;
        nextQuestion();
    } else {
        alert("Incorrect, try again.");
    }
}
