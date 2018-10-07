class MenuState extends Phaser.State {
    preload() {

    }

    create() {
      this.game.add.image(0, 0, 'menuBg');
      let bo = this.game.add.button(100, 600, 'onlineButton', this.startOnline, this, 1, 0, 1, 0);
      let bf = this.game.add.button(450, 600, 'offlineButton', this.startOffline, this, 0, 1, 0, 1);
      bo.scale.setTo(0.5);
      bf.scale.setTo(0.5);
    }

    update() {

    }

    startOnline() {
      this.game.state.start('LobbiesState');
    }

    startOffline() {
      this.game.state.start('GameMenuState');
    }
}
