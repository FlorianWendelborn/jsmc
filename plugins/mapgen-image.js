var fs = require('fs'),
	PNG = require('pngjs').PNG;

fs.createReadStream('image.png')
  .pipe(new PNG({
      filterType: 4
  }))
  .on('parsed', function() {

    ready = this;
});

var ready = false;

var MapgenImage = module.exports = function MapgenImage(seed) {

};

MapgenImage.prototype.modify = function modify(chunk, cb) {
	if (ready) {
		var idx = (this.width * y + x) << 2;
		for (var x = 0; x < 16; ++x) {
			var rX = 128-(chunk.x * 16 + x);
			for (var z = 0; z < 16; ++z) {
				var rZ = 112+(chunk.z * 16 + z);
				var idx = (ready.width * rX + rZ) << 2;

				var r = ready.data[idx];
				var g = ready.data[idx+1];
				var b = ready.data[idx+2];

				var h = (r+g+b)/3;

				var t = 46;
				if (Math.abs(h-r) < 20 && Math.abs(h-g) < 20 && Math.abs(h-b) < 20) {
					if (h < 80) {
						// black
						t = 49;
					} else if (h < 160) {
						// grey
						t = 1;
					} else {
						// white
						t = 35;
					}
				} else if (r >= g && r >= b) {
					// r
					t = 46;
				} else if (g >= r && g >= b) {
					// g
					t = 133;
				} else {
					// b
					t = 22;
				}

				for (var y = 0; y < 1; y++) {
					chunk.set_block_type(x,z,y,t);
				}
			}
		}
		return cb(null, chunk);
	} else {
		setTimeout(function () {
			modify(chunk,cb);
		},10);
	}
};