class BattleEngine {

  constructor(battleTable) {
    this.namesToIndexes = battleTable.indexes;
    this.damageTable = battleTable.damageTable;
  }

  //Calculate damage in percentage of the the initial life of the defendingTroop
  calculateDamage(attackingTroop, defendingTroop, terrain) {
    let attackingDamageValue = this.getDamageValue(attackingTroop, defendingTroop);
    let percentageDamage = this.applyFormula(attackingDamageValue, attackingTroop, defendingTroop, terrain);
    return percentageDamage;

  }

  //Private method
  //Accesses the table and verifies wether primary damage can be used.
  getDamageValue(attackingTroop, defendingTroop) {
    let attackingIndex = this.namesToIndexes[attackingTroop.getName()];
    let defendingIndex = this.namesToIndexes[defendingTroop.getName()];
    let primaryDamageValue = this.damageTable[attackingIndex][defendingIndex][0];
    let secondaryDamageValue = this.damageTable[attackingIndex][defendingIndex][1];

    if(primaryDamageValue != 0 && attackingTroop.ammo != 0) {
      return primaryDamageValue;
    }
    else {
      return secondaryDamageValue;
    }
  }

  //private method
  //Returns percentage of the original Life that is going to be wrecked
  applyFormula(damageValue, attackingTroop, defendingTroop, terrain) {
    let randomAdd = this.getRandomIntInclusive(0,9);
    return (damageValue + randomAdd)
      * (attackingTroop.life / 100.0)
      * (1-((terrain.defense * defendingTroop.life)/1000));
  }

  getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
  }
}
