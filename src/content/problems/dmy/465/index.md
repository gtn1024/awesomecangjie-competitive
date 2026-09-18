---
oj: dmy
pid: '465'
title: '[R75C] 站点'
difficulty: 普及
tags:
  - 前缀和
  - 差分
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2 \times 10^5$，$1 \le q \le 2 \times 10^5$，$1 \le w_i \le 10^6$。

## 思路

设通道 $i$ 对应站点 $i$ 与 $i+1$ 之间的边。任务 $(l, r)$ 走过的路程是 $w_l + w_{l+1} + \dots + w_{r-1}$，记所有任务的这段路程之和为 $S$。

若把传送门建在通道 $i$，那么只有**经过**这条通道的任务才会省下 $w_i$：任务 $(l, r)$ 经过通道 $i$ 当且仅当 $l \le i < r$。设 $c_i$ 为经过通道 $i$ 的任务数，则总路程从 $S$ 减少到 $S - w_i \cdot c_i$。

于是答案就是

$$\min_{1 \le i < n} \left( S - w_i \cdot c_i \right) = S - \max_{1 \le i < n} w_i \cdot c_i$$

$S$ 用前缀和求出：预处理 $p_k = w_1 + \dots + w_k$（$p_0 = 0$），则单个任务贡献 $p_{r-1} - p_{l-1}$。

$c_i$ 用差分求出：对每个任务 $(l, r)$，它覆盖通道区间 $[l, r-1]$，在差分数组上做 `d[l] += 1`、`d[r] -= 1`，最后对 $i = 1, 2, \dots, n-1$ 做前缀和，得到的就是 $c_i$。

注意 $S$ 最大可达 $q \cdot n \cdot 10^6 \approx 4 \times 10^{16}$，需要用 64 位整数。

## 复杂度

时间 $O(n + q)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let q = first[1]
    let w = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let pre = Array<Int64>(n, { _ => 0 })
    var s: Int64 = 0
    for (i in 0..(n - 1)) {
        s += w[i]
        pre[i + 1] = s
    }

    let diff = Array<Int64>(n + 1, { _ => 0 })
    var total: Int64 = 0
    for (_ in 0..q) {
        let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let l = lr[0]
        let r = lr[1]
        total += pre[r - 1] - pre[l - 1]
        diff[l] += 1
        diff[r] -= 1
    }

    var best: Int64 = 0
    var cur: Int64 = 0
    for (i in 1..n) {
        cur += diff[i]
        let gain = w[i - 1] * cur
        if (gain > best) {
            best = gain
        }
    }
    println(total - best)
}
```
