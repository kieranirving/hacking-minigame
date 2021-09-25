var app = function() {
    let version = "1.0.0.0";
    let debug = false;
    let hOptions = 4,
        vOptions = 4,
        currentPosition = 0,
        correctSelections = 0,
        attempts = 0,
        currentOptions = [],
        lastPuzzle = false,
        countdown = 10,
        counterObj = null;
    return {
        init: () => {
            console.log(`Hacking Minigame ${version}`)

            window.addEventListener('message', function(event) {
                let wrap = document.querySelector('.hack-wrap');
                if (event.data.type == "enableui") {
                    wrap.classList.remove("hide");
                    setTimeout(function() {
                        app.generateGrid();
                    }, 2000);
                }
                if (event.data.type == "closeui") {
                    wrap.classList.add("hide");
                    app.resetToDefault();
                }
                if (event.data.type == "death") {
                    app.sendResult(false);
                }
            });
        },
        resetToDefault: function() {
            hOptions = 4;
            vOptions = 4;
            currentPosition = 0;
            correctSelections = 0;
            optionsCount = 0;
            attempts = 0;
            currentOptions = [];  
            lastPuzzle = false;
            document.querySelector('.option-container > .options').innerHTML = '';
            document.querySelector('#countdown svg circle').classList.remove('circle--10s');
            document.querySelector('#countdown svg circle').classList.remove('circle--8s');
            document.querySelector('.outcome').classList.add("hide")
            document.querySelector('.outcome > .message').innerHTML = '';
            document.querySelector('.loader').classList.remove("hide")
            Array.from(document.querySelectorAll('.attempts > div')).forEach((element, index) => {
                element.classList.remove('wrong')
            });
            countdown = 10;
        },
        log: (msg) => {
            if (debug) console.log(msg);
        },
        startUp: () => {
            document.querySelector('.loader').classList.add("hide");
            setTimeout(() => app.showPattern(), 1000);
        },
        generateNumber: (min, max) => {
            return Math.floor(Math.random() * (max - min) + min);
        },
        showPattern: () => {
            currentOptions = [];
            let optionList = document.querySelectorAll('.option');
            optionList.forEach((element, index) => {
                let optionsToGenerate = 1;
                if(hOptions == 5) optionsToGenerate = app.generateNumber(1,3);
                if(hOptions == 6) optionsToGenerate = app.generateNumber(1,4);
                let optionsGenerated = 0;
                
                let optionsToBeValid = [];
                for (let i = 0; i < optionsToGenerate; i++) {
                    let randomIndex = app.generateNumber(0,element.children.length);
                    let shouldLoop = true;
                    while (shouldLoop) {
                        if(!optionsToBeValid.includes(randomIndex)) {
                            optionsToBeValid.push(randomIndex);
                            shouldLoop = false;
                        } else {
                            randomIndex = app.generateNumber(0,element.children.length);
                        }
                    }
                }
                Array.from(element.children).forEach((child, cIndex) => {
                    if(!optionsToBeValid.includes(cIndex)) {
                        child.classList.add('notinpattern');
                    } else {
                        child.classList.remove('notinpattern');
                    }
                });
                currentOptions.push(optionsToBeValid)
            });
            app.log(currentOptions);
            setTimeout(() => app.startGame(), 1500);
        },
        startGame: () => {
            let optionList = document.querySelectorAll('.option');
            optionList.forEach((element, index) => { 
                element.classList.add('noselect');
                Array.from(element.children).forEach((child, cIndex) => {
                    child.classList.remove('notinpattern');
                });
            });
            optionList[0].classList.remove('noselect');
            document.querySelectorAll('.option div').forEach((element, index) => {
                element.addEventListener("click", function() {
                    if(this.className == '' ) {
                        if(app.checkSelection(Array.from(optionList).indexOf(this.parentNode), 
                                              Array.from(this.parentNode.children).indexOf(this))) {
                            this.className = 'correct';
                            app.log('click thing')
                            app.log(currentOptions[currentPosition].length)
                            app.log(correctSelections)
                            if(currentOptions[currentPosition].length >= 2) {
                                correctSelections++;
                                app.log('we are in the if statement')
                                app.log(correctSelections)
                                if(correctSelections == currentOptions[currentPosition].length) { 
                                    app.log('we are in the next if statement')
                                    app.moveToNext();
                                }
                                app.log('we carried on i guess')
                            } else {
                                app.moveToNext();
                            }
                            
                        } else {
                            this.className = 'error';
                            app.addAttempt();
                        }
                    }
                });
            });
            countdown = 10;
            document.querySelector('#countdown svg circle').classList.add('circle--10s');
            counterObj = setInterval(() => {
                countdown = --countdown;
                app.log(countdown);
                if(countdown == 0) {
                    app.sendResult(false, "Ran out of time");
                }
            }, 1000);
        },
        moveToNext: () => {
            if((currentPosition + 1) != hOptions) {
                let options = document.querySelectorAll(`.option`);
                options[currentPosition].classList.add('noselect');
                currentPosition++;
                options[currentPosition].classList.remove('noselect');
                correctSelections = 0;
            } else {
                if(lastPuzzle) {
                    app.sendResult(true);
                } else {
                    if(hOptions == 6 && vOptions == 5) {
                        app.log("last puzzle activated")
                        lastPuzzle = true;
                    } else {
                        if(vOptions != hOptions) {
                            vOptions++;
                        } else {
                            hOptions++;
                        }
                    }
                    document.querySelector('.options').innerHTML = '';
                    app.generateGrid();
                    document.querySelector('#countdown svg circle').classList.remove('circle--10s');
                    document.querySelector('#countdown svg circle').classList.remove('circle--8s');
                    clearInterval(counterObj);
                }           
            }
        },
        sendResult: (result, reason) => {
            document.querySelector('.outcome').classList.remove("hide")
            let message = document.querySelector('.outcome > .message');
            if(result) {
                message.classList.add("success")
                message.innerHTML = 'Success';
                setTimeout(() => $.post('https://erp-hacking/success', JSON.stringify({})), 2500)
            } else {
                message.classList.add("fail")
                message.innerHTML = 'Hack Failed';
                if(typeof reason !== 'undefined') {
                    message.innerHTML += `<br>${reason}`;
                }
                document.querySelector('#countdown svg circle').classList.remove('circle--10s');
                document.querySelector('#countdown svg circle').classList.remove('circle--8s');
                clearInterval(counterObj)
                setTimeout(() => $.post('https://erp-hacking/failure', JSON.stringify({})), 2500)
            }
        },
        addAttempt: () => {
            let attemptElm = document.querySelector('.attempts')
            attemptElm.children[attempts].className = 'wrong';
            if((attempts + 1) == 3) {
                let childToShow = document.querySelectorAll(`.option`);
                Array.from(childToShow).forEach((element, index) => {
                    element.classList.add('noselectfail')
                });
                app.sendResult(false, "Too many failed attempts");
            } else {
                attempts++;
            }
        },
        checkSelection: (parent, selectedIndex) => {
            app.log("Checking Selection")
            app.log(currentOptions[parent])
            app.log(selectedIndex);
            app.log(Array.from(currentOptions[parent]).includes(selectedIndex))
            if(Array.from(currentOptions[parent]).includes(selectedIndex)) {
                return true;
            } else {
                return false;
            }
        },
        generateGrid: () => {
            currentPosition = 0;
            correctSelections = 0;
            let options = document.querySelector('.options');
            let hTimeout = 250, vTimeout = 300;
            for(let i = 0; i < hOptions; i++) {
                setTimeout(() => {
                    let option = document.createElement('div')
                    option.className = 'option';
                    for(let j = 0; j < vOptions; j++) {
                        let oDiv = document.createElement('div');
                        oDiv.className = 'notinpattern';
                        if(j != 0) {
                            oDiv.className += ' hide';
                        }
                        option.append(oDiv);
                    }
                    options.append(option);
                }, hTimeout);
                hTimeout = hTimeout + 250;
            }
            setTimeout(() => {
                for(let i = 1; i < hOptions; i++) {
                    setTimeout(() => {
                        let childToShow = document.querySelectorAll(`.option div:nth-child(${i + 1})`);
                        Array.from(childToShow).forEach((element, index) => {
                            element.className = 'notinpattern';
                        });
                    }, vTimeout);
                    vTimeout = vTimeout + 300;
                }
                setTimeout(() => app.startUp(), vTimeout + 1000)
            }, hTimeout)
        }
    }
}();