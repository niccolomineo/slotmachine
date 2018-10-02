/**
* Slot Machine
* coded with ♥ by Niccolò Mineo
* www.niccolomineo.com
* © 2018
*/

document.addEventListener("DOMContentLoaded", function() {

    function SlotMachine(selector, maxBlur, hitDelay, superPrizeFigureIndex, keyToPress) {
        this.selector = selector;
        this.superPrizeFigureIndex = superPrizeFigureIndex;
        this.keyToPress = keyToPress;
        this.slots = [];
        this.initSlotIndex = 0;
        this.currSlotIndex = 0;
        this.initFiguresIndexes = [];
        this.slotsRollingStatus = false;
        this.currMatch = 0;
        this.figuresOffsetAmount = 2;
        this.figuresAmount = document.querySelectorAll(this.selector + ' ul')[0].querySelectorAll('li').length;
        this.initialSpeed = 1;
        this.maxSpeed = 200;
        this.maxBlur = maxBlur || 20;
        this.hitDelay = hitDelay || 300;
        this.dirSnd = 'snd';
        this.audioBgMusic = new Audio(this.dirSnd + '/bg_music.mp3');
        this.audioFileRoll = new Audio(this.dirSnd + '/roll.mp3');
        this.audioFileRollStop = new Audio(this.dirSnd + '/roll_stop.mp3');
        this.audioCrappyWin = new Audio(this.dirSnd + '/crappy_win.mp3');
        this.audioSuperPrize = new Audio(this.dirSnd + '/superprize.mp3');
        this.maxMatches = 300;
        this.superPrizeWinningMatchesSequencesCap = 10;
        this.allSameWinningMatchesSequencesCap = 20;
        this.uniqueWinningMatchesSequencesCap = 20;
        this.winningMatchesSequencesCap = this.superPrizeWinningMatchesSequencesCap + this.uniqueWinningMatchesSequencesCap + this.allSameWinningMatchesSequencesCap;
        this.init();
    }

    SlotMachine.prototype.height = function(el) {
        var height = el.offsetHeight;
        var style = getComputedStyle(el);
        height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        return height;
    }

    SlotMachine.prototype.init = function() {
        var sm = this,
        userCanHitAgain = true,
        lastHitTime = 0,
        winningMatchesSequences = function() {},
        superPrizeWinningMatchesSequences = [],
        allSameWinningMatchesSequences = [],
        uniqueWinningMatchesSequences = [],
        uniqueCombo,
        allSameCombo,
        twoSameCombo;

        sm.audio('play', sm.audioBgMusic, 0.2, true);

        document.body.addEventListener("keyup", function(e) {
            var keyWasPressed = e.keyCode === sm.keyToPress,
            currTime = Date.now();
            userCanHitAgain =  currTime - lastHitTime > sm.hitDelay;

            if (keyWasPressed && userCanHitAgain) {
                lastHitTime = Date.now(),
                matchHasStarted = !sm.slotsRollingStatus;

                if (sm.currMatch % sm.maxMatches === 0) {
                    sm.currMatch = 0;
                    winningMatchesSequences = sm.generateWinningMatchesSequences();
                    superPrizeWinningMatchesSequences = winningMatchesSequences.superPrize;
                    allSameWinningMatchesSequences = winningMatchesSequences.allSame;
                    uniqueWinningMatchesSequences = winningMatchesSequences.unique;
                    console.log('Super Prize sequence: ', superPrizeWinningMatchesSequences, 'All The Same sequence: ', allSameWinningMatchesSequences, 'Unique sequence: ', uniqueWinningMatchesSequences);
                }

                switch (true) {
                    case matchHasStarted:
                    sm.currMatch++;
                    uniqueCombo = sm.generateRandomCombo('unique');
                    allSameCombo = sm.generateRandomCombo('all-same');
                    twoSameCombo = sm.generateRandomCombo('two-same');
                    console.log('GAME ON!');
                    sm.slotsRollingStatus = true;

                    sm.audio('play', sm.audioFileRoll, 1, true);

                    for (var i = 0; i < sm.slots.length; i++) {
                        sm.animateSlot('start', i, SlotMachine.initFiguresIndexes[i]);
                    }
                    break;
                    case allSameWinningMatchesSequences.indexOf(sm.currMatch) > -1:
                    console.log('Current Match: ' + sm.currMatch + ' - all slots are the same!');
                    for (var i = 0; i < sm.slots.length; i++) {
                        sm.animateSlot('stop', i, allSameCombo[i]);
                    }
                    sm.slotsRollingStatus = false;

                    sm.audio('pause', sm.audioFileRoll, 1, false);
                    sm.audio('play', sm.audioFileRollStop, 1, false);
                    sm.audio('play', sm.audioCrappyWin, 0.4, false);
                    break;
                    case superPrizeWinningMatchesSequences.indexOf(sm.currMatch) > -1:
                    console.log('Current Match: ' + sm.currMatch + ' - super prize!');
                    for (var i = 0; i < sm.slots.length; i++) {
                        sm.animateSlot('stop', i, sm.superPrizeFigureIndex);
                    }
                    sm.slotsRollingStatus = false;

                    sm.audio('pause', sm.audioFileRoll, 1, false);
                    sm.audio('play', sm.audioFileRollStop, 1, false);
                    sm.audio('play', sm.audioSuperPrize, 0.2, false);
                    break;
                    default:
                    console.log('Current Match: ' + sm.currMatch + ' - two slots are the same!');
                    for (var i = 0; i < sm.slots.length; i++) {
                        sm.animateSlot('stop', i, twoSameCombo[i]);
                    }
                    sm.slotsRollingStatus = false;

                    sm.audio('pause', sm.audioFileRoll, 1, false);
                    sm.audio('play', sm.audioFileRollStop, 1, false);
                }
            }
        });
    }

    SlotMachine.prototype.generateWinningMatchesSequences = function() {
        var sm = this;
        var maxMatchesCollection = [],
        maxMatchesAmount = sm.maxMatches;
        while(maxMatchesAmount--) {
            maxMatchesCollection[maxMatchesAmount] = maxMatchesAmount+1;
        }

        var uniqueWinningMatchesSequences = sm.getRandomIntsAmount(maxMatchesCollection, sm.winningMatchesSequencesCap);

        var uniqueMatchesSequences = uniqueWinningMatchesSequences.splice(0, sm.uniqueWinningMatchesSequencesCap),
        superPrizeMatchesSequences = uniqueWinningMatchesSequences.splice(0, sm.superPrizeWinningMatchesSequencesCap);
        var allSameMatchesSequences = uniqueWinningMatchesSequences.filter(function(i) { return superPrizeMatchesSequences.indexOf(i) < 0; });

        return {
            unique : uniqueMatchesSequences,
            superPrize : superPrizeMatchesSequences,
            allSame : allSameMatchesSequences,
        }
    }

    SlotMachine.prototype.generateRandomCombo = function(result) {
        var sm = this,
        combo = [];

        switch (result) {
            case 'unique':
            while (combo.length < sm.slots.length) {
                var randomInt = sm.getRandomInt(1, sm.figuresAmount);
                if (combo.indexOf(randomInt) > -1) continue;
                combo[combo.length] = randomInt;
            }
            break;
            case 'all-same':
            var randomFigure = sm.getRandomInt(1, sm.slots.length);
            combo = Array.apply(null, Array(sm.slots.length)).map(function() { return randomFigure; });
            break;
            case 'two-same':
            while (combo.length < sm.slots.length) {
                var randomInt = sm.getRandomInt(1, sm.figuresAmount);
                if (combo.indexOf(randomInt) > -1) continue;
                combo[combo.length] = randomInt;
            }
            var randomIndexToGet = sm.getRandomInt(0, sm.slots.length-1);
            var randomFigure = combo[randomIndexToGet];
            var j = 0;
            while (j < sm.slots.length) {
                var randomIndexToSet = sm.getRandomInt(0, sm.slots.length-1);
                if (combo[randomIndexToGet] !== combo[randomIndexToSet]) {
                    combo[randomIndexToSet] = randomFigure;
                    break;
                }
                j++;
            }
            break;
        }
        return combo;
    }

    SlotMachine.prototype.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min+1)) + min;
    }

    SlotMachine.prototype.getRandomIntsAmount = function(arr, n) {
        var sm = this,
        result = new Array(n),
        len = arr.length,
        taken = new Array(len);
        if (n > len) {
            throw new RangeError("getRandomIntsAmount(): more elements taken than available");
        }
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    SlotMachine.prototype.animateSlot = function(action, slotIndex, figureIndex) {
        var sm = this;

        setTimeout(function() {
            switch (action) {
                case 'start':
                sm.slots[slotIndex].start(figureIndex);
                break;
                case 'stop':
                sm.slots[slotIndex].stop(figureIndex);
                break;
            }
        }, sm.slots[slotIndex].delay);
    }

    SlotMachine.prototype.audio = function(action, audioObject, volumeLevels, loopEnabled) {
        audioObject.volume = volumeLevels;
        switch (action) {
            case 'play':
            audioObject.loop = loopEnabled;
            audioObject.play();
            break;
            case 'pause':
            audioObject.loop = loopEnabled;
            audioObject.pause();
            break;
        }
    }

    function Slot(startAtFigureIndex, delay) {
        this.curr = document.querySelectorAll(SlotMachine.selector + ' ul')[SlotMachine.initSlotIndex];
        var firstFigure = this.curr.querySelectorAll('li')[0].cloneNode(true),
        lastFigure = this.curr.querySelectorAll('li')[this.curr.querySelectorAll('li').length-1].cloneNode(true);
        this.curr.insertBefore(lastFigure, this.curr.firstChild);
        this.curr.appendChild(firstFigure);
        this.height = SlotMachine.height(this.curr.querySelectorAll('li')[0]);
        this.currFigureIndex = this.getStartFigureIndex(startAtFigureIndex);
        this.posY = -((this.height * this.currFigureIndex) || SlotMachine.figuresOffsetAmount/2);
        this.blurIntensity = 0;
        this.speed = SlotMachine.initialSpeed;
        this.delay = delay || 0;
        this.accelerate = 0;
        SlotMachine.slots.push(this);
        SlotMachine.initFiguresIndexes.push(this.currFigureIndex);
        SlotMachine.slots[SlotMachine.initSlotIndex].init();
        SlotMachine.initSlotIndex++;
    }

    Slot.prototype.getStartFigureIndex = function(startAtFigureIndex) {
        var idx = null;
        switch (true) {
            case Number.isInteger(startAtFigureIndex):
            idx = startAtFigureIndex + SlotMachine.figuresOffsetAmount/2;
            break;
            case startAtFigureIndex === 'random':
            idx = SlotMachine.getRandomInt(SlotMachine.figuresOffsetAmount/2, SlotMachine.figuresAmount);
            break;
            default:
            idx = SlotMachine.figuresOffsetAmount/2;
        }
        console.log('Start Figure Index: ', idx);
        return idx;
    }

    Slot.prototype.init = function() {
        var s = this;
        this.curr.style.transform = 'translateY(' + s.posY + 'px)';
    }

    Slot.prototype.start = function() {
        var s = this;

        s.accelerate = function() {
            var isNextFigure = Math.abs(s.posY) % s.height === 0;

            if (isNextFigure) {
                // console.log(s.currFigureIndex + '/' + SlotMachine.figuresAmount + ' at pos: ' + s.posY + ' from: -' + (s.height * s.currFigureIndex) + 'px to: -' + (s.height * (s.currFigureIndex+1)) + 'px');
                var isLastFigure = s.currFigureIndex === SlotMachine.figuresAmount;
                if (isLastFigure) {
                    s.currFigureIndex = SlotMachine.figuresOffsetAmount/2;
                    s.posY = -s.height * (s.currFigureIndex-(SlotMachine.figuresOffsetAmount/2));
                }
            }

            s.posY -= s.height;

            var speedIsWithinUpperLimit = s.speed < SlotMachine.maxSpeed;
            if (speedIsWithinUpperLimit) {
                s.speed++;
            }

            var blurIsWithinUpperLimit = s.blurIntensity < SlotMachine.maxBlur;
            if (blurIsWithinUpperLimit) {
                s.blurIntensity++;
            }

            s.curr.style.transform = 'translateY(' + s.posY + 'px)';
            s.curr.style.filter = 'blur(' + s.blurIntensity + 'px)';

            if (isNextFigure) {
                s.currFigureIndex = (s.currFigureIndex % SlotMachine.figuresAmount)+1;
            }
            s.requestedAnimationFrameAcceleration = window.requestAnimationFrame(s.accelerate);
        };
        s.accelerate();
    }

    Slot.prototype.stop = function(atFigureIndex) {
        var s = this;

        if(!s.requestedAnimationFrameAcceleration) return false;

        window.cancelAnimationFrame(s.requestedAnimationFrameAcceleration);
        
        s.blurIntensity = 0;
        s.speed = SlotMachine.initialSpeed;
        s.posY = -(s.height * (atFigureIndex));
        s.currFigureIndex = atFigureIndex;
        s.curr.style.transform = 'translateY(' + s.posY + 'px)';
        s.curr.style.filter = 'blur(' + s.blurIntensity + 'px)';
    }

    var SlotMachine = new SlotMachine('#slotmachine', 20, 300, 6, 32);
    var Slot1 = new Slot('random');
    var Slot2 = new Slot('random', 130);
    var Slot3 = new Slot('random', 90);
});
