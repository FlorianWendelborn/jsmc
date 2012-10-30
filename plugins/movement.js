module.exports = function(game) {
  game.on("player:join", function(player) {
    player.client.on("packet:0a", on_move);
    player.client.on("packet:0b", on_move);
    player.client.on("packet:0c", on_move);
    player.client.on("packet:0d", on_move);
  });

  game.on("tick", update_positions.bind(null, game));
};

var on_move = function on_move(packet) {
  ["yaw", "pitch"].forEach(function(e) {
    if (typeof packet[e] !== "undefined") {
      packet[e] = packet[e] % 360;

      while (packet[e] < 0) {
        packet[e] += 360;
      }
    }
  });

  ["x", "y", "z", "stance", "on_ground", "yaw", "pitch"].forEach(function(k) {
    if (typeof packet[k] !== "undefined" && packet[k] !== player.position[k]) {
      player.new_position[k] = packet[k];
    }
  });

  if (player.new_position.y < -32) {
    player.new_position.y = 10;
    player.new_position.stance = 11.62;
  }
};

var update_positions = function update_positions(game) {
  game.players.filter(function(e) { return Object.keys(e.new_position).length > 0; }).forEach(function(player) {
    var x_delta = typeof player.new_position.x === "number" ? player.new_position.x - player.position.x : 0,
        y_delta = typeof player.new_position.y === "number" ? player.new_position.y - player.position.y : 0,
        z_delta = typeof player.new_position.z === "number" ? player.new_position.z - player.position.z : 0;

    var packet;

    if (x_delta > -4 && x_delta < 4 && y_delta > -4 && y_delta < 4 && z_delta > -4 && z_delta < 4) {
      packet = {
        pid:   0x21,
        eid:   player.eid,
        x:     x_delta,
        y:     y_delta,
        z:     z_delta,
        yaw:   player.new_position.yaw || player.position.yaw,
        pitch: player.new_position.pitch || player.position.pitch,
      };
    } else {
      packet = {
        pid:   0x22,
        eid:   player.eid,
        x:     player.new_position.x || player.position.x,
        y:     player.new_position.y || player.position.y,
        z:     player.new_position.z || player.position.z,
        yaw:   player.new_position.yaw || player.position.yaw,
        pitch: player.new_position.pitch || player.position.pitch,
      };
    }

    game.players.forEach(function(other) {
      if (other === player) { return; }
      other.client.emit("data", packet);
    });

    Object.keys(player.new_position).forEach(function(k) {
      player.position[k] = player.new_position[k];
      delete player.new_position[k];
    });
  });
};