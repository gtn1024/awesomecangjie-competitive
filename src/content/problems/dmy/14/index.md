---
oj: dmy
pid: '14'
title: '[R3B] k 次幂之和'
difficulty: 入门
tags:
  - 数学
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n,k \le 100$，$1 \le A_i \le 10^9$。

## 思路

对每个 $A_i$ 循环 $k$ 次做乘法并逐次取模，累加后取模。$n,k \le 100$，朴素做法足够。

复杂度：时间 $O(nk)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD = 998244353

main(): Int64 {
    let reader = getStdIn()
    let nk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nk[0]
    let k = nk[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var ans: Int64 = 0
    for (i in 0..n) {
        let x = a[i] % MOD
        var pw: Int64 = 1
        for (_ in 0..k) {
            pw = pw * x % MOD
        }
        ans = (ans + pw) % MOD
    }
    println(ans)
    return 0
}
```

要点：

- $A_i$ 先对模数取一次模，幂运算过程中每次乘法后立刻取模；两个小于模数的数相乘不超过 $10^{18}$，`Int64` 内不溢出。
