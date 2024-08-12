//mongoose library
const mongoose = require('mongoose')

//check if password is entered
if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

//read password
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

//url to connect to mongodb
const url =
  `mongodb+srv://fullstack:${password}@cluster0.qo7uf0n.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)

//connect
mongoose.connect(url)

//strucute or shape of the record that will be stored
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

//create a model with that structure
const Person = mongoose.model('Person', personSchema)

//create new persson if name or number is given
if(name || number){
//create a new instance of the model with values
  const person = new Person({
    name: name,
    number: number
  } )

  //save the new record with the instance method - save
  person.save().then(result => {
  //console.log(result)
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  } )
}

//if only password is given, then get the records from db
else{
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}