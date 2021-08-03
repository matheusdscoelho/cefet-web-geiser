const express = require("express");
const app = express();
const fs = require("fs");

const PORT = 3000;
const baseUrl = "D:/cefet-web-geiser/server";
let dbJogador = {};
let dbJogosJogador = {};

app.use(express.static("D:/cefet-web-geiser/client"));

app.listen(PORT, function () {
  console.log("Porta 3000!");
});

dbJogosJogador = JSON.parse(
  fs.readFileSync(baseUrl + "/data/jogosPorJogador.json", {
    encoding: "utf8",
    flag: "r",
  })
);

dbJogador = JSON.parse(
  fs.readFileSync(baseUrl + "/data/jogadores.json", {
    encoding: "utf8",
    flag: "r",
  })
);

const compare = (a, b) => {
  if (a.playtime_forever < b.playtime_forever) {
    return 1;
  }
  if (a.playtime_forever > b.playtime_forever) {
    return -1;
  }
  return 0;
};

const getPlayerDeatils = (player) => {
  app.get(`/jogador/${player.steamid}`, function (req, res) {
    res.render(
      "jogador",
      Object.assign(player, dbJogosJogador[player.steamid])
    );
  });
};

const getNotPlayedGames = (games) => {
  let totalNotPlayed = 0;
  games.forEach((game) => {
    if (game.playtime_forever === 0) totalNotPlayed++;
  });

  return totalNotPlayed;
};

dbJogador.players.forEach((player) => {
  let games = dbJogosJogador[player.steamid].games.sort(compare).slice(0, 5);
  games.forEach(
    (e) => (e.playtime_forever = Math.floor(e.playtime_forever / 60))
  );
  player.notplayedgames = getNotPlayedGames(
    dbJogosJogador[player.steamid].games
  );
  player.favoriteGame = games[0];
  player.top5 = games;
  getPlayerDeatils(player);
});

app.set("view engine", "hbs");
app.set("views", baseUrl + "/views");

app.get("/", function (req, res) {
  res.render("index", dbJogador);
});
