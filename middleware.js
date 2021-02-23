const { campgroundSchema, reviewSchema } = require('./schemas'); //Joy Schema
const Campground = require('./models/campground'); //Model Schema
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		//store the url they are requesting
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'You must be signed in first!');
		return res.redirect('/login');
	}
	next();
};

module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(obj => obj.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

module.exports.isAuthor = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground) {
		req.flash('error', 'Cannot find that campground!');
		return res.redirect('/campgrounds');
	}
	if (!campground.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to do that');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
});

module.exports.isReviewAuthor = catchAsync(async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to do that');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
});

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(obj => obj.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};
