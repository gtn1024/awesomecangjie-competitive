---
oj: dmy
pid: '366'
title: '[R59A] 好串'
difficulty: 入门
tags:
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le |S| \le 1000$，$S$ 只包含大写字母。

## 思路

坏串的定义是存在某个 $1 \le i < n$ 使 $T_i = \texttt{W}$ 且 $T_{i + 1} = \texttt{A}$，即字符串中出现连续子串 `WA`。因此只需判断 $S$ 是否包含子串 `WA`：包含则输出 `NO`，否则输出 `YES`。

直接用字符串的子串查找 `contains("WA")` 即可，无需逐字符扫描。

复杂度：时间 $O(|S|)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*

main() {
    let s = getStdIn().readln().getOrThrow()
    println(if (s.contains("WA")) { "NO" } else { "YES" })
}
```
