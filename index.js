const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

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
let persons = [
{ 
    id: "1",
    name: "Arto Hellas", 
    number: "040-123456"
  },
  { 
    id: "2",
    name: "Ada Lovelace", 
    number: "39-44-5323523"
  },
  { 
    id: "3",
    name: "Dan Abramov", 
    number: "12-43-234345"
  },
  { 
    id: "4",
    name: "Mary Poppendieck", 
    number: "39-23-6423122"
  }
]

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
  const reqTime = new Date()
  res.send(`
    <div>
    <p>Phonebook has info for ${persons.length} people </p>
    <p>${reqTime}</p>
    `)
})




app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = persons.find(person => person.id === id)
  console.log(person);
  
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
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
  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1000)
  }
  console.log(person)
  persons = persons.concat(person)
  res.json(person).end()
  
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`)
})