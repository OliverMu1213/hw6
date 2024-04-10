document.addEventListener('DOMContentLoaded', () => {
    let guess_category;
    const selectedWords = new Set();
    let gameStatistics = JSON.parse(localStorage.getItem('gameStatistics')) || {
        gamesPlayed: 0,
        gamesWon: 0,
        currentWinStreak: 0,
        totalGuesses: 0,
        correctGuesses: 0,
    };

    function updateStatisticsDisplay() {
        const statsDiv = document.getElementById('game-stats');
        if (!statsDiv) {
            return;
        }

        statsDiv.innerHTML = `
            <p>Games Played: ${gameStatistics.gamesPlayed}</p>
            <p>Successful Guesses: ${gameStatistics.correctGuesses}</p>
            <p>Games Won: ${gameStatistics.gamesWon}</p>
            <p>Current Win Streak: ${gameStatistics.currentWinStreak}</p>
            <p>Average Guesses: ${(gameStatistics.totalGuesses / gameStatistics.gamesPlayed).toFixed(2) || 0}</p>
        `;
    }

    function setUpNewGame(categories) {
        console.log(categories);
        guess_category = categories;
        drawGameBoard(categories);

        gameStatistics.gamesPlayed++;
        updateStatisticsDisplay();
    }

    const newGameButton = document.getElementById('new-game');
    
    newGameButton.addEventListener('click', () => {
        selectedWords.clear();
        getRandomCategories(setUpNewGame);
        

        let submitButton = document.getElementById('submit-words');
        if (!submitButton) {
            submitButton = document.createElement('button');
            submitButton.id = 'submit-words';
            submitButton.textContent = 'Submit';
            submitButton.className = 'btn btn-success mx-2';
            newGameButton.parentNode.appendChild(submitButton);
            submitButton.addEventListener('click', () => {
            
                if (selectedWords.size === 4) {
                    console.log(selectedWords)
                    const guessResult = evaluateGuess(selectedWords, guess_category);
                    console.log(guessResult)
                    if (guessResult.isAllCorrect) {
                        gameStatistics.correctGuesses++;
                        alert('All words are in the same category! Well done!');
                        selectedWords.forEach(word => {
                            const wordElement = document.querySelector(`.word-box[data-word="${word}"]`);
                            wordElement.classList.add('highlighted');
                            wordElement.removeEventListener('click', wordElement.clickHandler);
                        });
    
                        if (gameStatistics.correctGuesses === 4) {
                            gameStatistics.gamesWon++;
                            gameStatistics.currentWinStreak++;
                            gameStatistics.correctGuesses = 0;
                            alert('Congratulations! You have guessed all categories correctly! Click New Game to play another one');
                        }
                    }else if(guessResult.wrongCount===2){
                        alert('At least two words are not part of the category');
                    }else if(guessResult.wrongCount===1){
                        alert('At least one word is not part of the category');
                    }else{
                        alert('Incorrect');
                    }
    
                    document.querySelectorAll('.word-box.selected').forEach(element => {
                        element.classList.remove('selected');
                    });
                    gameStatistics.totalGuesses++;
                    selectedWords.clear();
                    updateStatisticsDisplay();
                }else{
                    
                    alert('Please select at least 4 words');
                }
                
            });
        }
        
        
        let shuffleButton = document.getElementById('shuffle-words');
        if (!shuffleButton) {
            shuffleButton = document.createElement('button');
            shuffleButton.id = 'shuffle-words';
            shuffleButton.textContent = 'Shuffle';
            shuffleButton.className = 'btn btn-info mx-2';
            newGameButton.parentNode.appendChild(shuffleButton);
            shuffleButton.addEventListener('click', () => {
                shuffleArray(wordDivs);
        
                wordDivs.forEach(wordDiv => {
                    const colDiv = document.createElement('div');
                    colDiv.className = 'col-3';
                    colDiv.appendChild(wordDiv);
                    rowDiv.appendChild(colDiv);
                });
            });
        }
        

        let clearHistory = document.getElementById('clear-history');
        if (!clearHistory) {
            clearHistory = document.createElement('button');
            clearHistory.id = 'clear-history';
            clearHistory.textContent = 'Clear History';
            clearHistory.className = 'btn btn-danger mx-2';
            newGameButton.parentNode.appendChild(clearHistory);
            clearHistory.addEventListener('click', () => {
                gameBoard.innerHTML = '';
            
                gameStatistics = {
                    gamesPlayed: 0,
                    gamesWon: 0,
                    currentWinStreak: 0,
                    totalGuesses: 0,
                    correctGuesses: 0
                };
            
                updateStatisticsDisplay();
            
                const submitButton = document.getElementById('submit-words');
                const shuffleButton = document.getElementById('shuffle-words');
                const clearHistory = document.getElementById('clear-history');
                submitButton?.parentNode.removeChild(submitButton);
                shuffleButton?.parentNode.removeChild(shuffleButton);
                clearHistory?.parentNode.removeChild(clearHistory);
    
            });
        }

        

    });


    const gameBoard = document.getElementById('game-board');
    let wordDivs = [];
    let rowDiv;
    function drawGameBoard(categories) {
        gameBoard.innerHTML = '';
        wordDivs = [];
        categories.categories.forEach((category, index) => {
            if (index % 4 === 0) {
                rowDiv = document.createElement('div');
                rowDiv.className = 'row';
                gameBoard.appendChild(rowDiv);
            }
            
            category.words.forEach(word => {
                const colDiv = document.createElement('div');
                colDiv.className = 'col-3';
                const wordDiv = document.createElement('div');
                wordDiv.className = 'word-box p-2 m-1 text-center border';
                wordDiv.textContent = word;
                wordDiv.setAttribute('data-word', word);

                wordDiv.addEventListener('click', () => {
                    if (selectedWords.size < 4 || selectedWords.has(word)) {
                        wordDiv.classList.toggle('selected');
                        if (selectedWords.has(word)) {
                            selectedWords.delete(word);
                        } else {
                            selectedWords.add(word);
                        }
                    }
                });

                wordDivs.push(wordDiv);
            });
        });

        shuffleArray(wordDivs);

        wordDivs.forEach(wordDiv => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-3';
            colDiv.appendChild(wordDiv);
            rowDiv.appendChild(colDiv);
        });
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function evaluateGuess(selectedWords, categoriesData) {
        const categoriesArray = categoriesData.categories;

        let wordCategoryMap = new Map();
        categoriesArray.forEach(category => {
            category.words.forEach(word => {
                wordCategoryMap.set(word, category.category);
            });
        });
    
        let categoryCountMap = new Map();
        let maxCount = 0;
        let majorityCategory = null;
    
        selectedWords.forEach(word => {
            const category = wordCategoryMap.get(word);
            const count = (categoryCountMap.get(category) || 0) + 1;
            categoryCountMap.set(category, count);
    
            if (count > maxCount) {
                maxCount = count;
                majorityCategory = category;
            }
        });
    
        const isAllCorrect = maxCount === 4;
        const wrongCount = 4 - maxCount;
    
        return {
            correctCount: maxCount,
            wrongCount: wrongCount,
            isAllCorrect: isAllCorrect,
            majorityCategory: majorityCategory
        };
    }
});