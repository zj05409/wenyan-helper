/**
 * 文言文单词提取工具库
 * 提供一系列函数来从网页内容中提取文言文单词的各种信息
 */

const cheerio = require('cheerio');

/**
 * 清理HTML内容的辅助函数
 * @param {string} text HTML文本
 * @returns {string} 清理后的文本
 */
function cleanHtml(text) {
    return text
        .replace(/<[^>]+>/g, '') // 移除HTML标签
        .replace(/\s+/g, ' ')     // 规范化空白
        .trim();                  // 移除首尾空白
}

/**
 * 从HTML中提取解释部分
 * @param {string} html HTML内容
 * @returns {Array} 提取的解释数组
 */
function extractExplanationsFromHtml(html) {
    const $ = cheerio.load(html);
    const explanations = [];

    // 查找详细释义区域
    const detailContainer = $('.view_con.clearfix');

    if (detailContainer.length === 0) {
        console.log("未找到详细释义内容区域");
        return explanations;
    }

    console.log("找到详细释义内容区域");
    const detailHtml = detailContainer.html();

    // 定义索引符号列表
    const indexSymbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑾', '⑿', '⒀', '⒁', '⒂', '⒃', '⒄', '⒅', '⒆', '⒇'];

    // 使用正则表达式提取所有条目
    const itemRegex = new RegExp(`([${indexSymbols.join('')}])<([^>]+)>([^${indexSymbols.join('')}<]+)`, 'g');
    let itemMatch;

    // 循环提取每个条目
    while ((itemMatch = itemRegex.exec(detailHtml)) !== null) {
        const index = itemMatch[1];  // 序号，如①
        const wordType = itemMatch[2]; // 词性，如"动"
        let meaningText = cleanHtml(itemMatch[3]); // 清理原始含义和例句部分

        // 尝试分离含义和例句
        const examples = [];
        let meaning = meaningText;

        // 查找第一个书名号，它通常标志着例句的开始
        const bookTitleIndex = meaningText.indexOf('《');

        if (bookTitleIndex > 0) {
            // 第一个书名号前的内容通常是含义
            meaning = meaningText.substring(0, bookTitleIndex).trim();

            // 提取所有例句（可能有多个）
            extractExamplesFromText(meaningText.substring(bookTitleIndex), examples);
        }

        explanations.push({
            index,
            wordType,
            meaning,
            examples
        });
    }

    return explanations;
}

/**
 * 从文本中提取例句
 * @param {string} text 包含例句的文本
 * @param {Array} examples 用于存储提取的例句的数组
 */
function extractExamplesFromText(text, examples) {
    // 匹配所有书名号和引号之间的内容
    const exampleRegex = /(《[^》]+》)：[""](.*?)[""](?=[《\s]|$)/g;
    let exampleMatch;

    while ((exampleMatch = exampleRegex.exec(text)) !== null) {
        const bookTitle = exampleMatch[1]; // 包括书名号的书名
        const exampleContent = exampleMatch[2].trim(); // 例句内容
        examples.push(`${bookTitle}："${exampleContent}"`);
    }
}

/**
 * 从原始HTML中提取完整的例句
 * @param {string} html HTML内容
 * @param {string} character 要查找的字符
 * @returns {object} 按索引组织的例句映射
 */
function extractFullExamples(html, character) {
    const $ = cheerio.load(html);
    const exampleMap = {};

    // 定义索引符号
    const indexSymbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑾', '⑿', '⒀', '⒁', '⒂', '⒃', '⒄', '⒅', '⒆', '⒇'];

    // 查找详细释义区域中的所有段落
    $('.view_con.clearfix p').each(function () {
        const text = $(this).text().trim();

        // 查找索引符号
        for (const index of indexSymbols) {
            if (text.includes(index)) {
                // 找到索引后在同一段落中查找例句
                const examples = [];
                extractExamplesFromText(text, examples);

                if (examples.length > 0) {
                    // 将提取的例句存储到对应索引下
                    if (!exampleMap[index]) {
                        exampleMap[index] = [];
                    }
                    exampleMap[index].push(...examples);
                }
            }
        }
    });

    return exampleMap;
}

/**
 * 提取汉字的拼音、部首和笔画信息
 * @param {string} html HTML内容
 * @returns {object} 包含拼音、部首和笔画信息的对象
 */
function extractWordBasicInfo(html) {
    const $ = cheerio.load(html);
    const info = {
        pinyin: '',
        radical: '',
        strokes: 0,
        radicalStrokes: 0,
        strokeOrder: ''
    };

    // 提取拼音
    const pinyinElement = $('.pronounce span');
    if (pinyinElement.length) {
        info.pinyin = pinyinElement.first().text().trim();
    }

    // 提取部首和笔画信息
    $('.zy_info_left dl').each(function () {
        const dt = $(this).find('dt').text().trim();
        const dd = $(this).find('dd').text().trim();

        if (dt.includes('部首')) {
            info.radical = dd;
        } else if (dt.includes('部外笔画')) {
            info.strokes = parseInt(dd, 10) || 0;
        } else if (dt.includes('部首笔画')) {
            info.radicalStrokes = parseInt(dd, 10) || 0;
        } else if (dt.includes('笔顺')) {
            info.strokeOrder = dd;
        }
    });

    return info;
}

module.exports = {
    cleanHtml,
    extractExplanationsFromHtml,
    extractExamplesFromText,
    extractFullExamples,
    extractWordBasicInfo
}; 