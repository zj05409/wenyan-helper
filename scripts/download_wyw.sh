#!/bin/bash
# 脚本名称：download_wyw_dict.sh
# 功能：批量下载文言文字典页面
# 日期：2025-03-28
# 作者：GPT-4 (基于用户需求与资料实现)

# ================== 配置区域 ==================
WORD_LIST_FILE="chinese_chars.txt"  # 字表文件路径
OUTPUT_DIR="wyw_pages"              # 输出目录
BASE_URL="https://wyw.hwxnet.com/view.do?keyword="  # 目标网站URL
USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
DELAY_SECONDS=2                     # 请求间隔(防封禁)
# ==============================================

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 读取字表并去重（使用临时文件存储唯一字符）
TEMP_FILE=$(mktemp)
iconv -f UTF-8 -t UTF-8 "$WORD_LIST_FILE" | sort | uniq > "$TEMP_FILE"

# 计算总字符数
total_chars=$(wc -l < "$TEMP_FILE")
current=0

# 批量下载
while IFS= read -r char; do
    ((current++))
    filename="${OUTPUT_DIR}/${char}.html"
    
    # 进度显示
    echo -n "[$(date '+%H:%M:%S')] 正在下载 $char "
    printf "(%03d/%03d)" $current $total_chars
    
    # 执行下载（包含错误重试机制）
    if ! curl -sSL \
        -A "$USER_AGENT" \
        -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7" \
        -H "Accept-Language: zh-CN,zh;q=0.9,en;q=0.8" \
        -H "Cache-Control: no-cache" \
        -H "Connection: keep-alive" \
        -H "Pragma: no-cache" \
        -H "Sec-Ch-Ua: \"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"" \
        -H "Sec-Ch-Ua-Mobile: ?0" \
        -H "Sec-Ch-Ua-Platform: \"macOS\"" \
        -H "Sec-Fetch-Dest: document" \
        -H "Sec-Fetch-Mode: navigate" \
        -H "Sec-Fetch-Site: none" \
        -H "Sec-Fetch-User: ?1" \
        -H "Upgrade-Insecure-Requests: 1" \
        -o "$filename" \
        --retry 2 \
        --retry-delay 5 \
        "${BASE_URL}${char}" >/dev/null 2>&1; then
        echo -e "\t[失败]"
        rm -f "$filename" 2>/dev/null
    else
        echo -e "\t[成功]"
        sleep $DELAY_SECONDS  # 请求间隔
    fi
done < "$TEMP_FILE"

# 清理临时文件
rm -f "$TEMP_FILE"

echo "下载完成！文件保存在: $(pwd)/$OUTPUT_DIR"
