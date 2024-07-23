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
    const count = parseInt(req.query.count);
    connection.query(`SELECT * FROM preguntas ORDER BY RAND() LIMIT ?`, [count], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving questions');
        }
        res.json(results);
    });
};
