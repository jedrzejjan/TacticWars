class PreloadState extends Phaser.State {
  preload() {
    this.game.add.image(0, 0, 'SplashScreenBG');
    this.loadingText = this.game.add.text(this.game.world.centerX, this.game.world.centerY+200, "LOADING");
    this.progressText = this.game.add.text(this.game.world.centerX, this.game.world.centerY+250);
    this.loadingText.anchor.x = 0.5;
    this.progressText.anchor.x = 0.5;
    this.game.load.onFileComplete.add(this.updateLoadingBar, this); //The second argument is the context of the called function

    this.game.load.tilemap('map_0', 'assets/maps/SmallMap.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.tilemap('map_1', 'assets/maps/FirstMap.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('Terrains', 'assets/tiles/TerrainTiles.png');
    //LOAD TROOPS IMAGES

    // upload blue army
    //TEMP:
    this.loadSpritesheet('aair',4 , 'troop', 'blue');
    this.loadSpritesheet('apc', 4 , 'troop', 'blue');
    this.loadSpritesheet('artry', 4 , 'troop', 'blue');
    this.loadSpritesheet('bcopter', 4 , 'troop', 'blue');
    this.loadSpritesheet('bomber', 4 , 'troop', 'blue');
    this.loadSpritesheet('infantry', 4 , 'troop', 'blue');
    this.loadSpritesheet('mdtank', 4 , 'troop', 'blue');
    this.loadSpritesheet('mech', 4 , 'troop', 'blue');
    this.loadSpritesheet('missile', 4 , 'troop', 'blue');
    this.loadSpritesheet('neotank', 4 , 'troop', 'blue');
    this.loadSpritesheet('recon', 4 , 'troop', 'blue');
    this.loadSpritesheet('rockets', 4 , 'troop', 'blue');
    this.loadSpritesheet('tank', 4 , 'troop', 'blue');
    this.loadSpritesheet('tcopter', 4 , 'troop', 'blue');

    // upload red army
    //TEMP:
    this.loadSpritesheet('aair', 4 , 'troop', 'red');
    this.loadSpritesheet('apc', 4 , 'troop', 'red');
    this.loadSpritesheet('artry', 4 , 'troop', 'red');
    this.loadSpritesheet('bcopter', 4 , 'troop', 'red');
    this.loadSpritesheet('bomber', 4 , 'troop', 'red');
    this.loadSpritesheet('infantry', 4 , 'troop', 'red');
    this.loadSpritesheet('mdtank', 4 , 'troop', 'red');
    this.loadSpritesheet('mech', 4 , 'troop', 'red');
    this.loadSpritesheet('missile', 4 , 'troop', 'red');
    this.loadSpritesheet('neotank', 4 , 'troop', 'red');
    this.loadSpritesheet('recon', 4 , 'troop', 'red');
    this.loadSpritesheet('rockets', 4 , 'troop', 'red');
    this.loadSpritesheet('tank', 4 , 'troop', 'red');
    this.loadSpritesheet('tcopter', 4 , 'troop', 'red');

    // upload green army
    //TEMP:
    this.loadSpritesheet('aair', 4 , 'troop', 'green');
    this.loadSpritesheet('apc', 4 , 'troop', 'green');
    this.loadSpritesheet('artry', 4 , 'troop', 'green');
    this.loadSpritesheet('bcopter', 4 , 'troop', 'green');
    this.loadSpritesheet('bomber', 4 , 'troop', 'green');
    this.loadSpritesheet('infantry', 4 , 'troop', 'green');
    this.loadSpritesheet('mdtank', 4 , 'troop', 'green');
    this.loadSpritesheet('mech', 4 , 'troop', 'green');
    this.loadSpritesheet('missile', 4 , 'troop', 'green');
    this.loadSpritesheet('neotank', 4 , 'troop', 'green');
    this.loadSpritesheet('recon', 4 , 'troop', 'green');
    this.loadSpritesheet('rockets', 4 , 'troop', 'green');
    this.loadSpritesheet('tank', 4 , 'troop', 'green');
    this.loadSpritesheet('tcopter', 4 , 'troop', 'green');

    // different animations
    this.loadSpritesheet('explosion', 16, 'anims');
    this.loadSpritesheet('coinflip', 16, 'anims');
    this.loadSpritesheet('flag', 12, 'anims');
    this.loadSpritesheet('shot_left', 7, 'anims');
    this.loadSpritesheet('shot_up', 7, 'anims');
    this.loadSpritesheet('shot_right', 7, 'anims');
    this.loadSpritesheet('shot_down', 7, 'anims');
    //Load damageTable info
    this.game.load.json('damageTable', 'assets/info/damageTable.json');
    //Load end turn button, factory menu, victory menu and price info.
    this.game.load.image('endTurnButton', "assets/helpers/EndTurnButton.png");
    this.game.load.image('factoryMenu', 'assets/helpers/FactoryMenu.png');
    this.game.load.json('priceInfo', 'assets/info/priceInfo.json');
    this.game.load.json('buildingindex', 'assets/info/buildingindex.json');
    this.game.load.json('fixedCoordinates', 'assets/info/fixedCoordinates.json');
    this.game.load.json('troopsInfo', 'assets/info/troopInfo.json');
    this.game.load.image('victoryBg', 'assets/Images/VictoryBG.png');
    //frame info
    this.game.load.atlasJSONHash('digits', 'assets/tileInfoFrame/digits/info.png', 'assets/tileInfoFrame/digits/info.json');
    this.game.load.image('terrainInfoFrame', 'assets/tileInfoFrame/terrainFrame.png');
    this.game.load.image('troopInfoFrame', 'assets/tileInfoFrame/troopFrame.png');
    this.game.load.image('captPicture', 'assets/tileInfoFrame/info_capt.png');
    //digits
    this.game.load.atlasJSONHash('terrainNames', 'assets/tileInfoFrame/terrainNames/terrainNames.png', 'assets/tileInfoFrame/terrainNames/terrainNames.json');
    this.game.load.atlasJSONHash('troopNames', 'assets/tileInfoFrame/troopNames/troopNames.png', 'assets/tileInfoFrame/troopNames/troopNames.json');
    //load menu components
    this.game.load.image('menuBg', 'assets/Images/MenuBG.png');
    this.game.load.spritesheet('offlineButton', 'assets/helpers/OfflineButton.png', 644, 177, 2);
    this.game.load.spritesheet('onlineButton', 'assets/helpers/OnlineButton.png', 644, 177, 2);
    //Helping stuff
    this.game.load.image('leftArrow', 'assets/helpers/leftArrow.png');
    this.game.load.image('rightArrow', 'assets/helpers/rightArrow.png');
    this.game.load.image('startButton', 'assets/helpers/StartButton.png');
    this.game.load.image('audioButton', 'assets/helpers/Audio.png');
    //Troop info
    this.game.load.image('troopInfoBg', 'assets/Images/TroopInfoBG.png');

    this.game.load.audio('coinSound', 'assets/sprites/audio/coin.ogg');
    this.game.load.audio('shotSound', 'assets/sprites/audio/shot.mp3');
    this.game.load.audio('bombSound', 'assets/sprites/audio/bomb.mp3');
    this.game.load.audio('epicBackground', 'assets/sprites/audio/epicBackground.mp3');
  }

  create() {
    this.audioButton = game.add.button(game.width - 32, game.height - 32, 'audioButton', this.toggleAudio, this);
    this.game.stage.addChild(this.audioButton);
    this.game.state.start('MenuState');

    let backgroundMusic = this.game.add.audio('epicBackground');
    backgroundMusic.loop = true;
    backgroundMusic.play();
  }

  toggleAudio() {
    if(this.game.sound.mute) {
      this.game.sound.mute = false;
      this.audioButton.alpha = 1;
    }
    else {
      this.game.sound.mute = true;
      this.audioButton.alpha = 0.4;
    }
  }

  update() {

  }

  loadSpritesheet(object, nrOfFrames, type, color = null){
    if (type == 'troop') {
      let unit = object +'_'+ color.substring(0,1);
      this.game.load.spritesheet(unit, 'assets/sprites/troops/'+color+'/'+ unit + '.PNG', 64, 64, nrOfFrames);
    }
    else if (type == 'anims') {
      this.game.load.spritesheet(object, 'assets/sprites/anims/'+ object +'.PNG', 64, 64, nrOfFrames);
    }
  }

  updateLoadingBar(progress, fileKey, success, totalLoadedFiles, totalFiles) {
    if(this.progressText != null) {
      this.progressText.text = progress.toString();
    }
  }
}
