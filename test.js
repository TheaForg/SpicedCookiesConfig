// SPDX-License-Identifier: GPL-3.0-or-later
// See https://github.com/staticvariablejames/CCtest

function testStockMarketRows() {
    Util.wipeSave("with minigames");

    // Continue the test after the minigame is loaded
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

        // Test that disabling the option stays on load
        Spice.settings.displayStockDelta = false;
        let save = Game.WriteSave(1);
        Game.LoadSave(save);
        console.assert(stockDiv.clientHeight === heightWithoutDelta);

        Spice.settings.displayStockDelta = true;
        save = Game.WriteSave(1);
        Game.LoadSave(save);
        console.assert(stockDiv.clientHeight === heightWithDelta);

        // Test debug upgrade
        Game.Upgrades['Omniscient day traders'].buy();
        let heightWithBoth = stockDiv.clientHeight;
        console.assert(heightWithDelta < heightWithBoth);

        save = Game.WriteSave(1);
        Game.Upgrades['Omniscient day traders'].toggle();
        console.assert(stockDiv.clientHeight === heightWithDelta);

        Game.LoadSave(save);
        console.assert(stockDiv.clientHeight === heightWithBoth);

        Util.Ascend(); Util.Reincarnate(); // Ascending removes the upgrade
        console.assert(!Game.Has('Omniscient day traders'));
        Game.Objects.Bank.getFree(1); Game.Objects.Bank.switchMinigame(true);
        stockDiv.style.display = "inline-block"; // Force the good to be displayed
        console.assert(stockDiv.clientHeight === heightWithDelta);

        console.log('Finished testStockMarketRows()');
    }, 'Bank');
}

function testStockMarketHistory() {
    Util.wipeSave("with minigames");

    let ranOnce = false;
    // Continue the test after the minigame is loaded
    CCSE.MinigameReplacer(function() {
        if(ranOnce) return;
        ranOnce = true; // Work around Cookie Clicker calling launch() again on wipe save

        // Right now, the stock market has 16 minutes of history
        let saveGame = Game.WriteSave(1);

        Game.Objects.Bank.minigame.tick();
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 18);
        Util.wipeSave("with minigames");
        Game.LoadSave(saveGame);
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);

        Game.Objects.Bank.minigame.tick();
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 18);
        Game.LoadSave(saveGame);
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);

        // Test disabling the function
        document.getElementById('prefsButton').click();
        document.getElementById('SpiceButtonsaveStockMarketHistory').click();
        saveGame = Game.WriteSave(1);
        Game.LoadSave(saveGame);
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 2);

        // Enable it again
        document.getElementById('SpiceButtonsaveStockMarketHistory').click();


        // Tick a few times, we want to make sure it resets on ascension
        for(let i = 0; i < 15; i++) Game.Objects.Bank.minigame.tick();
        Util.Ascend(); Util.Reincarnate();

        Game.Objects.Bank.getFree(1); // Unlock the minigame
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);

        // Make sure loading the mod with an existing save does not break it
        Spice.saveGame = Spice.defaultSaveGame();
        Spice.loadStockMarketHistory(); // Pretend we just ran Game.LoadMod('Spice.js')
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 17);
        Game.Objects.Bank.minigame.tick();
        console.assert(Game.Objects.Bank.minigame.goodsById[0].vals.length === 18);

        // Make sure loading the mod with an old version does not break it
        Util.wipeSave('with minigames');
        let original = Spice.stockMarketGoodsCount;
        Spice.stockMarketGoodsCount = () => 15; // fool saveStockMarketHistory
        save = Game.WriteSave(1);
        Spice.stockMarketGoodsCount = original;
        Game.LoadSave(save);
        Game.Objects.Bank.minigame.tick(); // Should not throw any exceptions
        console.log('Finished testStockMarketHistory()');
    }, 'Bank');
}

function testAcrossAscensionsStatistics() {
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

    let saveGame = Game.WriteSave(1);
    Spice.saveGame = Spice.defaultSaveGame(); // Wipe save data
    Spice.saveGame.bigCookieClicksPreviousAscensions = 55;
    Spice.saveGame.wrinklersPoppedPreviousAscensions = 77;
    Spice.saveGame.reindeerClickedPreviousAscensions = 133;
    Spice.saveGame.handmadeCookiesPreviousAscensions = 199;
    Util.wipeSave();
    console.assert(Spice.saveGame.bigCookieClicksPreviousAscensions === 0);
    console.assert(Spice.saveGame.wrinklersPoppedPreviousAscensions === 0);
    console.assert(Spice.saveGame.reindeerClickedPreviousAscensions === 0);
    console.assert(Spice.saveGame.handmadeCookiesPreviousAscensions === 0);
    Game.LoadSave(saveGame);
    Game.UpdateMenu();
    console.assert(document.getElementById('menu').textContent.indexOf("Cookie clicks : 1,000 (all time : 1,005)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Wrinklers popped : 3,000 (all time : 3,007)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Reindeer found : 1,700 (all time : 1,713)") !== -1);
    console.assert(document.getElementById('menu').textContent.indexOf("Hand-made cookies : 2,300 (all time : 2,319)") !== -1);
}

function testStockMarketTallying() {
    Util.wipeSave("with minigames");

    let ranOnce = false;
    // Continue the test after the minigame is loaded
    CCSE.MinigameReplacer(function() {
        if(ranOnce) return;
        ranOnce = true; // Work around Cookie Clicker calling launch() again on wipe save

        Game.Objects.Bank.switchMinigame(true); // Show the minigame
        let profitRow = document.getElementById('bankTally').parentNode;

        Game.Objects.Bank.minigame.profit = -10;
        Spice.updateProfitTallyDisplay();
        console.assert(profitRow.textContent.indexOf("all time : $0") !== -1);
        document.getElementById('prefsButton').click();
        document.getElementById('SpiceButtontallyOnlyStockMarketProfits').click();
        document.getElementById('prefsButton').click();
        console.assert(profitRow.textContent.indexOf("all time : -$10") !== -1);

        Game.Objects.Bank.minigame.profit = 50;
        Spice.updateProfitTallyDisplay();
        console.assert(profitRow.textContent.indexOf("all time : $50") !== -1);
        document.getElementById('prefsButton').click();
        document.getElementById('SpiceButtontallyOnlyStockMarketProfits').click();
        document.getElementById('prefsButton').click();
        console.assert(profitRow.textContent.indexOf("all time : $50") !== -1);

        Util.Ascend();
        console.assert(Spice.saveGame.stockMarketProfitsPreviousAscensions === 50);
        Util.Reincarnate();

        Game.Objects.Bank.getFree(1);
        Game.Objects.Bank.minigame.profit = -15;
        Spice.settings.tallyOnlyStockMarketProfits = true; // no need to check toggles anymore
        Spice.updateProfitTallyDisplay();
        console.assert(profitRow.textContent.indexOf("all time : $50") !== -1);
        Spice.settings.tallyOnlyStockMarketProfits = false;
        Spice.updateProfitTallyDisplay();
        console.assert(profitRow.textContent.indexOf("all time : $35") !== -1);

        Util.Ascend();
        console.assert(Spice.saveGame.stockMarketProfitsPreviousAscensions === 35);
        Util.Reincarnate();

        Game.Objects.Bank.minigame.profit = -10;
        Spice.settings.tallyOnlyStockMarketProfits = true;
        Spice.updateProfitTallyDisplay();
        console.assert(profitRow.textContent.indexOf("all time : $35") !== -1);

        Util.Ascend();
        console.assert(Spice.saveGame.stockMarketProfitsPreviousAscensions === 35);
        Util.Reincarnate();

        let saveGame = Game.WriteSave(1);
        Util.wipeSave();

        /* Wiping the save re-runs Game.Objects.Bank.minigame.launch,
         * which repopulates the bank minigame div.
         * So we have to run the line below again. */
        profitRow = document.getElementById('bankTally').parentNode;
        console.assert(profitRow.textContent.indexOf("all time : $0") !== -1);
        Game.LoadSave(saveGame);
        console.assert(profitRow.textContent.indexOf("all time : $35") !== -1);

        /* I don't think the situation below will ever happen,
         * because Spice.updateProfitTallyDisplay should be called every time the profit changes,
         * but just in case.
         */
        Game.Objects.Bank.minigame.profit = 30;
        Util.Ascend(); Util.Reincarnate();
        console.assert(Spice.saveGame.stockMarketProfitsPreviousAscensions === 65);
        console.assert(profitRow.textContent.indexOf("all time : $65") !== -1);

        console.log("Finished testStockMarketTallying()");
    }, 'Bank');
}

function testAcrossAscensionsAchievements() {
    Util.wipeSave('with minigames'); Util.startGrandmapocalypse();
    Spice.settings.awardAchievementsAcrossAscensions = false;

    Spice.saveGame.wrinklersPoppedPreviousAscensions = 49;
    Spice.saveGame.reindeerClickedPreviousAscensions = 49;
    Spice.saveGame.handmadeCookiesPreviousAscensions = 999;
    Spice.saveGame.stockMarketProfitsPreviousAscensions = 16e6;

    let ranOnce = false;
    CCSE.MinigameReplacer(function() { // Needs banks
        if(ranOnce) return;
        ranOnce = true;

        Util.spawnAndPopWrinkler();
        console.assert(!Game.HasAchiev('Wrinklesquisher'));

        Util.spawnReindeer().pop();
        console.assert(!Game.HasAchiev('Sleigh of hand'));

        Util.clickBigCookie();
        console.assert(!Game.HasAchiev('Clicktastic'));

        Game.Objects['Bank'].minigame.goodsById[3].stock = 1;
        Game.Objects['Bank'].minigame.goodsById[3].val = 16e6;
        Game.Objects['Bank'].minigame.sellGood(3, 1)
        console.assert(!Game.HasAchiev('Gaseous assets'));

        document.getElementById('prefsButton').click();
        document.getElementById('SpiceButtonawardAchievementsAcrossAscensions').click();
        document.getElementById('prefsButton').click();

        console.assert(Game.HasAchiev('Wrinklesquisher'));
        console.assert(Game.HasAchiev('Sleigh of hand'));
        console.assert(Game.HasAchiev('Clicktastic'));
        console.assert(Game.HasAchiev('Liquid assets'));

        // Now try again, but with the setting being true
        Util.wipeSave('with minigames'); Util.startGrandmapocalypse();
        Spice.settings.awardAchievementsAcrossAscensions = true;

        Spice.saveGame.wrinklersPoppedPreviousAscensions = 49;
        Spice.saveGame.reindeerClickedPreviousAscensions = 49;
        Spice.saveGame.handmadeCookiesPreviousAscensions = 999;
        Spice.saveGame.stockMarketProfitsPreviousAscensions = 16e6;

        console.assert(!Game.HasAchiev('Wrinklesquisher'));
        console.assert(!Game.HasAchiev('Sleigh of hand'));
        console.assert(!Game.HasAchiev('Clicktastic'));
        console.assert(!Game.HasAchiev('Liquid assets'));

        Util.spawnAndPopWrinkler();
        console.assert(Game.HasAchiev('Wrinklesquisher'));

        Util.spawnReindeer().pop();
        console.assert(Game.HasAchiev('Sleigh of hand'));

        Util.clickBigCookie();
        console.assert(Game.HasAchiev('Clicktastic'));

        Game.Objects['Bank'].minigame.goodsById[3].stock = 1;
        Game.Objects['Bank'].minigame.goodsById[3].val = 16e6;
        Game.Objects['Bank'].minigame.sellGood(3, 1)
        console.assert(Game.HasAchiev('Liquid assets'));

        console.log("Finished testAcrossAscensionsAchievements()");
    }, 'Bank');
}

function testAcrossAscensionsExtraAchievements() {
    Util.wipeSave(); Util.startGrandmapocalypse();
    Spice.settings.awardAchievementsAcrossAscensions = false; // Things should work even in this case

    Spice.saveGame.wrinklersPoppedPreviousAscensions = 999;
    Spice.saveGame.reindeerClickedPreviousAscensions = 999;

    Util.spawnAndPopWrinkler();
    console.assert(!Game.HasAchiev('Parasitesmasher'));

    Util.spawnReindeer().pop();
    console.assert(!Game.HasAchiev('A sleightly longer grind'));

    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonextraAchievementsAcrossAscensions').click();
    document.getElementById('prefsButton').click();

    console.assert(Game.HasAchiev('Parasitesmasher'));
    console.assert(Game.HasAchiev('A sleightly longer grind'));

    // Now try again, but with the setting being true
    Util.wipeSave('with minigames'); Util.startGrandmapocalypse();
    Spice.settings.awardAchievementsAcrossAscensions = true;

    Spice.saveGame.wrinklersPoppedPreviousAscensions = 999;
    Spice.saveGame.reindeerClickedPreviousAscensions = 999;

    console.assert(!Game.HasAchiev('Parasitesmasher'));
    console.assert(!Game.HasAchiev('A sleightly longer grind'));

    Util.spawnAndPopWrinkler();
    console.assert(Game.HasAchiev('Parasitesmasher'));

    Util.spawnReindeer().pop();
    console.assert(Game.HasAchiev('A sleightly longer grind'));
}

function testStockMarketAchievements() {
    Util.wipeSave("with minigames");

    let ranOnce = false;
    // Continue the test after the minigame is loaded
    CCSE.MinigameReplacer(function() {
        if(ranOnce) return;
        ranOnce = true;

        Game.Objects['Bank'].minigame.profit = 1e6 + 1;
        Game.Objects['Bank'].minigame.goodsById[3].stock = 1;
        Game.Objects['Bank'].minigame.sellGood(3, 1)
        console.assert(!Game.HasAchiev('Who wants to be a millionaire?'));

        document.getElementById('prefsButton').click();
        document.getElementById('SpiceButtonextraStockMarketAchievements').click();
        document.getElementById('prefsButton').click();
        console.assert(Game.HasAchiev('Who wants to be a millionaire?'));

        Util.wipeSave('with minigames');
        console.assert(!Game.HasAchiev('Who wants to be a millionaire?'));
        Game.Objects['Bank'].minigame.profit = 1e6 + 1;
        Game.Objects['Bank'].minigame.goodsById[3].stock = 1;
        Game.Objects['Bank'].minigame.sellGood(3, 1);
        console.assert(Game.HasAchiev('Who wants to be a millionaire?'));

        Game.Objects['Bank'].minigame.goodsById[3].stock = 3;
        Game.Objects['Bank'].minigame.sellGood(3, 1);
        console.assert(!Game.HasAchiev('Failing on purpose'));
        Game.Objects['Bank'].minigame.goodsById[3].val = 50; // for definiteness
        Game.Objects['Bank'].minigame.profit = -2e6;
        Game.Objects['Bank'].minigame.sellGood(3, 1);
        console.assert(!Game.HasAchiev('Failing on purpose'));
        Game.Objects['Bank'].minigame.sellGood(3, 1);
        console.assert(Game.HasAchiev('Failing on purpose'));

        console.assert(!Game.HasAchiev('Solid assets'));
        Game.Objects['Bank'].minigame.profit = -32e6;
        Game.Objects['Bank'].minigame.buyGood(4, 1);
        console.assert(Game.HasAchiev('Solid assets')); // even while having stock

        console.log("Finished testStockMarketAchievements()");
    }, 'Bank');
}

function testHeavenlyChipsNumericalPrecision() {
    Spice.settings.numericallyStableHeavenlyChipGains = false;
    Util.wipeSave();
    Game.Earn(1e75); // One sextillion (1e21) heavenly chips
    Util.Ascend(); Util.Reincarnate();

    // Next prestige level happens at (1e63 + 3e42 + 3e21 + 1)*1e12
    Game.Earn(3.001e42*1e12); // Enough a heavenly chip
    let saveGame = Game.WriteSave(1);

    Util.Ascend(); Util.Reincarnate();
    console.assert(Game.resets == 1); // Precision loss

    Game.LoadSave(saveGame);
    Spice.settings.numericallyStableHeavenlyChipGains = true;
    Util.Ascend(); Util.Reincarnate();
    console.assert(Game.resets == 2); // No precision loss here

    // Make sure we didn't mess up regular ascension
    Util.wipeSave();
    Game.Earn(1e12);
    Util.Ascend(); Util.Reincarnate();
    console.assert(Game.resets == 1);

    Game.Earn(6.9e12); // Not enough for another chip
    Util.Ascend(); Util.Reincarnate();
    console.assert(Game.resets == 1);
}

function testSeasonalCookieTooltips() {
    Util.wipeSave();
    let desc = "";

    Game.Upgrades[Game.easterEggs[0]].unlock();
    Game.Upgrades[Game.easterEggs[1]].unlock();
    Game.Upgrades[Game.easterEggs[2]].unlock();
    Game.Upgrades[Game.easterEggs[3]].earn();
    Game.Upgrades[Game.easterEggs[4]].earn();
    desc = Game.Upgrades['Bunny biscuit'].descFunc();
    console.assert(desc.includes("5/" + Game.easterEggs.length));

    Game.Upgrades[Game.santaDrops[0]].unlock();
    Game.Upgrades[Game.santaDrops[1]].unlock();
    Game.Upgrades[Game.santaDrops[2]].earn();
    Game.Upgrades[Game.reindeerDrops[0]].unlock();
    Game.Upgrades[Game.reindeerDrops[1]].unlock();
    Game.Upgrades[Game.reindeerDrops[2]].unlock();
    Game.Upgrades[Game.reindeerDrops[3]].unlock();
    Game.Upgrades[Game.reindeerDrops[4]].earn();
    Game.Upgrades[Game.reindeerDrops[5]].earn();
    Game.Upgrades[Game.reindeerDrops[6]].earn();
    desc = Game.Upgrades['Festive biscuit'].descFunc();
    console.assert(desc.includes("3/" + Game.santaDrops.length));
    console.assert(desc.includes("7/" + Game.reindeerDrops.length));

    Game.Upgrades[Game.halloweenDrops[0]].unlock();
    Game.Upgrades[Game.halloweenDrops[1]].earn();
    desc = Game.Upgrades['Ghostly biscuit'].descFunc();
    console.assert(desc.includes("1/" + Game.halloweenDrops.length));

    Game.Upgrades[Game.heartDrops[0]].unlock();
    Game.Upgrades[Game.heartDrops[1]].earn();
    Game.Upgrades[Game.heartDrops[2]].earn();
    desc = Game.Upgrades['Lovesick biscuit'].descFunc();
    console.assert(desc.includes("3/" + Game.heartDrops.length));

    // Test that earning everything does not change the line
    let text = Game.easterEggs.length + "/" + Game.easterEggs.length;
    for(let name of Game.easterEggs) Game.Upgrades[name].unlock();
    desc = Game.Upgrades['Bunny biscuit'].descFunc();
    console.assert(Array.from(desc.matchAll(text)).length == 1);

    // Test that unlocking everything does change the line
    for(let name of Game.easterEggs) Game.Upgrades[name].earn();
    desc = Game.Upgrades['Bunny biscuit'].descFunc();
    console.assert(Array.from(desc.matchAll(text)).length == 1);

    // Test that the setting is respected
    Spice.settings.autohideSeasonalBiscuitsTooltip = false;
    desc = Game.Upgrades['Bunny biscuit'].descFunc();
    console.assert(Array.from(desc.matchAll(text)).length == 2);
}

function testTranscendentDebugging() {
    Util.wipeSave();
    Game.Upgrades['Perfect idling'].earn();
    Util.Ascend(); Util.Reincarnate();
    console.assert(!Game.Has('Perfect idling'));

    Game.Upgrades['Perfect idling'].earn();
    Game.Upgrades['Transcendent debugging'].earn();
    Util.Ascend(); Util.Reincarnate();
    console.assert(Game.Has('Perfect idling'));
    console.assert(Game.Has('Transcendent debugging'));
}

function testDiscrepancyPatch() {
    /* One nasty effect of the lack of proper Date.now() mocking
     * is that this test only passes within an hour of loading page.
     */
    Util.wipeSave();
    Game.Earn(1e12); Game.doLumps(); // Unlock lumps
    Game.lumpT = Util.defaultMockedDate;
    console.assert(Game.lumpsTotal === 0);
    document.getElementById('prefsButton').click();
    document.getElementById('SpiceButtonpatchDiscrepancy').click();
    document.getElementById('prefsButton').click();

    let save = Game.WriteSave(1);

    Util.mockedDate += 25*3600*1000;
    for(let i = 0; i < 100; i++) { // The Vanilla is time-sensitive, this patch should not be
        Game.LoadSave(save);
        console.assert(Game.lumpT === Util.defaultMockedDate + 24*3600*1000);
    }

    Util.mockedDate += 24*3600*1000;
    Game.doLumps();
    console.assert(Game.lumpT === Util.defaultMockedDate + 2*24*3600*1000);

    Util.mockedDate += 22*3600*1000 + 1;
    Game.doLumps();
    console.assert(Game.lumpT === Util.defaultMockedDate + 2*24*3600*1000);
    Game.clickLump();
    console.assert(Game.lumpT < Util.defaultMockedDate + 3*24*3600*1000);
    console.assert(Game.lumpT > Util.mockedDate);
}

function testPantheonSlotSwapFix() {
    Util.wipeSave('with minigames');

    let ranOnce = false;
    // Continue the test after the minigame is loaded
    CCSE.MinigameReplacer(function() {
        if(ranOnce) return;
        ranOnce = true;
        document.getElementById('prefsButton').click();
        document.getElementById('SpiceButtonpatchPantheonSwaps').click();
        document.getElementById('prefsButton').click();

        let M = Game.Objects['Temple'].minigame;
        M.slotGod(M.godsById[0], 0);
        M.slotGod(M.godsById[1], 1);
        M.slotGod(M.godsById[2], 2);
        M.swaps = 3;
        console.assert(M.slotGod(M.godsById[3], 0) != false);
        console.assert(M.slotGod(M.godsById[4], 0) != false);
        console.assert(M.slotGod(M.godsById[2], 1) != false);
        console.assert(!(-1 in M.slot));
        console.assert(M.slot[0] === 4);
        console.assert(M.slot[1] === 2);
        console.assert(M.slot[2] === 1);
        console.assert(M.godsById[0].slot === -1);
        console.assert(M.godsById[1].slot === 2);
        console.assert(M.godsById[2].slot === 1);
        console.assert(M.godsById[3].slot === -1);
        console.assert(M.godsById[4].slot === 0);

        console.log('Finished testPantheonSlotSwapFix()');
    }, 'Temple');
}
