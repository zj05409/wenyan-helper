import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
    // 获取初始值
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // 监听 key 的变化，适用于多个组件使用同一个 key
    useEffect(() => {
        function handleStorageChange(event) {
            if (event.key === key && event.newValue !== JSON.stringify(value)) {
                setValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
            }
        }

        // 监听 storage 事件（当其他窗口修改了 localStorage 时触发）
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, initialValue, value]);

    // 更新 state 和 localStorage
    const setStoredValue = (newValue) => {
        try {
            // 允许值是一个函数，如同 useState
            const valueToStore = newValue instanceof Function ? newValue(value) : newValue;

            // 保存到 state
            setValue(valueToStore);

            // 保存到 localStorage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [value, setStoredValue];
}

export { useLocalStorage }; 