// 艾宾浩斯记忆曲线间隔天数（可扩展其他算法）
const algorithms = {
    ebbinghaus: [1, 2, 4, 7, 15, 31], // 默认算法
    simple: [1, 3, 7], // 示例备用算法
};

export const getReviewSchedule = (algorithmName = 'ebbinghaus') => {
    return algorithms[algorithmName] || algorithms.ebbinghaus;
};

// 获取下次复习日期
export const getNextReviewDate = (learnDate, stage, currentDate = new Date()) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + getReviewSchedule()[stage]);
    return date;
};

// 判断两个日期是否是同一天
export const isSameDay = (date1, date2) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

// 获取当天需要学习的单词
export const getTodayWords = (learnedWords, words, currentDate = new Date()) => {
    const today = new Date(currentDate);

    // 分类：新单词、今日复习
    const result = {
        newWords: [], // 推荐学习的新单词
        reviewWords: [], // 今天需要复习的单词
        masteredWords: [], // 已掌握的单词（完成所有阶段）
        upcomingWords: [] // 最近学过但今天不需要复习的单词
    };

    // 已学习的单词ID集合
    const learnedWordsIds = learnedWords.map(item => item.wordId);

    // 首先处理已学过的单词，检查哪些需要今天复习
    learnedWords.forEach(wordProgress => {
        const wordInfo = words.find(w => w.字 === wordProgress.wordId);

        if (!wordInfo) return; // 跳过未找到的单词

        const wordWithProgress = {
            ...wordInfo,
            progress: wordProgress
        };

        // 判断是否已完成所有阶段学习
        const allStagesCompleted = wordProgress.stages.length >= getReviewSchedule().length;

        if (allStagesCompleted) {
            // 已掌握的单词
            result.masteredWords.push(wordWithProgress);
            return;
        }

        // 检查是否有待复习的日期
        const nextReviewDate = new Date(wordProgress.nextReview);

        if (isSameDay(nextReviewDate, today)) {
            // 今天需要复习
            result.reviewWords.push(wordWithProgress);
        } else if (nextReviewDate > today) {
            // 近期复习过，后续还要复习
            result.upcomingWords.push({
                ...wordWithProgress,
                daysUntilReview: Math.ceil((nextReviewDate - today) / (1000 * 60 * 60 * 24))
            });
        }
    });

    // 处理新单词（未学过的）
    words.forEach(word => {
        if (!learnedWordsIds.includes(word.字)) {
            // 每天建议学习新单词的限制（可调整）
            if (result.newWords.length < 100) {
                result.newWords.push(word);
            }
        }
    });

    return result;
}; 