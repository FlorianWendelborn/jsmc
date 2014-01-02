var SimplexNoise = require("simplex-noise");

var MapgenSimplex = module.exports = function MapgenSimplex(seed) {
  this.seed = seed || Math.random();

  this.noise = new SimplexNoise(function() { return this.seed; }.bind(this));
};

MapgenSimplex.prototype.modify = function modify(chunk, cb) {
  for (var x = 0; x < 16; ++x) {
    for (var z = 0; z < 16; ++z) {
      var val = this.noise.noise3D((chunk.x * 16 + x) / 64, 64, (chunk.z * 16 + z) / 64);
      for (var y = 0; y < 256; ++y) {
        if (y < 64-10*val) {
          // stone
          chunk.set_block_type(x, z, y, 1);
        } else if (y < 66-10*val) {
          if (!(y+1 < 66-10*val)) {
            if (y < 61) {
              // sand below and around water level
              chunk.set_block_type(x,z,y,12);
            } else {
              // grass
              var valx = this.noise.noise3D((chunk.x * 16 + x) / 4, 64, (chunk.z * 16 + z) / 4);
              if (valx < 0.1) {
                chunk.set_block_type(x,z,y,31);
              }
            }
          } else {
            // dirt
            chunk.set_block_type(x,z,y,2);
          }
        } else if (y < 61) {
          // water below level 125
          chunk.set_block_type(x,z,y,8);
        }
      }
    }
  }

  return cb(null, chunk);
};
