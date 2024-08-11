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

//list of persons
let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

//middleware for parsing json request
app.use(express.json())
//app.use(morgan('tiny'))
morgan.token('custom', (req,res) => JSON.stringify(req.body) )
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :custom'))

//to get all persons - commented as part of 3.13
/* app.get('/api/persons', (request, response) => {
  response.json(persons)
}) */
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
  app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const personToDelete = persons.find(person => person.id === id)//added for 3.9
    persons = persons.filter(person => person.id !== id)
  
    //response.status(204).end()-commented as part of 3.9
    //added below code for 3.9
    response.status(200).json(personToDelete)
  })  


  const generateId = () => {
    const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
      : 0
    return String(maxId + 1)
  }  

//create
app.post('/api/persons', (request, response) => {
  console.log(request.body)
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

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)
  console.log(persons)
  //send only the new person
  response.json(person)
})


//run on port
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})