import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import WordList from './components/WordList.jsx';
import WordDetail from './components/WordDetail.jsx';
import SmartSearch from './components/SmartSearch.jsx';
import TodayStudy from './components/TodayStudy.jsx';
import wenyanWords from './data/wenyanWords.json';
import './App.css';
import { getNextReviewDate } from './utils/ebbinghaus.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.jsx';
import { AppProvider, useAppContext } from './contexts/AppContext.jsx';

// 开发者工具面板
function DevTools() {
    const { simulatedDate, setSimulatedDate } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);

    const handleClearProgress = () => {
        if (window.confirm('确定要清空所有学习记录吗？此操作不可恢复。')) {
            localStorage.removeItem('learnedWords');
            window.location.reload();
        }
    };

    return (
        <div className={`dev-tools ${isOpen ? 'open' : ''}`}>
            <button
                className="dev-tools-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '关闭调试工具' : '打开调试工具'}
            </button>

            {isOpen && (
                <div className="dev-tools-content">
                    <div className="dev-tools-section">
                        <h3>日期控制</h3>
                        <input
                            type="date"
                            onChange={(e) => setSimulatedDate(e.target.value)}
                            value={simulatedDate || ''}
                            className="date-input"
                        />
                        <button
                            className="reset-date-btn"
                            onClick={() => setSimulatedDate(null)}
                        >
                            重置为真实日期
                        </button>
                    </div>

                    <div className="dev-tools-section">
                        <h3>学习记录</h3>
                        <button
                            className="clear-progress-btn"
                            onClick={handleClearProgress}
                        >
                            清空学习记录
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function App() {
    // 用户学习进度
    const [learnedWords, setLearnedWords] = useLocalStorage('learnedWords', []);

    // 获取特定字的数据
    const getWordByChar = (char) => {
        return wenyanWords.xuci.find(word => word.字 === char) || null;
    };

    return (
        <AppProvider>
            <Router>
                <div className="app-container">
                    <header className="app-header">
                        <h1>文言文助手</h1>
                        <p>虚词学习与查询工具</p>
                        <SmartSearch words={wenyanWords.xuci} />
                    </header>

                    <main className="app-content">
                        <Routes>
                            <Route
                                path="/"
                                element={<TodayStudy
                                    words={wenyanWords.xuci}
                                    learnedWords={learnedWords}
                                />}
                            />
                            <Route
                                path="/list"
                                element={<WordList
                                    words={wenyanWords.xuci}
                                    userProgress={learnedWords.reduce((acc, word) => {
                                        acc[word.wordId] = word;
                                        return acc;
                                    }, {})}
                                />}
                            />
                            <Route
                                path="/word/:char"
                                element={<WordDetailWrapper
                                    getWordByChar={getWordByChar}
                                    learnedWords={learnedWords}
                                    setLearnedWords={setLearnedWords}
                                />}
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>

                    <footer className="app-footer">
                        <p>文言文助手 &copy; {new Date().getFullYear()} - 学古文，知文化</p>
                    </footer>
                </div>
                <DevTools />
            </Router>
        </AppProvider>
    );
}

// 包装WordDetail组件以获取URL参数
function WordDetailWrapper({ getWordByChar, learnedWords, setLearnedWords }) {
    const { char } = useParams();
    const word = getWordByChar(char);
    const { getCurrentDate } = useAppContext();

    return (
        <WordDetail
            word={word}
            learnedWords={learnedWords}
            setLearnedWords={setLearnedWords}
            getCurrentDate={getCurrentDate}
        />
    );
}

export default App;
