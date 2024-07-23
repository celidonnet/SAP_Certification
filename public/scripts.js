let questions = [];
let currentQuestionIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const questionCount = urlParams.get('count');

    if (questionCount) {
        loadExam(questionCount);
    }
});

function loadExam(questionCount) {
    fetch(`/get-questions?count=${questionCount}`)
        .then(response => response.json())
        .then(data => {
            questions = data;
            currentQuestionIndex = 0;
            document.getElementById('examContainer').style.display = 'block';
            document.getElementById('submitExamButton').style.display = 'inline-block';
            document.getElementById('backButton').style.display = 'inline-block';
            document.getElementById('nextButton').style.display = 'inline-block';
            displayQuestion();
        })
        .catch(error => console.error('Error:', error));
}

function displayQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    const question = questions[currentQuestionIndex];
    const inputType = question.num_correctas > 1 ? 'checkbox' : 'radio';

    let optionsHTML = `
        ${question.opcion_a ? `<label><input id="options" type="${inputType}" name="pregunta_${question.id}" value="a">${question.opcion_a}</label><br>` : ''}
        ${question.opcion_b ? `<label><input id="options" type="${inputType}" name="pregunta_${question.id}" value="b">${question.opcion_b}</label><br>` : ''}
        ${question.opcion_c ? `<label><input id="options" type="${inputType}" name="pregunta_${question.id}" value="c">${question.opcion_c}</label><br>` : ''}
        ${question.opcion_d ? `<label><input id="options" type="${inputType}" name="pregunta_${question.id}" value="d">${question.opcion_d}</label><br>` : ''}
        ${question.opcion_e ? `<label><input id="options" type="${inputType}" name="pregunta_${question.id}" value="e">${question.opcion_e}</label><br>` : ''}
    `;

    questionContainer.innerHTML = `
        <h2>${question.pregunta}</h2>
        <div class="opciones">
            ${optionsHTML}
        </div>
    `;
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function submitExam() {
    const respuestasUsuario = [];
    questions.forEach((question, index) => {
        const userAnswers = [];
        document.querySelectorAll(`input[name="pregunta_${question.id}"]:checked`).forEach(input => {
            userAnswers.push(input.value);
        });
        respuestasUsuario.push({ preguntaId: question.id, userAnswers, index });
    });

    fetch('/corregir', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(respuestasUsuario)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al corregir el examen');
        }
        return response.json();
    })
    .then(data => {
        const resultadosDiv = document.getElementById('resultados');
        resultadosDiv.innerHTML = '<h2>Resultados:</h2>';
        data.resultados.sort((a, b) => a.index - b.index).forEach(resultado => {
            resultadosDiv.innerHTML += `
                <p>Pregunta ${resultado.index + 1}: ${resultado.correcto ? 'Correcta' : 'Incorrecta'}</p>
            `;
        });
    })
    .catch(error => console.error('Error:', error));
}

/* let questions = [];
let currentQuestionIndex = 0;
const userAnswers = {};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const questionCount = urlParams.get('count');

    if (questionCount) {
        loadExam(questionCount);
    }
});

function loadExam(questionCount) {
    fetch(`/get-questions?count=${questionCount}`)
        .then(response => response.json())
        .then(data => {
            questions = data;
            currentQuestionIndex = 0;
            document.getElementById('examContainer').style.display = 'block';
            document.getElementById('submitExamButton').style.display = 'inline-block';
            document.getElementById('backButton').style.display = 'inline-block';
            document.getElementById('nextButton').style.display = 'inline-block';
            displayQuestion();
        })
        .catch(error => console.error('Error:', error));
}

function displayQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    const question = questions[currentQuestionIndex];
    const inputType = question.num_correctas > 1 ? 'checkbox' : 'radio';

    let optionsHTML = `
        ${question.opcion_a ? `<label><input type="${inputType}" id="options" name="pregunta_${question.id}" value="a" ${isChecked(question.id, 'a')}>${question.opcion_a}</label><br>` : ''}
        ${question.opcion_b ? `<label><input type="${inputType}" id="options" name="pregunta_${question.id}" value="b" ${isChecked(question.id, 'b')}>${question.opcion_b}</label><br>` : ''}
        ${question.opcion_c ? `<label><input type="${inputType}" id="options" name="pregunta_${question.id}" value="c" ${isChecked(question.id, 'c')}>${question.opcion_c}</label><br>` : ''}
        ${question.opcion_d ? `<label><input type="${inputType}" id="options" name="pregunta_${question.id}" value="d" ${isChecked(question.id, 'd')}>${question.opcion_d}</label><br>` : ''}
        ${question.opcion_e ? `<label><input type="${inputType}" id="options" name="pregunta_${question.id}" value="e" ${isChecked(question.id, 'e')}>${question.opcion_e}</label><br>` : ''}
    `;

    questionContainer.innerHTML = `
        <h2>${question.pregunta}</h2>
        <div class="opciones">
            ${optionsHTML}
        </div>
    `;
}

function isChecked(questionId, option) {
    if (userAnswers[questionId] && userAnswers[questionId].includes(option)) {
        return 'checked';
    }
    return '';
}

function nextQuestion() {
    saveUserAnswer();
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

function previousQuestion() {
    saveUserAnswer();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function saveUserAnswer() {
    const currentQuestionId = questions[currentQuestionIndex].id;
    userAnswers[currentQuestionId] = [];
    document.querySelectorAll(`input[name="pregunta_${currentQuestionId}"]:checked`).forEach(input => {
        userAnswers[currentQuestionId].push(input.value);
    });
}

function submitExam() {
    saveUserAnswer();

    // Ensure all questions are included in the userAnswers, even if they were not answered
    questions.forEach(question => {
        if (!userAnswers[question.id]) {
            userAnswers[question.id] = [];
        }
    });

    fetch('/corregir', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userAnswers)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al corregir el examen');
        }
        return response.json();
    })
    .then(data => {
        const resultadosDiv = document.getElementById('resultados');
        resultadosDiv.innerHTML = '<h2>Resultados:</h2>';
        data.resultados.forEach((resultado, index) => {
            const questionIndex = questions.findIndex(q => q.id == resultado.preguntaId);
            resultadosDiv.innerHTML += `
                <p>Pregunta ${questionIndex + 1}: ${resultado.correcto ? 'Correcta' : 'Incorrecta'}</p>
            `;
        });
    })
    .catch(error => console.error('Error:', error));
} */