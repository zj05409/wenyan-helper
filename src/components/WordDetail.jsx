import React, { useState, useEffect } from 'react';
import './WordDetail.css';
import { useLocalStorage } from '../hooks/useLocalStorage.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { getNextReviewDate } from '../utils/ebbinghaus.jsx';

const WordDetail = ({ word, onSaveProgress }) => {
    const [expandedSections, setExpandedSections] = useState({});
    const [learnedWords, setLearnedWords] = useLocalStorage('learnedWords', []);
    const { getCurrentDate } = useAppContext();
    const currentDate = getCurrentDate();

    // 默认展开所有区块
    useEffect(() => {
        if (word && word.详细释义) {
            const allSections = {};

            word.详细释义.forEach((item, index) => {
                item.解释.forEach((explanation, expIndex) => {
                    const sectionId = `${index}-${expIndex}`;
                    allSections[sectionId] = true;
                });
            });

            setExpandedSections(allSections);
        }
    }, [word]);

    // 切换词性详情的展开/折叠状态
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleLearnWord = () => {
        // 调用传入的保存进度函数
        if (onSaveProgress) {
            onSaveProgress(word.字);
        }

        // 更新本地学习状态
        const newProgress = {
            wordId: word.字,
            stages: [currentDate.toISOString()], // 记录每次复习时间
            nextReview: getNextReviewDate(currentDate, 0, currentDate)
        };

        setLearnedWords(prev => [...prev.filter(w => w.wordId !== word.字), newProgress]);
    };

    // 显示复习状态
    const renderProgress = () => {
        const progress = learnedWords.find(w => w.wordId === word.字);
        if (!progress) return null;

        return (
            <div className="progress-info">
                <p>下次复习时间：{new Date(progress.nextReview).toLocaleDateString()}</p>
                <p>已复习次数：{progress.stages.length}</p>
            </div>
        );
    };

    // 如果没有单词数据，显示加载状态
    if (!word) {
        return <div className="word-detail-loading">加载中...</div>;
    }

    return (
        <div className="word-detail-container">
            <div className="word-header">
                <div className="word-character">{word.字}</div>
                <div className="word-metadata">
                    <div className="word-pinyin">{word.拼音}</div>
                    <div className="word-strokes">
                        <span>部首: {word.部首}</span>
                        <span>部首笔画: {word.部首笔画}</span>
                        <span>总笔画: {word.总笔画}</span>
                    </div>
                    <div className="word-stroke-order">笔顺: {word.笔顺}</div>
                </div>
            </div>

            <div className="word-content">
                <h3 className="section-title">详细释义</h3>

                {word.详细释义.map((item, index) => (
                    <div key={`definition-${index}`} className="definition-section">
                        <div className="definition-header">
                            <span className="pronunciation">{item.音}</span>
                        </div>

                        {item.解释.map((explanation, expIndex) => (
                            <div
                                key={`explanation-${index}-${expIndex}`}
                                className="explanation-container"
                            >
                                <div
                                    className="explanation-header"
                                    onClick={() => toggleSection(`${index}-${expIndex}`)}
                                >
                                    <span className="word-type">{explanation.词性}</span>
                                    <span className="meaning">{explanation.含义}</span>
                                    <span className={`expand-icon ${expandedSections[`${index}-${expIndex}`] ? 'expanded' : ''}`}>
                                        {expandedSections[`${index}-${expIndex}`] ? '▼' : '►'}
                                    </span>
                                </div>

                                {expandedSections[`${index}-${expIndex}`] && explanation.用法 && (
                                    <div className="usage-section">
                                        {explanation.用法.map((usage, usageIndex) => (
                                            <div key={`usage-${index}-${expIndex}-${usageIndex}`} className="usage-item">
                                                {usage.说明 && <div className="usage-description">{usageIndex + 1}.{usage.说明}</div>}

                                                {usage.例句 && usage.例句.length > 0 && (
                                                    <div className="examples-container">
                                                        <h4>例句:</h4>
                                                        <ul className="examples-list">
                                                            {usage.例句.map((example, exampleIndex) => (
                                                                <li key={`example-${index}-${expIndex}-${usageIndex}-${exampleIndex}`} className="example-item">
                                                                    {example}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 直接显示例句 (如果没有用法但有例句) */}
                                {expandedSections[`${index}-${expIndex}`] && !explanation.用法 && explanation.例句 && (
                                    <div className="examples-container">
                                        <h4>例句:</h4>
                                        <ul className="examples-list">
                                            {explanation.例句.map((example, exampleIndex) => (
                                                <li key={`example-direct-${index}-${expIndex}-${exampleIndex}`} className="example-item">
                                                    {example}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="learning-controls">
                <button className="mark-reviewed-btn" onClick={handleLearnWord}>
                    标记为已学习
                </button>
            </div>

            {renderProgress()}
        </div>
    );
};

export default WordDetail; 