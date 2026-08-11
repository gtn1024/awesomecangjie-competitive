---
oj: dmy
pid: '397'
title: '[R64A] 10'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$。

## 思路

$10^n$ 是 1 后面跟 $n$ 个 0，共 $n+1$ 位，超出了 `Int64` 的表示范围，直接用字符串输出。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let sb = StringBuilder()
    sb.append("1")
    for (i in 0..n) {
        sb.append("0")
    }
    println(sb.toString())
    return 0
}
```

要点：

- 拼接 `n + 1` 个字符即可，不需要任何数值运算。
