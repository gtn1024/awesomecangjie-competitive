---
oj: dmy
pid: '187'
title: '[R31B]删除数字'
difficulty: 普及
tags:
  - 贪心
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq T \leq 100$，$1 \leq n \leq 10^5$，$1 \leq A_i \leq 10^9$，所有测试数据的 $n$ 的和不超过 $10^5$。

## 思路

设数组总和为 $S$，只关心 $S \bmod 3$。删去若干元素后，剩余和仍为整数，要让它变成 $3$ 的倍数，等价于让删去元素之和恰好抵消 $S \bmod 3$。

对每个 $A_i$ 只关心它对 $3$ 取模的余数 $r \in \{0,1,2\}$，统计余数 $1$ 的个数 $c_1$、余数 $2$ 的个数 $c_2$（余数 $0$ 的元素删不删不影响总和模 $3$）。

- 若 $S \bmod 3 = 0$，已经满足，删除 $0$ 个。
- 若 $S \bmod 3 = 1$，需要让删去和 $\bmod 3 = 1$：要么删 $1$ 个余 $1$ 的数，要么删 $2$ 个余 $2$ 的数（$2+2=4\equiv 1$）。优先删 $1$ 个；当 $c_1=0$ 时只能删 $2$ 个。
- 若 $S \bmod 3 = 2$，对称地：要么删 $1$ 个余 $2$ 的数，要么删 $2$ 个余 $1$ 的数（$1+1=2$）。优先删 $1$ 个；当 $c_2=0$ 时只能删 $2$ 个。

可行性显然：当 $S \bmod 3 \ne 0$ 时，$c_1+c_2 \geq 1$，且若 $c_1=0$ 则 $c_2 \geq 2$（否则 $S \bmod 3$ 不会是 $1$），故两种情形下总存在合法方案，答案不超过 $2$。

## 复杂度

每组数据扫描一次数组，时间 $\mathcal{O}(n)$，空间 $\mathcal{O}(n)$（读入数组）。总时间 $\mathcal{O}(\sum n) \leq 10^5$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

// [R31B] 删除数字
// 数组 A，删除最少的元素使剩余元素之和是 3 的倍数。
// 总和 S%3：0 删 0；1 删 1 个 %3==1 或 2 个 %3==2；2 删 1 个 %3==2 或 2 个 %3==1。

func solve(reader: ConsoleReader): Int64 {
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var c0 = 0
    var c1 = 0
    var c2 = 0
    var s = 0
    for (x in a) {
        let r = x % 3
        s = (s + r) % 3
        if (r == 0) {
            c0 = c0 + 1
        } else if (r == 1) {
            c1 = c1 + 1
        } else {
            c2 = c2 + 1
        }
    }
    if (s == 0) {
        return 0
    } else if (s == 1) {
        // 删 1 个 %3==1，或删 2 个 %3==2，取较小（数量不够则只能选另一方案）
        if (c1 >= 1) {
            return 1
        }
        return 2
    } else {
        // s == 2：删 1 个 %3==2，或删 2 个 %3==1
        if (c2 >= 1) {
            return 1
        }
        return 2
    }
}

main() {
    let reader = Console.stdIn
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        println(solve(reader))
    }
}
```
