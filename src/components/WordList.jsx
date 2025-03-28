import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './WordList.css';

const WordList = ({ words, userProgress }) => {
    const [filter, setFilter] = useState('all'); // 'all', 'learned', 'unlearned'
    const [currentPage, setCurrentPage] = useState(1);
    const wordsPerPage = 20;

    // 根据筛选条件过滤词汇
    const filteredWords = words.filter(word => {
        if (filter === 'all') return true;
        const learned = !!userProgress[word.字];
        return filter === 'learned' ? learned : !learned;
    });

    // 分页
    const indexOfLastWord = currentPage * wordsPerPage;
    const indexOfFirstWord = indexOfLastWord - wordsPerPage;
    const currentWords = filteredWords.slice(indexOfFirstWord, indexOfLastWord);
    const totalPages = Math.ceil(filteredWords.length / wordsPerPage);

    // 页面切换
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
    };

    return (
        <div className="word-list-container">
            <div className="filter-controls">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    全部词汇
                </button>
                <button
                    className={filter === 'learned' ? 'active' : ''}
                    onClick={() => setFilter('learned')}
                >
                    已学习
                </button>
                <button
                    className={filter === 'unlearned' ? 'active' : ''}
                    onClick={() => setFilter('unlearned')}
                >
                    未学习
                </button>
            </div>

            <div className="word-grid">
                {currentWords.map(word => (
                    <Link
                        to={`/word/${word.字}`}
                        key={word.字}
                        className={`word-card ${userProgress[word.字] ? 'learned' : ''}`}
                    >
                        <div className="word-character">{word.字}</div>
                        <div className="word-pinyin">{word.拼音}</div>
                        <div className="word-brief">
                            {word.详细释义[0].解释[0].含义}
                        </div>
                        {userProgress[word.字] && (
                            <div className="word-progress-badge">
                                <span>已学习</span>
                            </div>
                        )}
                    </Link>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        上一页
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        下一页
                    </button>
                </div>
            )}
        </div>
    );
};

export default WordList; 