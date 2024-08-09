const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'simulador_examenes'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL server.');
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Rutas

// Página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Página de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send('Username, email, and password are required');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).send('Error registering user');
        }
        res.redirect('/login');
    });
});

// Página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            return res.status(500).send('Error logging in');
        }

        if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
            return res.status(400).send('Incorrect email or password');
        }

        req.session.userId = results[0].id;
        res.redirect('/exam-selection');
    });
});

// Página de selección de examen
app.get('/exam-selection', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'examSelection.html'));
});

// Página del examen
app.get('/exam', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'exam.html'));
});

app.post('/submit-exam', (req, res) => {
    const userAnswers = req.body.answers;
    const examType = req.body.examType; // 40 or 80 questions

    db.query('SELECT * FROM questions WHERE exam_type = ?', [examType], (err, questions) => {
        if (err) {
            console.error('Error fetching questions:', err);
            return res.status(500).send('Error fetching questions');
        }

        let resultados = questions.map((question, index) => {
            const correctAnswer = question.correct_answer;
            const userAnswer = userAnswers[index] || [];
            const isCorrect = userAnswer.sort().join('') === correctAnswer.sort().join('');
            
            return {
                pregunta: question.text,
                opciones: {
                    a: question.option_a,
                    b: question.option_b,
                    c: question.option_c,
                    d: question.option_d,
                    e: question.option_e
                },
                correctAnswer,
                userAnswers: userAnswer,
                correcto: isCorrect
            };
        });

        req.session.resultados = resultados;
        res.redirect('/resultsPage');
    });
});

// Página de resultados
app.get('/resultsPage', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'resultsPage.html'));
});

// Servidor en escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
