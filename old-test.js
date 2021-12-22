// SPDX-License-Identifier: GPL-3.0-or-later
// See https://github.com/staticvariablejames/CCtest

function testImplicitAssumptions() {
    console.assert(!Game.prefs.popup); // Used to simplify message in Spice.init
}
testImplicitAssumptions();

function testSugarFrenzyPatch() {
    Util.wipeSave();
    Game.Earn(1e9); // Unlock lumps
    Game.Upgrades['Sugar craving'].earn();
    Util.Ascend(); Util.Reincarnate();
    Game.lumps = 1;
    Game.Upgrades['Sugar frenzy'].click();
    console.assert(Game.Upgrades['Sugar frenzy'].bought == 0); // Check it is still present

    Game.lumps = 1;
    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonpatchSugarFrenzyPersistence').click();
    Game.Upgrades['Sugar frenzy'].click();
    console.assert(Game.Upgrades['Sugar frenzy'].bought == 1); // Check the patch works

    console.log("Finished testSugarFrenzyPatch()");
}

function test777buffs() {
    let unlockHC = function() {
        Game.Upgrades['Heavenly chip secret'].earn();
        Game.Upgrades['Heavenly cookie stand'].earn();
        Game.Upgrades['Heavenly bakery'].earn();
        Game.Upgrades['Heavenly confectionery'].earn();
        Game.Upgrades['Heavenly key'].earn();
    }
    Util.wipeSave();

    unlockHC();
    Game.Upgrades['Lucky digit'].earn();
    Game.Upgrades['Lucky number'].earn();

    console.assert(approx(Game.GetHeavenlyMultiplier(), 1.01**2));
    Spice.settings.buff777upgrades = true;
    console.assert(approx(Game.GetHeavenlyMultiplier(), 1.01*1.02));

    Game.Upgrades['Lucky payout'].earn();
    console.assert(approx(Game.GetHeavenlyMultiplier(), 1.01*1.02*1.04));
    Spice.settings.buff777upgrades = false;
    console.assert(approx(Game.GetHeavenlyMultiplier(), 1.01**3));

    let gc = new Game.shimmer('golden');
    console.assert(approx(gc.dur, 13*1.01**3));
    gc.force = 'multiply cookies'; gc.pop(); // Safely getting rid of the golden cookie

    Spice.settings.buff777upgrades = true;
    gc = new Game.shimmer('golden');
    console.assert(approx(gc.dur, 13*1.01*1.02*1.04));

    gc.force = 'frenzy'; gc.pop();
    console.assert(Game.buffs.Frenzy.maxTime == Math.ceil(77*1.01*1.02*1.04)*Game.fps);

    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonextra777seriesUpgrades').click();
    document.getElementById('prefsButton').click();

    Game.Upgrades['Lucky tally'].earn();
    console.assert(approx(Game.GetHeavenlyMultiplier(), 1.01*1.02*1.04*1.08));
    Game.Upgrades['Lucky value'].earn();
    console.assert(approx(Game.GetHeavenlyMultiplier(), 1.01*1.02*1.04*1.08*1.16));

    Spice.settings.buff777upgrades = false;
    console.assert(approx(Game.GetHeavenlyMultiplier(), 1.01**5));

    console.log("Finished test777buffs()");
}

function test777acquisition() {
    let earnHCUpgrades = function() {
        Game.Upgrades['Legacy'].earn();
        Game.Upgrades['Heavenly luck'].earn();
        Game.Upgrades['Lasting fortune'].earn();
        Game.Upgrades['Decisive fate'].earn();
    }

    Util.wipeSave();
    earnHCUpgrades();
    Game.Earn(8e8**3*1.00000001e12); // 800_000_002 prestige levels
    Util.Ascend(); Util.Reincarnate();
    Game.Earn(800_777_779**3*1.0000000000001e12 - 8e8**3*1.00000001e12); // another 777_777 levels

    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonsimplify777upgradeAcquisition').click();
    document.getElementById('prefsButton').click();
    let save = Game.WriteSave(1);
    Util.Ascend();
    console.assert(document.getElementById('heavenlyUpgrade411') != null);
    console.assert(document.getElementById('heavenlyUpgrade412') != null);
    console.assert(document.getElementById('heavenlyUpgrade413') != null);
    Util.Reincarnate();
    Util.Ascend();
    console.assert(document.getElementById('heavenlyUpgrade411') == null);
    console.assert(document.getElementById('heavenlyUpgrade412') == null);
    console.assert(document.getElementById('heavenlyUpgrade413') == null);
    Util.Reincarnate();

    Util.wipeSave();
    earnHCUpgrades();
    Game.Upgrades['Lucky payout'].earn();

    console.assert(Spice.settings.simplify777upgradeAcquisition == true);
    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonextra777seriesUpgrades').click();
    document.getElementById('prefsButton').click();
    Game.Earn(1e12+1); // One prestige level
    Util.Ascend();
    Util.Reincarnate();
    Game.Earn( (777_777_777_777_777 + 1)**3 * 1e12 ); // 777_777_777_777_777 prestige levels
    console.assert(Spice.stableHeavenlyChipGains() == 777_777_777_777_777);

    save = Game.WriteSave(1);
    let luckyTallyDivId = 'heavenlyUpgrade' + Game.Upgrades['Lucky tally'].id;
    Util.Ascend();
    console.assert(document.getElementById(luckyTallyDivId) != null); // It is unlocking
    console.log(luckyTallyDivId);

    Util.Reincarnate();
    Game.LoadSave(save);
    Game.Upgrades['Lucky tally'].earn();
    Util.Ascend();
    let luckyValueDivId = 'heavenlyUpgrade' + Game.Upgrades['Lucky value'].id;
    console.assert(document.getElementById(luckyValueDivId) != null); // It is unlocking

    Util.Reincarnate();
    Util.Ascend();
    console.assert(document.getElementById(luckyValueDivId) == null); // It is also locking

    Util.Reincarnate();
    Game.LoadSave(save);
    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonsimplify777upgradeAcquisition').click();
    document.getElementById('prefsButton').click();
    console.assert(Spice.settings.simplify777upgradeAcquisition == false);
    Util.Ascend();
    console.assert(document.getElementById(luckyTallyDivId) != null); // It still unlocks
    Util.Reincarnate();

    console.log("Finished test777acquisition()");
}

function testHeavenlyBackdoor() {
    Util.wipeSave();
    Game.Upgrades['Heavenly backdoor'].earn();
    Util.Ascend();
    console.assert(document.getElementById('heavenlyUpgrade181') != null);
    Util.Reincarnate();
    Util.Ascend();
    console.assert(document.getElementById('heavenlyUpgrade181') == null); // lost the upgrade
    Util.Reincarnate();

    console.log("Finished testHeavenlyBackdoor()");
}

async function testGFDDelayPatch() {
    Util.wipeSave('with minigames');
    Game.seed = 'aaaaa';

    await Util.waitMinigame('Wizard tower');

    Game.Objects['Wizard tower'].minigame.magic = 50;
    let save = Game.WriteSave(1);

    document.getElementById('grimoireSpell6').click(); // cast GFD, get FtHoF
    console.assert(Game.Objects['Wizard tower'].minigame.magic == 45);
    await Util.waitPredicate(() => Math.floor(Game.Objects['Wizard tower'].minigame.magic) != 45);
    console.assert(Math.floor(Game.Objects['Wizard tower'].minigame.magic) == 25);
    console.assert(Game.shimmers.length == 1);
    console.assert(Game.shimmers[0].force == 'clot');
    // This is the same as backfiring FtHoF with one spell cast

    // Patch, and check the patch works:
    Game.LoadSave(save);
    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonpatchGFDDelay').click();
    document.getElementById('prefsButton').click();
    document.getElementById('grimoireSpell6').click(); // cast GFD, get FtHoF
    console.assert(Game.Objects['Wizard tower'].minigame.magic == 25); // Instantaneous
    console.assert(Game.shimmers.length == 1);
    console.assert(Game.shimmers[0].force == 'cookie storm drop');
    // This is the same as succeeding FtHoF with zero spells cast

    console.log("Finished testGFDDelayPatch()");
}

async function testSeasonsAffectingFtHoFPatch() {
    Util.wipeSave('with minigames');
    Game.seed = 'aaaaa';
    await Util.waitMinigame('Wizard tower');
    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonpatchGFDDelay').click();
    document.getElementById('prefsButton').click(); // Easier testing

    let save = Game.WriteSave(1); // Same setup as testGFDDelayPatch

    let testFtHoF = function() {
        Game.Objects['Wizard tower'].minigame.magic = 50;
        document.getElementById('grimoireSpell1').click(); // cast FtHoF
        console.assert(Game.shimmers[0].force == 'cookie storm drop');

        Game.Objects['Wizard tower'].minigame.magic = 50;
        Game.Objects['Wizard tower'].minigame.spellsCastTotal = 5;
        Game.killShimmers();
        document.getElementById('grimoireSpell1').click();
        console.assert(Game.shimmers[0].force == 'clot');
    };
    testFtHoF();

    // Same results if we do patch FtHoF
    Game.LoadSave(save);
    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonpatchSeasonsAffectingFtHoF').click();
    document.getElementById('prefsButton').click();
    save = Game.WriteSave(1);

    testFtHoF();

    // Same results if we change seasons
    Game.LoadSave(save);
    Game.season = 'valentines';
    testFtHoF();

    // Same results after wiping the save
    Util.wipeSave('with minigames');
    Game.seed = 'aaaaa';
    testFtHoF();

    console.log("Finished testSeasonsAffectingFtHoFPatch()");
}

function testDoublePop() {
    Util.wipeSave();

    // First demonstrate the bug
    let gc = new Game.shimmer('golden');
    gc.force = 'cookie storm drop';
    gc.pop();
    console.assert(Game.buffs.Frenzy == undefined);
    Math.seedrandom('test'); // Guarantees next pop is a Frenzy
    try {
        gc.pop();
    } catch (e) {
        // An exception is thrown when the game tries to remove the shimmer node twice
    }
    console.assert(Game.buffs.Frenzy != undefined); // A buff is generated nonetheless

    Util.wipeSave();
    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonpatchDoublePop').click();
    document.getElementById('prefsButton').click();

    gc = new Game.shimmer('golden'); // Same setup
    gc.force = 'cookie storm drop';
    gc.pop();
    Math.seedrandom('test');
    gc.pop();
    console.assert(Game.buffs.Frenzy == undefined); // Second pop has no effect
}
