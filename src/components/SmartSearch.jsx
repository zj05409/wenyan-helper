import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import pinyin from 'pinyin';
import './SmartSearch.css';

const SmartSearch = ({ words }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const getResults = useMemo(() => {
        if (!searchTerm) return [];

        // 拼音搜索
        const pinyinSearch = words.filter(word => {
            const wordPinyin = pinyin(word.字 || word.character, { style: pinyin.STYLE_NORMAL }).join('');
            return wordPinyin.includes(searchTerm.toLowerCase());
        });

        // 字符搜索
        const characterSearch = words.filter(word =>
            (word.字 || word.character).includes(searchTerm)
        );

        // 部首搜索
        const radicalSearch = words.filter(word =>
            (word.部首 || word.radicals)?.includes(searchTerm)
        );

        // 综合结果
        return [...new Set([...characterSearch, ...pinyinSearch, ...radicalSearch])];
    }, [searchTerm, words]);

    return (
        <div className="search-container">
            <input
                type="text"
                placeholder="输入汉字/拼音/部首..."
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
            />
            <div className="search-results">
                {getResults.map((word, index) => (
                    <Link
                        to={`/word/${word.字 || word.character}`}
                        key={`search-result-${index}`}
                        className="search-result-item"
                    >
                        <div className="character">{word.字 || word.character}</div>
                        <div className="pinyin">{word.拼音 || word.pronunciation}</div>
                    </Link>
                ))}
                {getResults.length === 0 && searchTerm && (
                    <div className="no-results">未找到匹配结果</div>
                )}
            </div>
        </div>
    );
};

export default SmartSearch; 