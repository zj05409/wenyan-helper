import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.jsx';

// 创建上下文
const AppContext = createContext();

// 提供上下文的组件
export const AppProvider = ({ children }) => {
    const [simulatedDate, setSimulatedDate] = useLocalStorage('simulatedDate', null);

    // 获取当前日期（支持模拟）
    const getCurrentDate = () => {
        return simulatedDate ? new Date(simulatedDate) : new Date();
    };

    const value = {
        simulatedDate,
        setSimulatedDate,
        getCurrentDate
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 使用上下文的自定义 hook
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext 必须在 AppProvider 内使用');
    }
    return context;
}; 