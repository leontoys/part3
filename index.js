//create express app
const express = require('express')
const app = express()
//morgan
const morgan = require('morgan')
//cors
const cors = require('cors')
require('dotenv').config()
//Mongo
const mongoose = require('mongoose')

const password = process.argv[2]
//import Person
const Person = require('./models/person')

app.use(cors())
//adding dist
app.use(express.static('dist'))

//error handler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

//list of persons
let persons = []

//middleware for parsing json request
app.use(express.json())
//app.use(morgan('tiny'))
morgan.token('custom', (req,res) => JSON.stringify(req.body) )
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :custom'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

//3.13++
  app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
  })

//to get info 
app.get('/info', (request, response) => {
    const requestedTime = new Date()
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
                   <p>${requestedTime}</p>`)
  })
  

//get specific person for id
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }) 

//delete
  app.delete('/api/persons/:id', (request, response, next) => {
    console.log(request.params.id)
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  }) 

//create
  app.post('/api/persons', (request, response) => {
    const body = request.body
  
//error handling
if(!body.name){
  return response.status(400).json({ 
    error: 'name missing' 
  })
}
else if(!body.number){
  return response.status(400).json({ 
    error: 'number missing' 
  })
} else if(persons.find(person => person.name === body.name)) {
  return response.status(400).json({ 
    error: 'name must be unique' 
  })
}
  
const person = new Person({
  name: body.name,
  number: body.number,
})
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
  })


  app.use(unknownEndpoint)
  app.use(errorHandler)

//run on port
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})