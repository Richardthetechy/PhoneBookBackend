require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/index')
const url = process.env.MONGODB_URI

mongoose.connect(url)
.then(() => {
    console.log('Connected to MongoDB')
})
.catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
})



const app = express()
app.use(express.json())
app.use(morgan('dev'))
app.use(cors())
app.use(express.static('dist'))
morgan.token('postData', (req) => {
  if (req.method === 'POST'){
    return JSON.stringify(req.body)
  }
  return ' '
})
app.use(morgan(':method :url :status - :response-time ms :res[content-length] :postData'))
let persons = []

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
      res.json(persons)
    })
})

app.get('/info', (req, res) => {
  const reqTime = new Date()
  res.send(`
    <div>
    <p>Phonebook has info for ${persons.length} people </p>
    <p>${reqTime}</p>
    `)
})




app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
  .catch(error => next(error))

})
app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id 
  const {number} = req.body
  if (!number) {
    return res.status(400).json({
      error: "number missing"
    })
  }
  Person.findByIdAndUpdate(id, {number}, {new: true})
  .then(updatedPerson => {
    if (updatedPerson) {
      return res.json(updatedPerson)
    } else {
      return res.status(404).end()
    }
  })
  .catch(error => next(error))
})
app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id).then(result => {
    if (result) {
      res.status(204).end()
    } else {
      res.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "name or number missing"
    })
  } else if (persons.find(p => p.name.toLowerCase() === body.name.toLowerCase())) {
    return res.status(400).json({
      error: "name already exist"
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save().then(savedPerson => {
    res.json(savedPerson).end()
  }) 
  .catch(error => next(error))
  
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
})