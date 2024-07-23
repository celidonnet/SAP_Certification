const mysql = require('mysql2');

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

module.exports = (req, res) => {
    const respuestasUsuario = req.body;

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

        const resultados = respuestasUsuario.map(({ preguntaId, userAnswers }) => {
            const correctAnswer = respuestasCorrectasMap[preguntaId] || [];
            const correcto = userAnswers.length === correctAnswer.length && userAnswers.every(val => correctAnswer.includes(val));
            return { preguntaId, correcto };
        });

        res.json({ resultados });
    });
};
