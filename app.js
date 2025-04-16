var iframe = document.getElementById('api-frame');
var client = new Sketchfab('1.12.1', iframe);
var uid = 'fd3ccceafd5947acaacb468be88d1a9c'; // Your model's UID

client.init(uid, {
    success: function(api) {
        api.start();
        api.addEventListener('viewerready', function() {
            console.log('Viewer is ready');
            setupClickEvents(api);
        });
    },
    error: function() {
        console.log('Viewer error');
    }
});

var questions = [
    {
        question: "Where is the optic canal located?",
        correctTag: 2 // Annotation index for the correct answer
    },
    // Add more questions as needed
];

var currentQuestionIndex = 0;
var score = 0;

function setupClickEvents(api) {
    api.addEventListener('annotationFocus', function(index) {
        console.log('Annotation clicked:', index); // Log the annotation index
        checkAnswer(currentQuestionIndex, index);
    });
    displayQuestion(currentQuestionIndex);
}

function displayQuestion(index) {
    var question = questions[index];
    document.getElementById('question').innerText = question.question;
    document.getElementById('options').innerHTML = ''; // Clear options as we are using annotations
}

function checkAnswer(questionIndex, selectedAnnotation) {
    var question = questions[questionIndex];
    console.log('Selected annotation:', selectedAnnotation); // Debugging statement
    console.log('Correct annotation:', question.correctTag); // Debugging statement
    if (selectedAnnotation === question.correctTag) {
        alert("Correct!");
        score++;
    } else {
        alert("Incorrect. Try again.");
    }
    document.getElementById('next-button').style.display = 'block';
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion(currentQuestionIndex);
        document.getElementById('next-button').style.display = 'none';
    } else {
        alert("Quiz completed! Your score: " + score);
    }
}
