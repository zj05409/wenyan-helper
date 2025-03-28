import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext.jsx';
import './DevTools.css';

const DevTools = () => {
    const { getCurrentDate, setCurrentDate } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [dateInput, setDateInput] = useState(getCurrentDate().toISOString().split('T')[0]);

    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value);
        setCurrentDate(newDate);
        setDateInput(e.target.value);
    };

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
                            value={dateInput}
                            onChange={handleDateChange}
                            className="date-input"
                        />
                        <div className="current-date">
                            当前日期：{getCurrentDate().toLocaleDateString()}
                        </div>
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
};

export default DevTools; 