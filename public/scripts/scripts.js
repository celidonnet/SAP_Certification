//ESTE CODIGO FUNCIONA, TIENE RADIO Y CHECKBOX, NO FUNCIONA EL TIMER. NO TOCAR EXCEPTO MODIFICAR TIMER.

let questions = [];
let currentQuestionIndex = 0;
let timerInterval;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const questionCount = parseInt(urlParams.get('count'));
    const duration = questionCount === 40 ? 90 * 60 : 180 * 60; // 90 minutos para 40 preguntas, 180 minutos para 80 preguntas

    if (questionCount) {
        loadExam(questionCount);
        startTimer(duration);
    }
});

function loadExam(questionCount) {
    fetch(`/get-questions?count=${questionCount}`)
        .then(response => response.json())
        .then(data => {
            questions = data;
            currentQuestionIndex = 0;
            document.getElementById('examContainer').style.display = 'block';
            displayQuestion();
        })
        .catch(error => console.error('Error:', error));
}

// script.js

function startTimer(duration) {
    const display = document.getElementById('timer');
    let timer = duration, hours, minutes, seconds;

    timerInterval = setInterval(function () {
        hours = Math.floor(timer / 3600);
        minutes = Math.floor((timer % 3600) / 60);
        seconds = Math.floor(timer % 60);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = hours + ":" + minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(timerInterval);
            window.location.href = "/resultsPage";
        }
    }, 1000);
}


function displayQuestion() {
    const questionContainer = document.getElementById('questionContainer');
    const question = questions[currentQuestionIndex];
    const inputType = question.num_correctas > 1 ? 'checkbox' : 'radio';

    let optionsHTML = `
        ${question.opcion_a ? `<label><input type="${inputType}" name="pregunta_${question.id}" value="a">${question.opcion_a}</label><br>` : ''}
        ${question.opcion_b ? `<label><input type="${inputType}" name="pregunta_${question.id}" value="b">${question.opcion_b}</label><br>` : ''}
        ${question.opcion_c ? `<label><input type="${inputType}" name="pregunta_${question.id}" value="c">${question.opcion_c}</label><br>` : ''}
        ${question.opcion_d ? `<label><input type="${inputType}" name="pregunta_${question.id}" value="d">${question.opcion_d}</label><br>` : ''}
        ${question.opcion_e ? `<label><input type="${inputType}" name="pregunta_${question.id}" value="e">${question.opcion_e}</label><br>` : ''}
    `;

    questionContainer.innerHTML = `
        <h2>Question ${currentQuestionIndex + 1}</h2>
        <p style="margin-top:10px; margin-bottom:10px;">${question.pregunta}</p>
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

    questions.forEach(question => {
        const userAnswers = [];
        document.querySelectorAll(`input[name="pregunta_${question.id}"]:checked`).forEach(input => {
            userAnswers.push(input.value);
        });
        respuestasUsuario.push({ preguntaId: question.id, userAnswers });
    });

    fetch('/corregir', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(respuestasUsuario),
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('resultados', JSON.stringify(data));
        window.location.href = '/resultsPage.html';
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById('nextButton').addEventListener('click', nextQuestion);
document.getElementById('backButton').addEventListener('click', previousQuestion);
document.getElementById('submitExamButton').addEventListener('click', submitExam);


/* let questions = [];
let currentQuestionIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const questionCount = urlParams.get('count');
    const duration = questionCount == 40 ? 90 * 60 : 180 * 60; // 1.5 horas para 40 preguntas, 3 horas para 80 preguntas


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
           /*  startTimer(duration); */
            /* displayQuestion();
        })
        .catch(error => console.error('Error:', error));
}

// Variables para el temporizador
let timer;

function startTimer(duration) {
    let timer = duration, hours, minutes, seconds;
    setInterval(function () {
        hours = parseInt(timer / 3600, 10);
        minutes = parseInt((timer % 3600) / 60, 10);
        seconds = parseInt(timer % 60, 10);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById('timer').textContent = hours + ":" + minutes + ":" + seconds;

        if (--timer < 0) {
            // Redirige a la página de resultados cuando el tiempo se acaba
            window.location.href = "/resultsPage";
        }
    }, 1000);
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
        respuestasUsuario.push({ preguntaId: question.id, userAnswers, pregunta: question.pregunta, opciones: {
            a: question.opcion_a,
            b: question.opcion_b,
            c: question.opcion_c,
            d: question.opcion_d,
            e: question.opcion_e
        }});
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
        localStorage.setItem('resultados', JSON.stringify(data.resultados));
        window.location.href = '/resultsPage';
    })
    .catch(error => console.error('Error:', error));
} */