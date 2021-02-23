const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 200; i++) {
		const rand1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: '6007187cdb27033ce4de9503',
			location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae aspernatur, modi voluptates ad repudiandae necessitatibus dolorem quis libero incidunt non tempore velit dolor voluptatem cum. Excepturi quod temporibus iure eum.',
			price: price,
			geometry: {
				type: 'Point',
				coordinates: [cities[rand1000].longitude, cities[rand1000].latitude]
			},
			images: [
				{
					url:
						'https://res.cloudinary.com/uchiha10/image/upload/v1612795936/YelpCamp/kauxfh1843qgkp8g9tft.jpg',
					filename: 'YelpCamp/kauxfh1843qgkp8g9tft'
				},
				{
					url:
						'https://res.cloudinary.com/uchiha10/image/upload/v1612787948/YelpCamp/jmrrlpa56yutocyof4zj.jpg',
					filename: 'YelpCamp/jmrrlpa56yutocyof4zj'
				},
				{
					url:
						'https://res.cloudinary.com/uchiha10/image/upload/v1612796001/YelpCamp/baxn4gfqkllv0twxyard.jpg',
					filename: 'YelpCamp/baxn4gfqkllv0twxyard'
				}
			]
		});
		await camp.save();
	}
};

seedDB().then(() => {
	db.close();
});
