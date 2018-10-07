var color = {
  BLUE: 'b',
  RED: 'r',
  GREEN: 'g'
};

class Player {
  constructor(color, team, money) {
    this.color = color;
    this.team = team;
    this.money = money
  }

  isSameTeam(player) {
    if(player.team == this.team) {
      return true;
    }
    return false;
  }

  equals(otherPlayer) {
    if(otherPlayer == null) {
      return false;
    }
    return otherPlayer.color == this.color;
  }
}
