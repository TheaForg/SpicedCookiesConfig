// SPDX-License-Identifier: GPL-3.0-or-later
// See https://github.com/staticvariablejames/CCtest

function testStockMarketDelta() {
    Util.wipeSave();

    Game.Earn(1e9);
    Game.harvestLumps(10);
    Game.Objects.Bank.getFree(1);
    Game.Objects.Bank.levelUp(); // Unlock the minigame

    // Continue the test after the minigame is unloaded
    CCSE.MinigameReplacer(function() {
        Game.Objects.Bank.switchMinigame(true); // Show the minigame
        let stockDiv = document.getElementById('bankGood-3');
        stockDiv.style.display = "inline-block"; // Force the good to be displayed
        let heightWithDelta = stockDiv.clientHeight;

        // Test we can disable the option
        document.getElementById('prefsButton').click();
        document.getElementById('SpiceButtondisplayStockDelta').click();
        document.getElementById('prefsButton').click();

        let heightWithoutDelta = stockDiv.clientHeight;
        console.assert(heightWithoutDelta < heightWithDelta);

        // Test we can enable it again
        document.getElementById('prefsButton').click();
        document.getElementById('SpiceButtondisplayStockDelta').click();
        document.getElementById('prefsButton').click();
        console.assert(stockDiv.clientHeight === heightWithDelta);

        console.log('Finished testStockMarketDelta()');
    }, 'Bank');
}

function testStockMarketHistory() {
    Util.wipeSave();
    Game.Earn(1e9);
    Game.harvestLumps(10);
    Game.Objects.Bank.getFree(1);
    Game.Objects.Bank.levelUp(); // Unlock the minigame

    let ranOnce = false;
    // Continue the test after the minigame is unloaded
    CCSE.MinigameReplacer(function() {
        if(ranOnce) return;
        ranOnce = true; // Work around Cookie Clicker calling launch() again on wipe save

        // Right now, the stock market has 16 minutes of history
        let ccseSave = CCSE.WriteSave(1);
        let vanillaSave = Game.WriteSave(1);

        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);
        Game.LoadSave(vanillaSave);
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 2);
        CCSE.LoadSave(ccseSave);
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);

        // Test disabling the function
        document.getElementById('prefsButton').click();
        document.getElementById('SpiceButtonsaveStockMarketHistory').click();
        ccseSave = CCSE.WriteSave(1);
        CCSE.LoadSave(ccseSave);
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 2);

        // Enable it again
        document.getElementById('SpiceButtonsaveStockMarketHistory').click();


        // Tick a few times, we will make sure it resets on ascension
        for(let i = 0; i < 15; i++) Game.Objects.Bank.minigame.tick();
        Game.Reincarnate(1); // skips the ascension screen

        Game.Earn(1e9);
        Game.harvestLumps(10);
        Game.Objects.Bank.getFree(1);
        Game.Objects.Bank.levelUp(); // Unlock the minigame

        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);
        ccseSave = CCSE.WriteSave(1);
        vanillaSave = Game.WriteSave(1);
        Game.LoadSave(vanillaSave);
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 2);
        CCSE.LoadSave(ccseSave);
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);

        // Same, but wiping the save this time
        for(let i = 0; i < 15; i++) Game.Objects.Bank.minigame.tick();
        Util.wipeSave();

        Game.Earn(1e9);
        Game.harvestLumps(10);
        Game.Objects.Bank.getFree(1);
        Game.Objects.Bank.levelUp(); // Unlock the minigame

        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);
        ccseSave = CCSE.WriteSave(1);
        vanillaSave = Game.WriteSave(1);
        Game.LoadSave(vanillaSave);
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 2);
        CCSE.LoadSave(ccseSave);
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);

        // Make sure loading the mod with an existing save does not break it
        Spice.saveGame = Spice.defaultSaveGame();
        Spice.loadStockMarketHistory();
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);
        Game.Objects.Bank.minigame.tick();
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 18);
    }, 'Bank');
}

function testAcrossAscensionsSettings() {
    Util.wipeSave();
    Game.Earn(1e9); // Unlock sugar lumps, which unlocks the 'Special' section of the stats menu
    document.getElementById('statsButton').click();
    console.assert(document.getElementById('menu').textContent.indexOf("Special") !== -1);

    Game.cookieClicks = 5;
    Game.wrinklersPopped = 7;
    Game.reindeerClicked = 13;
    Game.handmadeCookies = 19;
    Game.UpdateMenu();

    console.assert(document.getElementById('menu').textContent.indexOf("Cookie clicks : 5 (all time : 5)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Wrinklers popped : 7 (all time : 7)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Reindeer found : 13 (all time : 13)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Hand-made cookies : 19 (all time : 19)") !== -1);

    Util.Ascend(); Util.Reincarnate();

    console.assert(Spice.saveGame.bigCookieClicksPreviousAscensions === 5);
    console.assert(Spice.saveGame.wrinklersPoppedPreviousAscensions === 7);
    console.assert(Spice.saveGame.reindeerClickedPreviousAscensions === 13);
    console.assert(Spice.saveGame.handmadeCookiesPreviousAscensions === 19);

    Game.cookieClicks = 1000;
    Game.wrinklersPopped = 3000;
    Game.reindeerClicked = 1700;
    Game.handmadeCookies = 2300;
    Game.UpdateMenu();
    console.assert(document.getElementById('menu').textContent.indexOf("Cookie clicks : 1,000 (all time : 1,005)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Wrinklers popped : 3,000 (all time : 3,007)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Reindeer found : 1,700 (all time : 1,713)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Hand-made cookies : 2,300 (all time : 2,319)") !== -1);

    let save = CCSE.WriteSave(1);
    Util.wipeSave();
    CCSE.LoadSave(save);
    Game.UpdateMenu();
    console.assert(document.getElementById('menu').textContent.indexOf("Cookie clicks : 1,000 (all time : 1,005)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Wrinklers popped : 3,000 (all time : 3,007)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Reindeer found : 1,700 (all time : 1,713)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Hand-made cookies : 2,300 (all time : 2,319)") !== -1);
}