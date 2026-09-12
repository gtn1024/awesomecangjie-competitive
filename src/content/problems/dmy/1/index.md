---
oj: dmy
pid: '1'
title: '[R1A] 最大奇数'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le A_i \le 10^9$。

## 思路

逐个读入 $A_i$，用 $A_i \bmod 2 \ne 0$ 判断是否为奇数，是则与当前答案取较大者。若所有数都不是奇数，答案保持初值 $-1$，直接输出即可。

复杂度：时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var ans: Int64 = -1
    for (i in 0..n) {
        if (a[i] % 2 != 0 && a[i] > ans) {
            ans = a[i]
        }
    }
    println(ans)
}
```

要点：

- 数组按题面在第二行一次性读入，行尾多余空格由 `split(" ", removeEmpty: true)` 过滤。
- 答案初值设为 $-1$，天然覆盖「没有奇数」的情况；$A_i \ge 1$ 全为正数，$\bmod 2$ 判断奇偶不存在负数语义问题。
