require('dotenv').config();
const mongoose = require('mongoose');
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 5
    },
    number: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^\d{2,3}-\d+$/.test(v) && v.length >= 8;
            },
            message: props => `${props.value} is not a valid phone number! Format: XX-XXXXXX or XXX-XXXXX`
        }
    }
    })

const Person = mongoose.model('Person', personSchema)
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})  

module.exports = Person.model('Person', personSchema);
