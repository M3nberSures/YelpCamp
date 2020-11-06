
module.exports.formatCampgroundAddress = function(campground) {
    return `${campground.street} ${campground.city}, ${campground.state}, ${campground.country}`;
}
