require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const POKEDEX = require('./pokedex.json');
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
const app = express();
const PORT = process.env.PORT || 8000;


//MIDDLEWARE
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(400).json({error: 'Unauthorized request'})
    };

    next()
});

app.use((error, req, res, next) => {
    let response;
    if (process.env.NODE_ENV === 'production'){
        response = { error: {message: 'server error'}}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

//GET request handlers
app.get('/types', function handleGetTypes(req, res) {
    res.json(validTypes);
});

app.get('/pokemon', function handleGetPokemon(req, res) {
    let response = POKEDEX.pokemon;

    if (req.query.name) {
        response = response.filter(pokemon =>
            pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
        )
    }
    if (req.query.type) {
        function formatType(string) {
            const lowercase = req.query.type.toLowerCase();
            return lowercase.charAt(0).toUpperCase() + lowercase.substring(1)
        };

        if(!validTypes.includes(formatType(req.query.type))) {
            res.status(400).json({error: "Invalid request"})
        };

        response = response.filter(pokemon =>
            pokemon.type.includes(formatType(req.query.type))
        );
    }
    res.json(response)
});


//Listen on PORT
app.listen(PORT);
