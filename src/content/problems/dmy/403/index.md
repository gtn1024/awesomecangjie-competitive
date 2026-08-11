---
oj: dmy
pid: '403'
title: '[R65A] 考场编号'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 500$。

## 思路

每 30 个考生一个考场。第 $n$ 位考生的考场编号是 $\lfloor (n-1)/30 \rfloor + 1$，座位编号是 $(n-1) \bmod 30 + 1$。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let out = StringBuilder()
    out.append((n - 1) / 30 + 1)
    out.append(" ")
    out.append((n - 1) % 30 + 1)
    println(out.toString())
    return 0
}
```

要点：

- 编号从 1 开始，先减 1 再做除法/取模、最后加 1，避免 30 的倍数落在错误位置（如第 30 位考生应在第 1 考场第 30 座）。
