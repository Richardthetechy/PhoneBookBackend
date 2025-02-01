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

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

morgan.token('postData', (req) => {
  if (req.method === 'POST'){
    return JSON.stringify(req.body)
  }
  return ' '
})
app.use(morgan(':method :url :status - :response-time ms :res[content-length] :postData'))


app.get('/api/persons', (req, res, next) => {
  if(req.body === undefined) {
    return res.status(404).json({error: "content missing"})
  }
  Person.find({}).then(persons => {
      res.json(persons)
    })
    .catch(err => next(err))
})

app.get('/info',  (req, res,next ) => {
  const reqTime = new Date()
  Person.countDocuments({}).then(count => {
    res.send(`
    <div>
    <p>Phonebook has info for ${count} people </p>
    <p>${reqTime}</p>
    `)
  })
  .catch(error => next(error))
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
  const {name, number} = req.body
  if (!number) {
    return res.status(400).json({
      error: "number missing"
    })
  }
  Person.findByIdAndUpdate(
    id, {name, number}, 
    {new: true}, 
    {runValidators:true, context:'query'})
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
app.use(errorHandler)
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
})