---
oj: dmy
pid: '99'
title: '[R17C]投票分组2'
difficulty: 提高
tags:
  - 前缀和
  - 数论
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1\leq n\leq 10^5$，$1\leq a_i\leq 2$。

## 思路

把同学按编号每 $k$ 个一组（$k$ 是 $n$ 的因数），第 $g$ 组（$g=0,1,\dots,\frac{n}{k}-1$）覆盖编号区间 $[g\cdot k+1,\,(g+1)\cdot k]$。该组是否支持款式 $1$，取决于组内 $1$ 的票数是否 **严格多于** $2$ 的票数，即 $1$ 的个数 $> k/2$，等价地写成 $1\text{ 的个数}\times 2 > k$。

预处理前缀和 $\textit{pre}[i]$ 表示 $a_1\sim a_i$ 中 $1$ 的个数（约定 $\textit{pre}[0]=0$），第 $g$ 组中 $1$ 的个数就是 $\textit{pre}[(g+1)\cdot k]-\textit{pre}[g\cdot k]$，$O(1)$ 得到。

$n$ 的所有因数用 $O(\sqrt n)$ 枚举（连同 $n/i$ 一起收集），再从小到大排序。对每个因数 $k$，枚举 $\frac{n}{k}$ 个组各做一次 $O(1)$ 判断。

## 复杂度

预处理前缀和 $O(n)$；枚举因数 $O(\sqrt n)$；对每个因数 $k$ 扫 $\frac{n}{k}$ 个组，总开销 $\sum_{k\mid n}\frac{n}{k}\le \sum_{k=1}^{n}\frac{n}{k}=O(n\log n)$。整体 $O(n\log n)$，对 $n\le 10^5$ 绰绰有余。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*
import std.sort.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // prefix sum of ones: pre[i] = a_1..a_i 中 1 的个数（1-indexed），pre[0]=0
    let pre = Array<Int64>(n + 1, { _ => 0 })
    var s = 0
    for (i in 0..n) {
        if (a[i] == 1) {
            s = s + 1
        }
        pre[i + 1] = s
    }
    // collect divisors of n
    let divs = ArrayList<Int64>()
    var i = 1
    while (i * i <= n) {
        if (n % i == 0) {
            divs.add(i)
            if (i != n / i) {
                divs.add(n / i)
            }
        }
        i = i + 1
    }
    sort(divs)
    for (k in divs) {
        // groups: g = 0 .. (n/k - 1), range [g*k+1, (g+1)*k]
        // ones in group g = pre[(g+1)*k] - pre[g*k]
        // supports 1 if ones*2 > k
        var cnt = 0
        var g = 0
        let groups = n / k
        while (g < groups) {
            let ones = pre[(g + 1) * k] - pre[g * k]
            if (ones * 2 > k) {
                cnt = cnt + 1
            }
            g = g + 1
        }
        println(cnt)
    }
}
```
