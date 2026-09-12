---
oj: dmy
pid: '349'
title: '[R56B] 复读机'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, k \le 50$，$s$ 只由小写字母组成。

## 思路

直接模拟：依次取出 $s$ 的每个字符，各重复输出 $k$ 次即可。输出串总长度为 $n \times k \le 2500$，直接逐字符 `print` 输出，行尾 `println()` 补换行。

复杂度：时间 $O(nk)$，空间 $O(nk)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x: String => Int64.parse(x) })
    let k = p[1]
    let s = reader.readln().getOrThrow()
    for (r in s.runes()) {
        for (i in 0..k) {
            print(r)
        }
    }
    println()
    return 0
}
```
