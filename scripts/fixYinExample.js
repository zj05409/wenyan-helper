const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// JSON文件路径
const dataFilePath = path.join(__dirname, '../src/data/wenyanWords.json');

// HTML文件路径
const htmlFilePath = path.join(__dirname, '因.html');

// 读取文件内容
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

// 写入文件内容
function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf8');
}

// 主函数
async function main() {
    try {
        console.log("开始修复例句...");

        // 读取HTML文件
        const htmlContent = readFile(htmlFilePath);

        // 读取JSON文件
        const jsonContent = readFile(dataFilePath);
        const data = JSON.parse(jsonContent);

        // 使用cheerio加载HTML
        const $ = cheerio.load(htmlContent);

        // 获取详细释义内容
        const detailContent = $('.view_con').html();
        if (!detailContent) {
            throw new Error("无法找到详细释义内容");
        }

        // 提取所有例句和对应解释
        const examples = [];

        // 从HTML内容中直接提取有书名号的文本
        const explanationPattern = /([①②③④⑤⑥⑦⑧⑨⑩⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇])<([^>]+)>([^<①②③④⑤⑥⑦⑧⑨⑩⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇]+)/g;
        let match;
        const exampleData = [];

        while ((match = explanationPattern.exec(detailContent)) !== null) {
            const index = match[1];
            const wordType = match[2];
            const content = match[3];

            // 提取书名号和引号内容
            const bookPattern = /《([^》]+)》：[""]([^""]+)[""]/g;
            let bookMatch;

            while ((bookMatch = bookPattern.exec(content)) !== null) {
                exampleData.push({
                    index,
                    wordType,
                    bookTitle: bookMatch[1],
                    exampleText: bookMatch[2]
                });
            }
        }

        console.log(`从HTML中提取到 ${exampleData.length} 个例句`);

        // 更新JSON数据中的例句
        if (exampleData.length > 0) {
            // 查找"因"字的数据
            const wordIndex = data.xuci.findIndex(word => word.字 === "因");

            if (wordIndex !== -1) {
                const word = data.xuci[wordIndex];

                // 更新每个解释条目的例句
                for (const explanationGroup of word.详细释义) {
                    for (let i = 0; i < explanationGroup.解释.length; i++) {
                        const explanation = explanationGroup.解释[i];
                        const index = getIndexChar(i);

                        // 查找对应的例句
                        const matchingExamples = exampleData.filter(ex => ex.index === index);

                        if (matchingExamples.length > 0) {
                            explanation.用法[0].例句 = matchingExamples.map(ex =>
                                `《${ex.bookTitle}》："${ex.exampleText}"`
                            );

                            console.log(`更新解释 ${index} 的例句: ${explanation.用法[0].例句.join(', ')}`);
                        }
                    }
                }

                // 写回JSON文件
                writeFile(dataFilePath, JSON.stringify(data, null, 4));
                console.log("成功更新例句数据");
            } else {
                console.log("未找到'因'字的数据");
            }
        }

    } catch (error) {
        console.error("处理过程中出错:", error);
    }
}

// 根据索引获取对应的序号字符
function getIndexChar(index) {
    const chars = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑾', '⑿', '⒀', '⒁', '⒂', '⒃', '⒄', '⒅', '⒆', '⒇'];
    return chars[index] || '';
}

// 手动定义完整的例句数据
const manualExamples = [
    { index: '①', bookTitle: '过秦论', exampleText: '蒙故业，因遗策，南取汉中。' },
    { index: '②', bookTitle: '子路、曾晳、冉有、公西华侍坐', exampleText: '加之以师旅，因之以饥馑。' },
    { index: '③', bookTitle: '庖丁解牛', exampleText: '批大郤，导大窾，因其固然。' },
    { index: '④', bookTitle: '察今', exampleText: '变法者因时而化。' },
    { index: '⑤', bookTitle: '孙雀东南飞', exampleText: '于今无会因。' },
    { index: '⑥', bookTitle: '谏太宗十思疏', exampleText: '恩所加，则思无因喜以谬赏。' },
    { index: '⑦', bookTitle: '廉颇蔺相如列传', exampleText: '因宾客至蔺相如门谢罪。' },
    { index: '⑧', bookTitle: '核舟记', exampleText: '罔不因势象形，各具情态。' },
    { index: '⑨', bookTitle: '鸿门宴', exampleText: '请以剑舞，因击沛公于坐。' },
    { index: '⑩', bookTitle: '鸿门宴', exampleText: '项王即日因留沛公与饮。' },
    { index: '⑾', bookTitle: '雁荡山', exampleText: '祥符中，因造玉清宫，伐山取材，方有人见之。' },
    { index: '⑾', bookTitle: '屈原列传', exampleText: '上宫大夫见而欲夺之，屈平不与，因谗之。' }
];

// 使用手动定义的例句数据更新JSON文件
async function updateWithManualExamples() {
    try {
        console.log("使用手动定义的例句数据更新...");

        // 读取JSON文件
        const jsonContent = readFile(dataFilePath);
        const data = JSON.parse(jsonContent);

        // 查找"因"字的数据
        const wordIndex = data.xuci.findIndex(word => word.字 === "因");

        if (wordIndex !== -1) {
            const word = data.xuci[wordIndex];

            // 更新每个解释条目的例句
            for (const explanationGroup of word.详细释义) {
                for (let i = 0; i < explanationGroup.解释.length; i++) {
                    const explanation = explanationGroup.解释[i];
                    const index = getIndexChar(i);

                    // 查找对应的例句
                    const matchingExamples = manualExamples.filter(ex => ex.index === index);

                    if (matchingExamples.length > 0) {
                        explanation.用法[0].例句 = matchingExamples.map(ex =>
                            `《${ex.bookTitle}》："${ex.exampleText}"`
                        );

                        console.log(`更新解释 ${index} 的例句: ${explanation.用法[0].例句.join(', ')}`);
                    }
                }
            }

            // 写回JSON文件
            writeFile(dataFilePath, JSON.stringify(data, null, 4));
            console.log("成功使用手动定义的例句数据更新");
        } else {
            console.log("未找到'因'字的数据");
        }

    } catch (error) {
        console.error("处理过程中出错:", error);
    }
}

// 执行主函数
// main().catch(console.error);

// 或者使用手动定义的例句数据更新
updateWithManualExamples().catch(console.error); 