// 应用状态
const appState = {
    currentLibrary: 'cet4', // 默认词库
    currentMode: 'learn', // 默认模式：记单词
    currentWordIndex: 0, // 当前单词索引
    userInput: [], // 用户输入的字母
    isInputCorrect: [], // 输入是否正确
    // 分页相关状态
    currentPage: 1, // 当前页码
    pageSize: 10 // 每页显示数量
};

// DOM 元素
const elements = {
    librarySelect: document.getElementById('library'),
    learnModeBtn: document.getElementById('learn-mode'),
    memorizeModeBtn: document.getElementById('memorize-mode'),
    wordIndex: document.getElementById('word-index'),
    wordDisplay: document.getElementById('word'),
    phoneticDisplay: document.getElementById('phonetic'),
    meaningDisplay: document.getElementById('meaning'),
    inputFeedback: document.getElementById('input-feedback'),
    message: document.getElementById('message'),
    prevWordBtn: document.getElementById('prev-word'),
    nextWordBtn: document.getElementById('next-word'),
    viewAllWordsBtn: document.getElementById('view-all-words'),
    allWordsSection: document.getElementById('all-words-section'),
    allWordsList: document.getElementById('all-words-list'),
    closeAllWordsBtn: document.getElementById('close-all-words'),
    pageSizeSelect: document.getElementById('page-size'),
    prevPageBtn: document.getElementById('prev-page'),
    nextPageBtn: document.getElementById('next-page'),
    pageInfo: document.getElementById('page-info')
};

// 初始化应用
function initApp() {
    // 绑定事件监听器
    bindEventListeners();
    // 加载初始单词
    loadCurrentWord();
}

// 绑定事件监听器
function bindEventListeners() {
    // 词库选择
    elements.librarySelect.addEventListener('change', (e) => {
        appState.currentLibrary = e.target.value;
        appState.currentWordIndex = 0;
        appState.currentPage = 1; // 切换词库时重置到第一页
        resetInput();
        loadCurrentWord();
        
        // 如果所有单词区域是打开的，更新单词列表
        if (elements.allWordsSection.style.display === 'block') {
            showAllWords();
        }
    });
    
    // 输入反馈区域点击事件
    elements.inputFeedback.addEventListener('click', () => {
        // 背单词模式下，点击输入区域时，让输入框获得焦点
        if (appState.currentMode === 'memorize') {
            try {
                const inputElement = document.getElementById('universal-input');
                if (inputElement) {
                    inputElement.focus({ preventScroll: true });
                }
            } catch (error) {
                // 捕获任何可能的错误，确保不会影响其他功能
                console.error('点击输入区域时出错:', error);
            }
        }
    });
    
    // 模式切换
    elements.learnModeBtn.addEventListener('click', () => {
        appState.currentMode = 'learn';
        updateModeButtons();
        resetInput();
        loadCurrentWord();
    });
    
    elements.memorizeModeBtn.addEventListener('click', () => {
        appState.currentMode = 'memorize';
        updateModeButtons();
        resetInput();
        loadCurrentWord();
    });
    
    // 控制按钮
    elements.prevWordBtn.addEventListener('click', () => {
        appState.currentWordIndex = (appState.currentWordIndex - 1 + getCurrentLibraryWords().length) % getCurrentLibraryWords().length;
        resetInput();
        loadCurrentWord();
    });
    
    elements.nextWordBtn.addEventListener('click', () => {
        appState.currentWordIndex = (appState.currentWordIndex + 1) % getCurrentLibraryWords().length;
        resetInput();
        loadCurrentWord();
    });
    
    // 查看所有单词
    elements.viewAllWordsBtn.addEventListener('click', () => {
        showAllWords();
    });
    
    // 关闭所有单词显示
    elements.closeAllWordsBtn.addEventListener('click', () => {
        hideAllWords();
    });
    
    // 分页相关事件
    elements.pageSizeSelect.addEventListener('change', (e) => {
        appState.pageSize = parseInt(e.target.value);
        appState.currentPage = 1;
        if (elements.allWordsSection.style.display === 'block') {
            showAllWords();
        }
    });
    
    elements.prevPageBtn.addEventListener('click', () => {
        if (appState.currentPage > 1) {
            appState.currentPage--;
            showAllWords();
        }
    });
    
    elements.nextPageBtn.addEventListener('click', () => {
        const words = getCurrentLibraryWords();
        const totalPages = Math.ceil(words.length / appState.pageSize);
        if (appState.currentPage < totalPages) {
            appState.currentPage++;
            showAllWords();
        }
    });
    
    // 键盘输入
    document.addEventListener('keydown', handleKeyPress);
}

// 处理键盘输入
function handleKeyPress(e) {
    // 记单词模式不需要输入
    if (appState.currentMode === 'learn') {
        return;
    }
    
    // 检查是否是从实际输入框触发的事件
    if (e.target.id === 'universal-input') {
        // 已经在input事件监听器中处理了
        return;
    }
    
    // 对于非输入框的键盘事件，比如用户直接按键盘
    const key = e.key.toLowerCase();
    const currentWord = getCurrentWord();
    
    // 只处理字母输入
    if (/^[a-z]$/.test(key)) {
        const currentInputLength = appState.userInput.length;
        
        // 如果还没有输入完所有字母
        if (currentInputLength < currentWord.length) {
            const correctLetter = currentWord[currentInputLength].toLowerCase();
            const isCorrect = key === correctLetter;
            
            // 添加输入和正确性状态
            appState.userInput.push(key);
            appState.isInputCorrect.push(isCorrect);
            
            // 更新输入反馈
            updateInputFeedback();
            
            // 检查是否输入完所有字母且全部正确
            if (appState.userInput.length === currentWord.length) {
                const allCorrect = appState.isInputCorrect.every(correct => correct);
                if (allCorrect) {
                    // 显示成功消息
                    showMessage('太棒了！', 'success');
                    
                    // 3秒后自动切换到下一个单词
                    setTimeout(() => {
                        appState.currentWordIndex = (appState.currentWordIndex + 1) % getCurrentLibraryWords().length;
                        resetInput();
                        loadCurrentWord();
                    }, 3000);
                }
            }
        }
    }
    
    // 处理退格键
    if (key === 'backspace' && appState.userInput.length > 0) {
        appState.userInput.pop();
        appState.isInputCorrect.pop();
        updateInputFeedback();
    }
}

// 获取当前词库的单词列表
function getCurrentLibraryWords() {
    return wordLibraries[appState.currentLibrary];
}

// 获取当前单词
function getCurrentWord() {
    return getCurrentLibraryWords()[appState.currentWordIndex].word;
}

// 加载当前单词
function loadCurrentWord() {
    const currentWordData = getCurrentLibraryWords()[appState.currentWordIndex];
    const currentWord = currentWordData.word;
    const wordsCount = getCurrentLibraryWords().length;
    
    // 更新单词序号
    elements.wordIndex.textContent = `单词 ${appState.currentWordIndex + 1}/${wordsCount}`;
    
    // 更新单词显示
    if (appState.currentMode === 'learn') {
        elements.wordDisplay.textContent = currentWord;
    } else {
        // 背单词模式：显示下划线
        elements.wordDisplay.textContent = '_'.repeat(currentWord.length);
    }
    
    // 更新音标和意思
    if (appState.currentMode === 'learn') {
        elements.phoneticDisplay.textContent = currentWordData.phonetic;
    } else {
        elements.phoneticDisplay.textContent = '';
    }
    elements.meaningDisplay.textContent = currentWordData.meaning;
    
    // 重置输入
    resetInput();
}

// 重置输入
function resetInput() {
    appState.userInput = [];
    appState.isInputCorrect = [];
    updateInputFeedback();
    
    // 重置通用输入框的值
    const inputElement = document.getElementById('universal-input');
    if (inputElement) {
        inputElement.value = '';
    }
}

// 更新输入反馈
function updateInputFeedback() {
    // 记单词模式不需要输入框
    if (appState.currentMode === 'learn') {
        elements.inputFeedback.style.display = 'none';
        return;
    }
    
    // 背单词模式显示输入框和字母反馈
    elements.inputFeedback.style.display = 'block';
    elements.inputFeedback.style.textAlign = 'center';
    
    const currentWord = getCurrentWord();
    
    // 检查是否已经存在字母反馈区域和输入框
    let lettersContainer = document.getElementById('letters-container');
    let inputElement = document.getElementById('universal-input');
    
    // 如果字母反馈区域不存在，创建它
    if (!lettersContainer) {
        lettersContainer = document.createElement('div');
        lettersContainer.id = 'letters-container';
        lettersContainer.style.display = 'flex';
        lettersContainer.style.justifyContent = 'center';
        lettersContainer.style.gap = '8px';
        lettersContainer.style.marginBottom = '10px';
        elements.inputFeedback.appendChild(lettersContainer);
    } else {
        // 清空现有的字母反馈
        lettersContainer.innerHTML = '';
    }
    
    // 为每个字母创建反馈元素
    for (let i = 0; i < currentWord.length; i++) {
        const letterDiv = document.createElement('div');
        letterDiv.style.display = 'inline-flex';
        letterDiv.style.alignItems = 'center';
        letterDiv.style.justifyContent = 'center';
        letterDiv.style.width = '40px';
        letterDiv.style.height = '40px';
        letterDiv.style.fontSize = '18px';
        letterDiv.style.fontWeight = '600';
        letterDiv.style.border = '2px solid #ddd';
        letterDiv.style.borderRadius = '8px';
        letterDiv.style.transition = 'all 0.3s ease';
        
        if (i < appState.userInput.length) {
            letterDiv.textContent = appState.userInput[i];
            if (appState.isInputCorrect[i]) {
                // 正确的字母显示绿色
                letterDiv.style.backgroundColor = '#27ae60';
                letterDiv.style.color = 'white';
                letterDiv.style.borderColor = '#27ae60';
            } else {
                // 错误的字母显示红色
                letterDiv.style.backgroundColor = '#e74c3c';
                letterDiv.style.color = 'white';
                letterDiv.style.borderColor = '#e74c3c';
            }
        } else {
            letterDiv.textContent = '_';
            letterDiv.style.color = '#333';
            letterDiv.style.backgroundColor = 'transparent';
        }
        
        lettersContainer.appendChild(letterDiv);
    }
    
    // 如果输入框不存在，创建它
    if (!inputElement) {
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.id = 'universal-input';
        inputElement.style.width = '80%';
        inputElement.style.maxWidth = '400px';
        inputElement.style.padding = '12px';
        inputElement.style.fontSize = '18px';
        inputElement.style.border = '2px solid #ddd';
        inputElement.style.borderRadius = '8px';
        inputElement.style.textAlign = 'center';
        inputElement.style.margin = '10px 0';
        inputElement.style.boxSizing = 'border-box';
        inputElement.placeholder = '请输入单词...';
        
        // 添加输入事件监听器
        inputElement.addEventListener('input', (e) => {
            const input = e.target.value.toLowerCase();
            const currentWord = getCurrentWord();
            
            // 限制输入长度
            if (input.length > currentWord.length) {
                e.target.value = input.substring(0, currentWord.length);
                return;
            }
            
            // 更新用户输入和正确性状态
            appState.userInput = [];
            appState.isInputCorrect = [];
            
            for (let i = 0; i < input.length; i++) {
                const correctLetter = currentWord[i].toLowerCase();
                const isCorrect = input[i] === correctLetter;
                appState.userInput.push(input[i]);
                appState.isInputCorrect.push(isCorrect);
            }
            
            // 更新输入反馈
            updateInputFeedback();
            
            // 重新聚焦输入框，防止移动端键盘消失
            setTimeout(() => {
                e.target.focus();
            }, 10);
            
            // 检查是否输入完所有字母且全部正确
            if (input.length === currentWord.length) {
                const allCorrect = appState.isInputCorrect.every(correct => correct);
                if (allCorrect) {
                    // 显示成功消息
                    showMessage('太棒了！', 'success');
                    
                    // 3秒后自动切换到下一个单词
                    setTimeout(() => {
                        appState.currentWordIndex = (appState.currentWordIndex + 1) % getCurrentLibraryWords().length;
                        resetInput();
                        loadCurrentWord();
                    }, 3000);
                }
            }
        });
        
        // 添加焦点事件监听器
        inputElement.addEventListener('focus', () => {
            // 焦点时添加样式效果
            inputElement.style.borderColor = '#3498db';
        });
        
        // 添加失焦事件监听器
        inputElement.addEventListener('blur', () => {
            // 失焦时恢复默认样式
            inputElement.style.borderColor = '#ddd';
        });
        
        elements.inputFeedback.appendChild(inputElement);
    }
    
    // 重置输入框的值
    if (appState.userInput.length === 0) {
        inputElement.value = '';
    } else {
        inputElement.value = appState.userInput.join('');
    }
}

// 更新模式按钮状态
function updateModeButtons() {
    if (appState.currentMode === 'learn') {
        elements.learnModeBtn.classList.add('active');
        elements.memorizeModeBtn.classList.remove('active');
    } else {
        elements.learnModeBtn.classList.remove('active');
        elements.memorizeModeBtn.classList.add('active');
    }
}

// 显示所有单词
function showAllWords() {
    const words = getCurrentLibraryWords();
    const pageSize = appState.pageSize;
    const currentPage = appState.currentPage;
    const totalPages = Math.ceil(words.length / pageSize);
    
    // 计算当前页的单词范围
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, words.length);
    const currentPageWords = words.slice(startIndex, endIndex);
    
    // 清空并生成单词列表
    elements.allWordsList.innerHTML = '';
    currentPageWords.forEach((wordData, index) => {
        // 计算单词在整个词库中的实际序号
        const actualIndex = startIndex + index + 1;
        
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <div class="word-index">${actualIndex}.</div>
            <div class="word">${wordData.word}</div>
            <div class="phonetic">${wordData.phonetic}</div>
            <div class="meaning">${wordData.meaning}</div>
        `;
        elements.allWordsList.appendChild(wordItem);
    });
    
    // 更新分页信息
    elements.pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    
    // 更新分页按钮状态
    elements.prevPageBtn.disabled = currentPage === 1;
    elements.nextPageBtn.disabled = currentPage === totalPages;
    
    // 显示遮罩层和弹窗
    document.getElementById('modal-overlay').style.display = 'flex';
    elements.allWordsSection.style.display = 'block';
}

// 隐藏所有单词
function hideAllWords() {
    document.getElementById('modal-overlay').style.display = 'none';
    elements.allWordsSection.style.display = 'none';
}

// 显示消息
function showMessage(text, type) {
    elements.message.textContent = text;
    elements.message.className = `message show ${type}`;
    
    // 3秒后自动隐藏消息
    setTimeout(() => {
        elements.message.className = 'message';
    }, 3000);
}

// 初始化应用
initApp();