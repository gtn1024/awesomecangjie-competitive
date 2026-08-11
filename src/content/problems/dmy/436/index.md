---
oj: dmy
pid: '436'
title: '[R70D] 溯源'
difficulty: 普及/提高-
tags:
  - 数学
  - 位运算
timeLimit: 2s
memoryLimit: 512m
---

## 思路

先化简 $f(x)$。按二进制展开 $x = \sum_j c_j 2^j$（$c_j \in \{0, 1\}$），则 $\lfloor x/2^i \rfloor = \sum_{j \ge i} c_j 2^{j-i}$，所以

$$
f(x) = \sum_j c_j (2^j + 2^{j-1} + \cdots + 1) = \sum_j c_j (2^{j+1} - 1) = 2x - \operatorname{popcount}(x)
$$

其中 $\operatorname{popcount}(x)$ 是 $x$ 的二进制中 1 的个数。

**反向链**。$f$ 严格递增，且 $x \le f(x) < 2x$（等号仅当 $x = 1$），因此给定 $y$，满足 $f(x) = y$ 的 $x$ **至多一个**：若存在，则 $y/2 < x < y$（$x = 1$ 时是自身原像）。所以从 $y$ 出发不断求原像，路径唯一，且每一步数值至少减半，链长 $O(\log y)$。能到达 $y$ 的初始值必然在这条反向链上，链上最小元素（即链尾）就是答案；若某个值没有原像，它本身就是答案（不操作也满足条件）。

**求原像**。由 $y = 2x - \operatorname{popcount}(x)$ 得 $x = (y + \operatorname{popcount}(x))/2$。枚举 $pc = \operatorname{popcount}(x) \in [1, 60]$（$x \le y \le 10^{18} < 2^{60}$）：要求 $y + pc$ 为偶数，即 $pc \equiv y \pmod 2$，只需枚举约 30 个同奇偶的值；算出 $c = (y + pc)/2$ 后检查 $\operatorname{popcount}(c) = pc$ 即可。

复杂度：链长与 popcount 枚举都是 $O(\log y)$，每次枚举内 popcount 为 $O(1)$ 位运算，总复杂度 $O(\log^2 y)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

func popcount(v0: Int64): Int64 {
    var v = v0
    v = v - ((v >> 1) & 0x5555555555555555)
    v = (v & 0x3333333333333333) + ((v >> 2) & 0x3333333333333333)
    v = (v + (v >> 4)) & 0x0F0F0F0F0F0F0F0F
    v = v + (v >> 8)
    v = v + (v >> 16)
    v = v + (v >> 32)
    return v & 0x7F
}

func solve(): Unit {
    let reader = getStdIn()
    var y = Int64.parse(reader.readln().getOrThrow())
    while (true) {
        var nx = y
        var pc: Int64 = 1
        if (y % 2 == 0) {
            pc = 2
        }
        while (pc <= 60) {
            let cand = (y + pc) / 2
            if (popcount(cand) == pc) {
                nx = cand
                break
            }
            pc = pc + 2
        }
        if (nx >= y) {
            break
        }
        y = nx
    }
    println(y)
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var i = 0
    while (i < t) {
        solve()
        i = i + 1
    }
}
```
