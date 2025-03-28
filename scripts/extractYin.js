const fs = require('fs');
const path = require('path');

// HTML文件路径
const htmlFilePath = path.join(__dirname, '因.html');
// JSON数据文件路径
const dataFilePath = path.join(__dirname, '../src/data/wenyanWords.json');

// 读取HTML文件
const html = fs.readFileSync(htmlFilePath, 'utf8');

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

// 提取详细释义部分
const explanationMatch = html.match(/<div class="view_con clearfix">([\s\S]*?)<\/div>/);

if (explanationMatch) {
    const explanationContent = explanationMatch[1];
    console.log("找到详细释义内容");

    // 使用正则表达式提取所有条目
    const itemRegex = /([①②③④⑤⑥⑦⑧⑨⑩⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇])<([^>]+)>([^①②③④⑤⑥⑦⑧⑨⑩⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇<]+)/g;
    let itemMatch;
    const explanations = [];

    // 循环提取每个条目
    while ((itemMatch = itemRegex.exec(explanationContent)) !== null) {
        const index = itemMatch[1];  // 序号，如①
        const wordType = itemMatch[2]; // 词性，如"动"
        let meaningText = itemMatch[3].trim(); // 原始含义和例句部分

        // 清理HTML标签
        meaningText = meaningText.replace(/<[^>]+>/g, '');

        // 尝试分离含义和书名号
        const bookIndex = meaningText.indexOf('《');
        let meaning = meaningText;

        if (bookIndex > 0) {
            // 提取含义部分（书名号前的内容）
            meaning = meaningText.substring(0, bookIndex).trim();
        }

        // 查找匹配的手动例句
        const matchingExamples = manualExamples.filter(ex => ex.index === index);
        const formattedExamples = matchingExamples.map(ex =>
            `《${ex.bookTitle}》："${ex.exampleText}"`
        );

        console.log(`\n[${index}]<${wordType}> ${meaning}`);
        if (formattedExamples.length > 0) {
            console.log(`例句: ${formattedExamples.join('\n       ')}`);
        }

        explanations.push({
            index,
            wordType,
            meaning,
            examples: formattedExamples
        });
    }

    console.log("\n提取的所有解释:");
    console.log(JSON.stringify(explanations, null, 2));

    // 将提取的数据更新到JSON文件
    try {
        // 读取现有JSON文件
        const jsonData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

        // 查找"因"字的数据
        const wordIndex = jsonData.xuci.findIndex(word => word.字 === "因");

        if (wordIndex !== -1) {
            console.log("找到'因'字数据，开始更新例句...");

            // 获取"因"字数据
            const yinWord = jsonData.xuci[wordIndex];

            // 如果详细释义为空，先创建基本结构
            if (!yinWord.详细释义 || yinWord.详细释义.length === 0) {
                yinWord.详细释义 = [{
                    音: "yīn",
                    解释: []
                }];
            }

            // 获取第一个详细释义组
            const explanationGroup = yinWord.详细释义[0];

            // 如果解释数组为空，初始化它
            if (!explanationGroup.解释 || !Array.isArray(explanationGroup.解释)) {
                explanationGroup.解释 = [];
            }

            // 确保解释数组有足够的元素
            while (explanationGroup.解释.length < 11) {
                explanationGroup.解释.push({
                    词性: "未知",
                    含义: "待补充",
                    用法: [{
                        说明: "表示基本含义",
                        例句: []
                    }]
                });
            }

            // 更新每个解释条目
            for (const expl of explanations) {
                const indexMap = {
                    '①': 0, '②': 1, '③': 2, '④': 3, '⑤': 4,
                    '⑥': 5, '⑦': 6, '⑧': 7, '⑨': 8, '⑩': 9, '⑾': 10
                };

                const explIndex = indexMap[expl.index];

                if (explIndex !== undefined) {
                    // 更新词性和含义
                    explanationGroup.解释[explIndex].词性 = expl.wordType;
                    explanationGroup.解释[explIndex].含义 = expl.meaning;

                    // 确保用法数组存在
                    if (!explanationGroup.解释[explIndex].用法 || !Array.isArray(explanationGroup.解释[explIndex].用法)) {
                        explanationGroup.解释[explIndex].用法 = [{
                            说明: "表示基本含义",
                            例句: []
                        }];
                    }

                    // 更新例句
                    explanationGroup.解释[explIndex].用法[0].例句 = expl.examples;
                    console.log(`更新索引 ${expl.index} 的例句: ${expl.examples.join(', ')}`);
                }
            }

            // 写回JSON文件
            fs.writeFileSync(dataFilePath, JSON.stringify(jsonData, null, 4), 'utf8');
            console.log("成功更新JSON数据");
        } else {
            console.log("未找到'因'字的数据");
        }
    } catch (error) {
        console.error("更新JSON数据时出错:", error);
    }
} else {
    console.log("未找到详细释义内容");
} 