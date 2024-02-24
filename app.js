const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('SUCCESS')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertMovieNametoPascalCase = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

//API1 GET method

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM 
      movie;`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(moviename => convertMovieNametoPascalCase(moviename)),
  )
})

// API2 POST method

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const addMovieQuery = `
    INSERT INTO
       movie (director_id, movie_name, lead_actor)
    VALUES 
       (
        ${directorId},
        ${movieName},
        ${leadActor}
       );`
  const dbResponse = await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

const convertMovieDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

//API3 GET method

app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMoviesQuery = `
    SELECT
       *
    FROM
       movie
    WHERE
       movie_id = ${movieId};`
  const movie = await db.get(getMoviesQuery)
  console.log(movieId)
  response.send(convertMovieDbObjectToResponseObject(movie))
})

//API4 PUT method

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetaits = request.body
  const {directorId, movieName, leadActor} = movieDetaits
  const updateMovieQuery = `
   UPDATE 
      movie;
   SET 
      director_id: ${directorId},
      movie_name; ${movieName},
      lead_actor: ${leadActor}
   WHERE
      movie_id: ${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//API5 DELETE method

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM
       movie
    WHERE
       movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

const convertDirectorDetailsPascalCase = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

//API6 GET method

app.get('/directors/', async (request, response) => {
  const getAllDirectorQuery = `
    SELECT
       *
    FROM
      director;`
  const moviesArray = await db.all(getAllDirectorQuery)
  response.send(
    moviesArray.map(director => convertDirectorDetailsPascalCase(director)),
  )
})

const convertMovieNamePascalCase = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}

//API7 GET method

app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovieQuery = `
  SELECT 
     movie_name
  FROM
     director INNER JOIN movie
     ON director.director_id = ${directorId};`
  const movies = await db.all(getDirectorMovieQuery)
  console.log(directorId)
  response.send(movies.map(movienames => convertMovieNamePascalCase(movies)))
})

module.exports = app
