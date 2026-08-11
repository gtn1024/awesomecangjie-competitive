---
oj: dmy
pid: '56'
title: '[R10B] 平方数'
difficulty: 入门
tags:
  - 二分
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le N \le 10^{18}$。

## 思路

$1 \sim N$ 中最大的平方数是 $\lfloor \sqrt N \rfloor^2$。直接用浮点 `sqrt` 求 $\lfloor \sqrt N \rfloor$ 在 $N$ 接近 $10^{18}$ 时可能因精度误差算错，因此用整数二分求出满足 $x^2 \le N$ 的最大 $x$，答案即为 $x^2$。二分上界取 $10^9$（$\sqrt{10^{18}}$），$x^2$ 不超过 $10^{18}$，不会溢出 `Int64`。

复杂度：时间 $O(\log N)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var lo: Int64 = 0
    var hi: Int64 = 1000000000
    while (lo < hi) {
        let mid = (lo + hi + 1) / 2
        if (mid * mid <= n) {
            lo = mid
        } else {
            hi = mid - 1
        }
    }
    println(lo * lo)
}
```
