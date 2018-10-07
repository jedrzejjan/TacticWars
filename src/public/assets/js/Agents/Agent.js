class Agent {
  constructor(mapState, gameState, player) {
    this.mapState = mapState;
    this.gameState = gameState;
    this.player = player;
  } 
}

class AIAgent extends Agent {
  play() {
    //TROOP ACTION
    for(let line of this.mapState.troops) {
      for(let t of line) {
        if(!t.player.equals(this.player)) {
          
        }
      }
    }
  }
}

class LocalAgent extends Agent {
  
}
