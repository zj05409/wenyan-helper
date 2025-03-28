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

        // 预处理HTML，清理<span>标签
        // 先替换带class的span标签
        html = html.replace(/<span\s+class="[^"]*">|<\/span>/g, '');
        // 再替换其他所有span标签
        html = html.replace(/<span[^>]*>|<\/span>/g, '');

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

        $('.zy_info_left dl').each(function () {
            const dt = $(this).find('dt').text().trim();
            const dd = $(this).find('dd').text().trim();

            if (dt.includes('部首')) {
                radical = dd;
                console.log(`部首: ${radical}`);
            } else if (dt.includes('部外笔画')) {
                strokes = parseInt(dd, 10) || 0;
            } else if (dt.includes('部首笔画')) {
                radicalStrokes = parseInt(dd, 10) || 0;
            } else if (dt.includes('笔顺')) {
                strokeOrder = dd;
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

            // 分离含义和例句
            let meaning = content;
            const examples = [];

            // 查找第一个书名号位置
            const bookTitleIndex = content.indexOf('《');
            if (bookTitleIndex > 0) {
                // 含义是书名号前的内容
                meaning = content.substring(0, bookTitleIndex).trim();

                // 提取所有例句
                let remainingText = content.substring(bookTitleIndex);

                // 匹配带引号的例句
                const exampleRegex = /(《[^》]+》)[：:，,]?[""]([^""]+)[""]/g;
                let exampleMatch;

                while ((exampleMatch = exampleRegex.exec(remainingText)) !== null) {
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
                    const simpleRegex = /(《[^》]+》)([^《]+)/g;
                    while ((exampleMatch = simpleRegex.exec(remainingText)) !== null) {
                        const bookTitle = exampleMatch[1];
                        let exampleText = exampleMatch[2].trim();

                        // 清理标点
                        exampleText = exampleText.replace(/^[：:，,""]/g, '').trim();

                        // 如果有引号，提取引号内容
                        const quoteMatch = exampleText.match(/[""]([^""]+)[""]/);
                        if (quoteMatch) {
                            exampleText = quoteMatch[1];
                        } else if (exampleText) {
                            // 如果没有引号，截取到句号
                            const dotIndex = exampleText.indexOf('。');
                            if (dotIndex >= 0) {
                                exampleText = exampleText.substring(0, dotIndex + 1);
                            }
                        }

                        if (exampleText) {
                            examples.push(`${bookTitle}："${exampleText}"`);
                            if (config.debug) {
                                console.log(`找到简单例句: ${bookTitle}="${exampleText}"`);
                            }
                        }
                    }
                }
            }

            explanations.push({
                index,
                wordType,
                meaning,
                examples
            });
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

                        return {
                            词性: expl.wordType,
                            含义: expl.meaning,
                            用法: [
                                {
                                    说明: `表示${category}的基本含义`,
                                    例句: expl.examples
                                }
                            ]
                        };
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