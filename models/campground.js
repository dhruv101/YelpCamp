const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary');

const ImageSchema = new Schema({
	url: String,
	filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
	{
		title: String,
		price: Number,
		images: [ImageSchema],
		geometry: {
			type: {
				type: String,
				enum: ['Point'],
				required: true
			},
			coordinates: {
				type: [Number],
				required: true
			}
		},
		description: String,
		location: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review'
			}
		]
	},
	opts
);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
	return `<h6><a href="/campgrounds/${this._id}">${this.title}</a></h6>
			<p>${this.location}</p>`;
});

CampgroundSchema.post('findOneAndDelete', async function (campground) {
	if (campground) {
		const res = await Review.deleteMany({ _id: { $in: campground.reviews } });
		for (let image of campground.images) {
			await cloudinary.uploader.destroy(image.filename);
		}
		console.log(res);
	}
});

module.exports = mongoose.model('Campground', CampgroundSchema);
