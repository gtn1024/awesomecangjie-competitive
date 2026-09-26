---
oj: dmy
pid: '475'
title: '[R77A] 穿越了？'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$S$ 仅为 `2026.09.25` 或 `2026.10.01`，长度固定为 10，不含空格。

## 思路

只有两个可能的日期，直接比较字符串即可：

- $S = $ `2026.09.25` 对应中秋节，输出 `Mid-Autumn Festival`；
- 由题目保证，其余情况（即 `2026.10.01`）是国庆节，输出 `National Day`。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
main() {
    let s = readln()
    if (s == "2026.09.25") {
        println("Mid-Autumn Festival")
    } else {
        println("National Day")
    }
}
```
