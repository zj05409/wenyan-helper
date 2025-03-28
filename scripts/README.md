# 文言文字典数据爬取工具

这个工具可以从在线文言文字典网站爬取词语数据，并将其添加到 `wenyanWords.json` 文件中。

## 功能

- 从指定的文言文字典网页URL爬取词语数据
- 提取词语的基本信息（字、拼音、部首、笔画等）
- 提取词语的详细释义（音、解释、词性、用法、例句等）
- 将提取的数据以JSON格式添加到现有的数据文件中
- 自动检查词语是否已存在，避免重复添加

## 安装

1. 确保你已安装 [Node.js](https://nodejs.org/) (14.0.0 或更高版本)
2. 进入 scripts 目录:
   ```
   cd scripts
   ```
3. 安装依赖:
   ```
   npm install
   ```

## 使用方法

### 仅提取词语数据（不保存）

使用以下命令爬取单个词语并显示结果，但不添加到数据文件中:

```bash
node fetchWenyanWord.js <词语URL>
```

例如:

```bash
node fetchWenyanWord.js https://wyw.hwxnet.com/view/hwxE5hwx9BhwxA0.html
```

### 提取并追加到数据文件

如果要将提取的词语数据追加到 `wenyanWords.json` 文件中，请添加 `--append` 参数:

```bash
node fetchWenyanWord.js <词语URL> --append
```

例如:

```bash
node fetchWenyanWord.js https://wyw.hwxnet.com/view/hwxE5hwx9BhwxA0.html --append
```

或者使用 npm 脚本:

```bash
npm run fetch -- https://wyw.hwxnet.com/view/hwxE5hwx9BhwxA0.html --append
```

### 注意事项

1. 追加的词语会被添加到数组的末尾
2. 如果词语已存在，会更新它的内容而不改变位置
3. 不会对数组进行排序，保持原有顺序

## 常见文言文字典网站

以下是一些常见的文言文字典网站，你可以从中爬取数据:

- 汉文学网文言文字典: https://wyw.hwxnet.com/
- 国学大师文言文字典: https://www.guoxuedashi.com/wyw/
- 古诗文网文言文字典: https://www.gushiwen.cn/wyw.aspx

## 注意事项

1. 请合理使用此工具，避免频繁请求导致网站屏蔽你的IP
2. 爬取的数据仅供个人学习使用，请尊重原网站的知识产权
3. 不同网站的HTML结构可能不同，此脚本主要针对汉文学网进行了优化
4. 脚本使用了多种选择器方法来提高适应性，但仍可能需要根据网站变化进行调整
5. 如果提取的内容不完整，请检查脚本日志，查看HTML结构是否有变化 