---
oj: dmy
pid: '244'
title: '[R40A] Yet another legend problem'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$0 \le x \le 100$。

## 思路

营业时间是每天的 $6:00 \sim 18:00$。从 $00:00$ 起经过 $x$ 小时后，当前时刻的小时数 $h = x \bmod 24$，判断 $6 \le h \le 18$ 即可。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let x = Int64.parse(reader.readln().getOrThrow())
    let h = x % 24
    println(if (6 <= h && h <= 18) { "I love Shawarma" } else { "Shawarma is the best food" })
}
```

要点：

- 营业区间含端点，用 `6 <= h && h <= 18` 判断。
- 输出两种固定文案，用 `if` 表达式直接作为 `println` 的参数。
