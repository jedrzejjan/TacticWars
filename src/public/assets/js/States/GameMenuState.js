class GameMenuState extends Phaser.State {
  preload() {
  }

  create() {

    this.game.add.image(0, 0, 'menuBg');

    this.possibleMaps = ["Map1", "Map2"];
    this.moneyPerBuilding = 800;
    this.currentMap = 0

    this.chosenMoney = this.game.add.text(400, 500);
    this.leftMoneyButton = this.game.add.button(495, this.chosenMoney.bottom+10, 'leftArrow', this.leftMoney, this);
    this.leftMoneyButton.scale.setTo(0.1);
    this.rightMoneyButton = this.game.add.button(this.leftMoneyButton.right+5, this.chosenMoney.bottom+10, 'rightArrow', this.rightMoney, this);
    this.rightMoneyButton.scale.setTo(0.1);

    this.chosenMap = this.game.add.text(480, 75);
    this.leftMapButton = this.game.add.button(495, this.chosenMap.bottom+10, 'leftArrow', this.leftMap, this);
    this.leftMapButton.scale.setTo(0.1);
    this.rightMapButton = this.game.add.button(this.leftMapButton.right+5, this.chosenMap.bottom+10, 'rightArrow', this.rightMap, this);
    this.rightMapButton.scale.setTo(0.1);

    this.startButton = this.game.add.button(400, 250, 'startButton', this.startGame, this);

    this.updateMoneyChoice();
    this.updateMapChoice();
  }

  leftMoney() {
    this.moneyPerBuilding -= 800;
    if(this.moneyPerBuilding <= 800) {
      this.moneyPerBuilding = 800;
    }
    this.updateMoneyChoice();
  }

  rightMoney() {
    this.moneyPerBuilding += 800;
    if(this.moneyPerBuilding >= 16000) {
      this.moneyPerBuilding = 16000;
    }
    this.updateMoneyChoice();
  }

  leftMap() {
    this.currentMap--;
    this.currentMap = (this.currentMap + this.possibleMaps.length) % this.possibleMaps.length;
    this.updateMapChoice();
  }

  rightMap() {
    this.currentMap = (this.currentMap + 1) % this.possibleMaps.length;
    this.updateMapChoice();
  }

  updateMapChoice() {
    this.chosenMap.text = "Map: " + this.possibleMaps[this.currentMap];
  }

  updateMoneyChoice() {
    this.chosenMoney.text = "Money Per Building :" + this.moneyPerBuilding.toString();
  }

  startGame() {
    this.game.state.start('GameState', true, false, this.moneyPerBuilding, this.currentMap);
  }
}
