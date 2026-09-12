---
oj: dmy
pid: '59'
title: '[R10E] 知识点学习2'
difficulty: 提高
tags:
  - 树
  - 拓扑排序计数
  - 逆元
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$0 \le p_i < i$。

## 思路

前置关系构成一棵以 $0$ 为虚拟根的森林（每个知识点恰有一个父 $p_i$，且 $p_i < i$）。合法学习方案就是这棵树的拓扑序计数。

树形结构拓扑序数的经典公式：设 $sz[v]$ 为以 $v$ 为根的子树大小，则

$$\text{方案数} = \frac{n!}{\prod_{v=1}^{n} sz[v]}$$

直觉是：$n$ 个位置随便排有 $n!$ 种，但每个 $v$ 必须排在它所有子孙之前；在一个子树内部，根 $v$ 必须是这 $sz[v]$ 个点里最靠前的，相对其他 $sz[v]-1$ 个点等概率，于是要除以 $sz[v]$，各点独立连乘。

因为 $p_i < i$，无需递归：把所有 $sz$ 初始化为 $1$，从 $n$ 到 $1$ 倒序把 $sz[i]$ 累加到 $sz[p_i]$ 即可得到所有子树大小。最终答案在模 $998244353$ 意义下用 $n! \cdot (\prod sz[v])^{-1}$ 计算，分母用快速幂求逆元。

复杂度：时间 $O(n + \log MOD)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

let MOD: Int64 = 998244353

func powMod(base: Int64, exp: Int64): Int64 {
    var b = base % MOD
    var e = exp
    var r: Int64 = 1
    while (e > 0) {
        if ((e & 1) == 1) {
            r = r * b % MOD
        }
        b = b * b % MOD
        e = e >> 1
    }
    return r
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x => Int64.parse(x) })
    // p_i < i, 倒序累加 sz
    let sz = Array<Int64>(n + 1, { _ => 1 })
    var i = n
    while (i >= 1) {
        let par = p[i - 1]
        sz[par] += sz[i]
        i -= 1
    }
    var fac: Int64 = 1
    var k: Int64 = 2
    while (k <= n) {
        fac = fac * k % MOD
        k += 1
    }
    var denom: Int64 = 1
    for (v in 1..=n) {
        denom = denom * sz[v] % MOD
    }
    let ans = fac * powMod(denom, MOD - 2) % MOD
    println(ans)
}
```

要点：

- 树的拓扑序计数等于 $n!/\prod sz[v]$，是树形依赖计数题的常用结论。
- $p_i < i$ 让我们无需建树和 DFS，倒序一遍即可累出所有子树大小。
