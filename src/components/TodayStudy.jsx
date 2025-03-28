import React from 'react';
import { Link } from 'react-router-dom';
import { getTodayWords } from '../utils/ebbinghaus.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import './TodayStudy.css';

const TodayStudy = ({ words, learnedWords }) => {
    const { getCurrentDate } = useAppContext();
    const currentDate = getCurrentDate();

    // 获取今日学习计划
    const todayPlan = getTodayWords(learnedWords, words, currentDate);

    // 格式化日期显示
    const formatDate = (date) => {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    return (
        <div className="today-study-container">
            <div className="today-date">
                <h2>今日学习计划</h2>
                <div className="date-display">{formatDate(currentDate)}</div>
            </div>

            <div className="study-sections">
                {/* 今天需要复习的词 */}
                <div className="study-section">
                    <h3>
                        <span className="section-title">今日复习</span>
                        <span className="word-count">{todayPlan.reviewWords.length} 个字</span>
                    </h3>

                    {todayPlan.reviewWords.length > 0 ? (
                        <div className="word-grid">
                            {todayPlan.reviewWords.map(word => (
                                <Link
                                    to={`/word/${word.字}`}
                                    key={`review-${word.字}`}
                                    className="word-card review"
                                >
                                    <div className="word-character">{word.字}</div>
                                    <div className="word-pinyin">{word.拼音}</div>
                                    <div className="stage-info">
                                        第 {word.progress.stages.length + 1} 阶段复习
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-message">今天没有需要复习的字</div>
                    )}
                </div>

                {/* 新学习的词 */}
                <div className="study-section">
                    <h3>
                        <span className="section-title">建议学习</span>
                        <span className="word-count">{todayPlan.newWords.length} 个字</span>
                    </h3>

                    {todayPlan.newWords.length > 0 ? (
                        <div className="word-grid">
                            {todayPlan.newWords.map(word => (
                                <Link
                                    to={`/word/${word.字}`}
                                    key={`new-${word.字}`}
                                    className="word-card new"
                                >
                                    <div className="word-character">{word.字}</div>
                                    <div className="word-pinyin">{word.拼音}</div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-message">恭喜！您已学习所有字</div>
                    )}
                </div>

                {/* 即将复习的词 */}
                {todayPlan.upcomingWords.length > 0 && (
                    <div className="study-section">
                        <h3>
                            <span className="section-title">即将复习</span>
                            <span className="word-count">{todayPlan.upcomingWords.length} 个字</span>
                        </h3>

                        <div className="word-grid upcoming">
                            {todayPlan.upcomingWords.map(word => (
                                <div
                                    key={`upcoming-${word.字}`}
                                    className="word-card upcoming"
                                >
                                    <div className="word-character">{word.字}</div>
                                    <div className="word-pinyin">{word.拼音}</div>
                                    <div className="days-info">
                                        {word.daysUntilReview} 天后复习
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 已掌握的词 */}
                {todayPlan.masteredWords.length > 0 && (
                    <div className="study-section">
                        <h3>
                            <span className="section-title">已掌握</span>
                            <span className="word-count">{todayPlan.masteredWords.length} 个字</span>
                        </h3>

                        <div className="mastered-summary">
                            您已经掌握了 {todayPlan.masteredWords.length} 个字，占总词汇量的
                            {Math.round((todayPlan.masteredWords.length / words.length) * 100)}%
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodayStudy; 