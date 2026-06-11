const mongoose = require ('mongoose')

const { Schema} = mongoose
const ProductSchema = new Schema ({
name: {type: String, requerid: true },
price: {type: String, requerid: true},
image: {type: String, requerid: false},
userId: {type: String, requerid: true},
})

const Product = mongoose.model('Product',  ProductSchema)

module.exports = Product