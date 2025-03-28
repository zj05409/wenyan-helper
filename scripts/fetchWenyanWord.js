#!/usr/bin/env node

/**
 * 文言文词汇抓取工具
 * 用法：node fetchWenyanWord.js <源文件或URL> [--append] [--debug]
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// 配置项
const config = {
    outputPath: path.join(__dirname, '../src/data/wenyanWords.json'),
    debug: false
};

// 解析命令行参数
const args = process.argv.slice(2);
let sourceFile = '';
let shouldAppend = false;

// 处理命令行参数
args.forEach(arg => {
    if (arg === '--append') {
        shouldAppend = true;
    } else if (arg === '--debug') {
        config.debug = true;
    } else if (!sourceFile) {
        sourceFile = arg;
    }
});

// 检查是否提供了源文件
if (!sourceFile) {
    console.error('请提供源文件路径或URL。用法：node fetchWenyanWord.js <源文件或URL> [--append] [--debug]');
    process.exit(1);
}

// 主函数
async function main() {
    try {
        let html = '';

        // 判断是从文件读取还是从URL获取
        if (sourceFile.startsWith('http')) {
            // 从URL获取内容
            const response = await axios.get(sourceFile);
            html = response.data;
        } else {
            // 从文件读取内容
            html = fs.readFileSync(sourceFile, 'utf8');
        }

        if (config.debug) {
            console.log(`成功读取内容，长度：${html.length}`);
        }

        // 使用cheerio加载HTML
        const $ = cheerio.load(html);

        // 尝试从不同位置提取汉字
        let character = '';

        // 方法1：从标题提取
        const titleText = $('title').text();
        const titleMatch = titleText.match(/^(.)的文言文/);
        if (titleMatch && titleMatch[1]) {
            character = titleMatch[1];
            if (config.debug) console.log(`从标题提取汉字: ${character}`);
        }

        // 方法2：从图片alt属性提取
        if (!character) {
            const imgAlt = $('img[alt]').attr('alt');
            if (imgAlt && imgAlt.length === 1) {
                character = imgAlt;
                if (config.debug) console.log(`从图片alt属性提取汉字: ${character}`);
            }
        }

        // 方法3：从其他元素提取
        if (!character) {
            // 这里可以添加更多提取方法
            console.error('无法提取汉字');
            process.exit(1);
        }

        console.log(`提取的汉字: ${character}`);

        // 提取拼音
        let pinyin = '';
        const pinyinElement = $('.pronounce span, .pinyin').first();
        if (pinyinElement.length) {
            pinyin = pinyinElement.text().trim();
            console.log(`拼音: ${pinyin}`);
        }

        // 提取部首和笔画信息
        let radical = '';
        let strokes = 0;
        let radicalStrokes = 0;
        let strokeOrder = '';

        // 从label类中提取部首和笔画信息
        const labelElements = $('.label');
        labelElements.each(function () {
            const text = $(this).text();
            if (text.includes('部首：')) {
                radical = $(this).find('.spwid80').first().text().trim();
                console.log(`部首: ${radical}`);

                // 部首笔画和总笔画在同一个label中
                radicalStrokes = parseInt($(this).find('.spwid80').eq(1).text().trim(), 10) || 0;
                strokes = parseInt($(this).find('.spwid80').eq(2).text().trim(), 10) || 0;
            } else if (text.includes('笔顺：')) {
                strokeOrder = $(this).find('span').last().text().trim();
            }
        });

        console.log(`部首笔画: ${radicalStrokes}, 总笔画: ${strokes}`);
        console.log(`笔顺: ${strokeOrder}`);

        // 提取详细释义内容
        let viewContent = '';
        $('.view_con').each(function () {
            viewContent += $(this).html();
        });

        // 将HTML转换为纯文本，但保留结构
        let textContent = viewContent
            .replace(/<br\s*\/?>/gi, '\n')  // 将<br>替换为换行符
            .replace(/<[^>]*>/g, '');       // 移除所有其他HTML标签

        // 解码HTML实体
        textContent = textContent
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, '&');

        // 格式标准化：将"数字+中文句号"替换为"数字+英文点号"
        textContent = textContent
            .replace(/(\d+)。/g, '$1.')
            // 标准化空格，确保数字后的点号后有一个空格
            .replace(/(\d+\.)(?!\s)/g, '$1 ');

        if (config.debug) {
            console.log("原始HTML:", viewContent);
            console.log("清理后的内容:", textContent);
        }

        // 解析释义和例句
        const explanations = [];
        const definitionBlocks = textContent.split(/(?=[①②③④⑤⑥⑦⑧⑨⑩⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇])/);

        if (config.debug) {
            console.log("定义块数量:", definitionBlocks.length);
            definitionBlocks.forEach((block, i) => {
                console.log(`块 ${i}:`, block);
            });
        }

        for (const block of definitionBlocks) {
            if (!block.trim()) continue;

            // 提取序号、词性和内容
            const blockMatch = block.match(/^([①②③④⑤⑥⑦⑧⑨⑩⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇])<([^>]+)>(.+)$/s);
            if (!blockMatch) continue;

            const [, index, wordType, content] = blockMatch;

            if (config.debug) {
                console.log(`解析块: 序号=${index}, 词性=${wordType}, 内容=${content}`);
            }

            // 先提取主要含义（位于第一个亚级标题或书名号前）
            let mainMeaning = '';
            let remainingContent = content;

            // 检查是否有亚级标题（⒈⒉⒊⒋）或阿拉伯数字加点号（1.2.3.）
            const subTitleMatch = remainingContent.match(/[⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑]|(\d+\.\s)/);

            if (subTitleMatch) {
                // 主含义是第一个亚级标题前的内容
                const firstSubTitlePos = remainingContent.indexOf(subTitleMatch[0]);
                if (firstSubTitlePos > 0) {
                    mainMeaning = remainingContent.substring(0, firstSubTitlePos).trim();
                    remainingContent = remainingContent.substring(firstSubTitlePos);
                }
            } else {
                // 查找第一个书名号位置
                const bookTitleIndex = remainingContent.indexOf('《');
                if (bookTitleIndex > 0) {
                    mainMeaning = remainingContent.substring(0, bookTitleIndex).trim();
                    remainingContent = remainingContent.substring(bookTitleIndex);
                } else {
                    // 如果没有书名号，整个内容就是主含义
                    mainMeaning = remainingContent.trim();
                    remainingContent = '';
                }
            }

            if (config.debug) {
                console.log(`主含义: ${mainMeaning}`);
                console.log(`剩余内容: ${remainingContent}`);
            }

            // 检查是否有亚级标题(⒈⒉⒊⒋)或阿拉伯数字加点号（1.2.3.）
            const hasSubTitles = remainingContent.match(/[⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑]|(\d+\.\s)/);

            if (hasSubTitles) {
                // 将内容按亚级标题分割
                const subMeanings = [];
                const examples = [];

                // 正则表达式匹配亚级标题及其后面的内容
                // 注意：这里需要处理两种情况：圆圈数字和阿拉伯数字加点号
                const subTitleRegex = /([⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑]|(\d+\.\s))([^⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑]|(?!\d+\.\s).)*?(?=[⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑]|(\d+\.\s)|$)/g;
                let match;

                while ((match = subTitleRegex.exec(remainingContent)) !== null) {
                    // 提取标题和内容
                    const fullMatch = match[0];
                    const subTitle = match[1];
                    // 内容需要排除标题部分
                    const subContent = fullMatch.substring(subTitle.length).trim();

                    if (config.debug) {
                        console.log(`亚级标题: ${subTitle}, 内容: ${subContent}`);
                    }

                    // 分割子含义和例句
                    let subMeaning = '';
                    let subExamples = [];

                    // 查找第一个书名号位置
                    const bookTitleIndex = subContent.indexOf('《');
                    if (bookTitleIndex > 0) {
                        // 子含义是书名号前的内容
                        subMeaning = subContent.substring(0, bookTitleIndex).trim();

                        // 提取例句
                        const exampleText = subContent.substring(bookTitleIndex);
                        subExamples = extractExamples(exampleText);

                        // 将子项目例句添加到总例句列表
                        examples.push(...subExamples);
                    } else {
                        subMeaning = subContent;
                    }

                    // 映射亚级标题为数字
                    const subTitleMap = {
                        '⒈': '1', '⒉': '2', '⒊': '3', '⒋': '4', '⒌': '5',
                        '⒍': '6', '⒎': '7', '⒏': '8', '⒐': '9', '⒑': '10'
                    };

                    let subIndex = subTitle;
                    if (config.debug) {
                        console.log(`处理亚级标题: ${subTitle}`);
                    }

                    // 如果是圆圈数字，则映射为阿拉伯数字
                    if (subTitleMap[subTitle]) {
                        subIndex = subTitleMap[subTitle];
                        if (config.debug) {
                            console.log(`映射圆圈数字: ${subTitle} -> ${subIndex}`);
                        }
                    }
                    // 如果是数字加点号，则去掉点号
                    else if (subTitle.match(/\d+\.\s/)) {
                        subIndex = subTitle.replace(/\.\s/, '');
                        if (config.debug) {
                            console.log(`处理数字加点号: ${subTitle} -> ${subIndex}`);
                        }
                    }

                    if (config.debug) {
                        console.log(`最终子引用索引: ${subIndex}`);
                    }

                    subMeanings.push({
                        subIndex,
                        meaning: subMeaning,
                        examples: subExamples
                    });
                }

                explanations.push({
                    index,
                    wordType,
                    meaning: mainMeaning,
                    examples,
                    subMeanings
                });
            } else {
                // 处理没有亚级标题的情况
                const examples = [];

                // 如果有剩余内容，就是例句部分
                if (remainingContent) {
                    const extractedExamples = extractExamples(remainingContent);
                    examples.push(...extractedExamples);
                }

                explanations.push({
                    index,
                    wordType,
                    meaning: mainMeaning,
                    examples
                });
            }
        }

        // 提取例句的辅助函数
        function extractExamples(text) {
            const examples = [];

            if (!text) return examples;

            // 匹配带引号的例句
            const exampleRegex = /(《[^》]+》)[：:，,]?[""]([^""]+)[""]/g;
            let exampleMatch;

            while ((exampleMatch = exampleRegex.exec(text)) !== null) {
                const bookTitle = exampleMatch[1];
                const exampleText = exampleMatch[2];
                examples.push(`${bookTitle}："${exampleText}"`);

                if (config.debug) {
                    console.log(`找到例句: ${bookTitle}="${exampleText}"`);
                }
            }

            // 如果没有找到例句，尝试不同格式
            if (examples.length === 0) {
                // 尝试提取没有引号的例句
                const simpleRegex = /(《[^》]+》)([^《]+)/g
                while ((exampleMatch = simpleRegex.exec(text)) !== null) {
                    const bookTitle = exampleMatch[1];
                    let exampleText = exampleMatch[2].trim();

                    // 清理标点
                    exampleText = exampleText.replace(/^[：:，,""]/g, '').trim();

                    // 如果有引号，提取引号内容
                    const quoteMatch = exampleText.match(/[""]([^""]+)[""]/);
                    if (quoteMatch) {
                        exampleText = quoteMatch[1];
                    }

                    if (exampleText) {
                        if (exampleText === '。”') {
                            examples[examples.length - 1] += '《离骚》。”' // 特殊处理
                        } else {
                            examples.push(`${bookTitle}：${exampleText}`);
                        }
                        if (config.debug) {
                            console.log(`找到简单例句: ${bookTitle}="${examples[examples.length - 1]}"`);
                        }
                    }
                }
            }

            return examples;
        }

        // 构建最终数据结构
        const wordData = {
            字: character,
            拼音: pinyin,
            部首: radical,
            部首笔画: radicalStrokes,
            总笔画: strokes,
            笔顺: strokeOrder,
            详细释义: [
                {
                    音: pinyin,
                    解释: explanations.map(expl => {
                        // 确定词类
                        const typeMap = {
                            '动': '动词',
                            '名': '名词',
                            '形': '形容词',
                            '副': '副词',
                            '介': '介词',
                            '连': '连词',
                            '助': '助词',
                            '代': '代词'
                        };

                        const category = typeMap[expl.wordType] || '其他';

                        // 检查是否有子义项
                        if (expl.subMeanings && expl.subMeanings.length > 0) {
                            return {
                                词性: expl.wordType,
                                含义: expl.meaning,
                                用法: expl.subMeanings.map(sub => ({
                                    序号: sub.subIndex,
                                    说明: sub.meaning,
                                    例句: sub.examples
                                }))
                            };
                        } else {
                            return {
                                词性: expl.wordType,
                                含义: expl.meaning,
                                用法: [
                                    {
                                        // 说明: `表示${category}的基本含义`,
                                        例句: expl.examples
                                    }
                                ]
                            };
                        }
                    })
                }
            ]
        };

        // 将提取的数据更新到JSON文件
        if (shouldAppend) {
            try {
                // 读取现有JSON文件
                let existingData = {};
                try {
                    const fileContent = fs.readFileSync(config.outputPath, 'utf8');
                    existingData = JSON.parse(fileContent);
                } catch (error) {
                    console.warn(`无法读取现有JSON文件: ${error.message}，将创建新文件`);
                    existingData = { xuci: [] };
                }

                // 查找是否已存在该字
                const wordIndex = existingData.xuci.findIndex(word => word.字 === character);

                if (wordIndex !== -1) {
                    console.log(`找到'${character}'字数据，开始更新...`);

                    // 更新现有数据
                    existingData.xuci[wordIndex] = wordData;
                    console.log(`更新了"${character}"字的数据`);
                } else {
                    // 添加新数据
                    existingData.xuci.push(wordData);
                    console.log(`添加了"${character}"字的数据`);
                }

                // 写回JSON文件
                fs.writeFileSync(config.outputPath, JSON.stringify(existingData, null, 4), 'utf8');
                console.log(`数据已追加到: ${config.outputPath}`);
            } catch (error) {
                console.error("更新JSON数据时出错:", error);
                process.exit(1);
            }
        } else {
            // 输出到标准输出
            console.log(JSON.stringify(wordData, null, 4));
        }

        console.log("处理完成");

    } catch (error) {
        console.error('处理过程中出错:', error);
        process.exit(1);
    }
}

// 执行主函数
main(); 