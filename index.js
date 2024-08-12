const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'simulador_examenes'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

app.get('/get-questions', (req, res) => {
    const count = parseInt(req.query.count);
    connection.query(`SELECT * FROM preguntas ORDER BY RAND() LIMIT ?`, [count], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving questions');
        }
        res.json(results);
    });
});

// Ruta para manejar el temporizador y redirigir a la página de resultados
app.post('/timer-finished', (req, res) => {
    res.redirect('/resultsPage.html');
});

app.post('/submit-exam', (req, res) => {
    const userAnswers = req.body;

    connection.query('SELECT * FROM respuestas_correctas', (err, correctAnswers) => {
        if (err) {
            return res.status(500).send('Error retrieving correct answers');
        }

        const respuestasCorrectasMap = correctAnswers.reduce((map, answer) => {
            if (!map[answer.pregunta_id]) {
                map[answer.pregunta_id] = [];
            }
            map[answer.pregunta_id].push(answer.opcion_correcta);
            return map;
        }, {});

        const resultados = userAnswers.map(({ preguntaId, userAnswers }, index) => {
            const correctAnswer = respuestasCorrectasMap[preguntaId] || [];
            const correcto = userAnswers.length === correctAnswer.length && userAnswers.every(val => correctAnswer.includes(val));
            const question = questions.find(q => q.id === preguntaId);
            
            return {
                pregunta: question.pregunta,
                opciones: {
                    a: question.opcion_a,
                    b: question.opcion_b,
                    c: question.opcion_c,
                    d: question.opcion_d,
                    e: question.opcion_e
                },
                userAnswers: userAnswers,
                correctAnswer: correctAnswer,
                correcto: correcto
            };
        });

        res.json({ resultados: resultados });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/questionPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'questionPage.html'));
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
