const script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

const suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
let currentPlayer = 0;
let deck = [];
let players = [];
let player = {};
let houseStay = 0;
let aceIndex;
let hasAce = false;


function createDeck(){
  deck = [];

  for (let i = 0 ; i < values.length; i++){
      for(let x = 0; x < suits.length; x++){
          let weight = parseInt(values[i]);
          if (values[i] == "J" || values[i] == "Q" || values[i] == "K")
              weight = 10;
          if (values[i] == "A")
              weight = 11;
          const card = {
            Value: values[i],
            Suit: suits[x],
            Weight: weight
          };
        deck.push(card);
    }
  }
}

function createPlayers(num){
  for(let i = 1; i <= num; i++){
      const hand = new Array();
      player = {
        Name: 'Player ' + i,
        ID: i,
        Points: 0,
        Hand: hand
      };
      if(player.ID % 2 === 0) {
        player.Name = 'House';
      }
      players.push(player);
  }
  return players;
}

function createPlayersUI(players){

  $("#players").html("")

  for(var i = 0; i < players.length; i++){
      let div_player = $("<div></div>");
      let div_playerid = $("<div></div>");
      let div_hand = $("<div></div>");
      let div_points = $("<div></div>");

      $(div_points).addClass("points");
      $(div_points).attr('id', 'points_' + i)
      $(div_player).attr('id', 'player_' + i)
      $(div_player).addClass("player");
      $(div_hand).attr('id', 'hand_' + i);

      if(players[i].ID % 2 === 0){
        $(div_playerid).html('House');
      } else {
        $(div_playerid).html('Player ' + players[i].ID);
      }

      $(div_player).append(div_playerid);
      $(div_player).append(div_hand);
      $(div_player).append(div_points);
      $('#players').append(div_player);
  }
}

function shuffle(){

  for (var i = 0; i < 1000; i++){
      let location1 = Math.floor((Math.random() * deck.length));
      let location2 = Math.floor((Math.random() * deck.length));
      let tmp = deck[location1];

      deck[location1] = deck[location2];
      deck[location2] = tmp;
  }
}

function startblackjack(){
  currentPlayer = 0;
  deck = [];
  players = [];
  player = {};
  $("#btnStart").val("Restart");
  $("#status").css("display","none");
  createDeck();
  shuffle(deck);
  players = createPlayers(2);
  createPlayersUI(players);
  dealHands(deck, players);
  $("#player_" + currentPlayer).addClass("active")
  check();

}

function hitMe(){
  const card = deck.pop();
  players[currentPlayer].Hand.push(card);
  renderCard(card, currentPlayer);
  updatePoints();
  updateDeck();
  check();
  if(currentPlayer == 1 && players[currentPlayer].Points > 5){
    check();
    houseStay = 1;
    currentPlayer = 0;
    stay();
  }
}

function dealHands(){

  for(var i = 0; i < 2; i++){
      for (var x = 0; x < players.length; x++){
          var card = deck.pop();
          players[x].Hand.push(card);
          renderCard(card, x);
          updatePoints();
      }
  }

  updateDeck();
}

function renderCard(card, player){
  $("#hand_" + player).append(getCardUI(card))
}

function getCardUI(card){
  let el = $("<div></div>");
  let icon = '';
  if (card.Suit == 'Hearts')
  icon = '&hearts;';
  else if (card.Suit == 'Spades')
  icon = '&spades;';
  else if (card.Suit == 'Diamonds')
  icon = '&diams;';
  else
  icon = '&clubs;';

  $(el).addClass("card");
  if(icon === '&hearts;' && '&diams;'){
    $(el).css("color", "red");
    $(el).css("border-color", "black");
  }
  $(el).html(card.Value + "<br/>" + icon);
  return el;
}

function getPoints(player){

  let points = 0;
  for(let i = 0; i < players[player].Hand.length; i++){
      if(players[player].Hand[i].Value == "A"){
        hasAce = true;
        aceIndex = i;
      }
      points += players[player].Hand[i].Weight;
  }
  players[player].Points = points;
  return points;
}

function updatePoints(){
  for (let i = 0 ; i < players.length; i++){
      getPoints(i);
      $('#points_' + i).html(players[i].Points)
  }
}

function stay(){
  check();

  if (currentPlayer == 0 && houseStay == 1) {
      currentPlayer = 0;
      $("#status").html("Your Turn!");
      $("#status").css("display", "inline-block");
      houseStay = 0
      return;
    } else if (houseStay == 0 ) {
      houseTurn();
    }
}

function end(){
  let winner = -1;
  let score = 0;

  for(let i = 0; i < players.length; i++){
      if (players[i].Points > score && players[i].Points < 22){
          winner = i;
      }
      score = players[i].Points;
  }
  players = []

  $("#status").html('Winner: Player ' + players[winner].ID);
  $("#status").css("display", "inline-block");

}

function check(){
  if (players[1].Points > 21 || players[0].Points > 21) {
    aceFlipper();
  } else if (players[0].Points === players[1].Points){
    $("#status").html('Draw! Start again?');
    $("#status").css("display", "inline-block");
    end();
  } else if (players[0].Points === 21){
    $("#status").html('Blackjack 21, you win!');
    $("#status").css("display", "inline-block");
    end();
  } else if (players[1].Points === 21){
    $("#status").html('House got Blackjack 21, you loose!');
    $("#status").css("display", "inline-block");
    end();
  }
}

function aceFlipper(){
  if(hasAce){
    players[currentPlayer].Hand[aceIndex].Weight = 1;
    aceIndex = 0;
    hasAce = false;
    updatePoints();
  } if(players[1].Points > 21){
    $("#status").html('You won!');
    $("#status").css("display", "inline-block");
    end();
  } else if(players[0].Points > 21){
    $("#status").html('Whoops, you lost...');
    $("#status").css("display", "inline-block");
    end();
  }
}



function updateDeck(){
  $("#deckcount").html(deck.length);
}

function houseTurn(){
  let houseStay = 0;
  currentPlayer = 1;
      hitMe();
}


$(document).on('load', function(){
  createDeck();
  shuffle();
  createPlayers(1);
});
