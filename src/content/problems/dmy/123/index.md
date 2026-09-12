---
oj: dmy
pid: '123'
title: '[R21B]字符字数'
difficulty: 普及+
tags:
  - 模拟
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le |s| \le 10^5$，$s$ 仅包含小写字母。

## 思路

题意即统计字符串 $s$ 中字符 `d`、`m`、`y` 的出现次数。由于 $s$ 全由小写字母组成，每个字符的 UTF-8 编码即为单个字节且 ASCII 值固定，因此直接逐字节扫描整个字符串，维护三个计数器，遇到对应字节就累加，最后输出即可。

## 复杂度

时间 $O(|s|)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow()
    var d = 0
    var m = 0
    var y = 0
    for (ch in s) {
        if (ch == 100) {        // 'd'
            d += 1
        } else if (ch == 109) { // 'm'
            m += 1
        } else if (ch == 121) { // 'y'
            y += 1
        }
    }
    println("${d} ${m} ${y}")
}
```
