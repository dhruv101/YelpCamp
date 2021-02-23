const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

//prettier-ignore
const geocodeLocation = (location) => {
	return geocoder.forwardGeocode({
			query: location,
			limit: 1
			}).send();
}

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res) => {
	const geoData = await geocodeLocation(req.body.campground.location);
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.body.features.length
		? geoData.body.features[0].geometry
		: { type: 'Point', coordinates: [77.2096600444895, 28.627377195241845] };
	campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
	campground.author = req.user._id;
	await campground.save();
	console.log(campground);
	req.flash('success', 'Successfully made a new campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
	const campground = await Campground.findById(req.params.id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author',
				select: 'username'
			}
		})
		.populate('author');
	if (!campground) {
		req.flash('error', 'Cannot find that campground!');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	if (!campground) {
		req.flash('error', 'Cannot find that campground!');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
	const { id } = req.params;
	const data = req.body.campground;
	const deleteImages = req.body.deleteImages;

	const campground = await Campground.findByIdAndUpdate(id, data);

	if (data.location !== campground.location) {
		const geoData = await geocodeLocation(data.location);
		if (geoData.body.features.length) {
			campground.geometry = geoData.body.features[0].geometry;
			await campground.save();
		}
	}

	if (req.files.length > 0) {
		const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
		campground.images.push(...imgs);
		await campground.save();
	}

	if (deleteImages) {
		for (let filename of deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({ $pull: { images: { filename: { $in: deleteImages } } } });
	}

	req.flash('success', 'Successfully updated campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted campground');
	res.redirect('/campgrounds');
};
