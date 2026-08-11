---
oj: dmy
pid: '37'
title: '[R7A] K的倍数'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le L \le R \le 10^6$，$1 \le K \le 10^6$。

## 思路

$[L, R]$ 中 $K$ 的倍数个数为 $\lfloor R / K \rfloor - \lfloor (L - 1) / K \rfloor$，即前缀 $[1, x]$ 内 $K$ 的倍数个数之差，直接 $O(1)$ 计算。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let l = line[0]
    let r = line[1]
    let k = line[2]
    println(r / k - (l - 1) / k)
}
```
