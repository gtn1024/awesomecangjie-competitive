---
oj: dmy
pid: '247'
title: '[R40D] Yet another ICPC problem'
difficulty: 普及/提高-
tags:
  - 排序
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le a_i, b_i, c_j, d_j \le 10^9$。

## 思路

假设 apiadu 解决 $k$ 道题，jiangly 解决 $n - k$ 道题。两人各自解题时疲劳值递增，且序列固定：apiadu 的第 $x$ 题（$1 \le x \le k$）附加 $c_{x-1}$，jiangly 的第 $y$ 题附加 $d_{y-1}$。因此**疲劳值部分的总代价固定**为

$$\sum_{x=0}^{k-1} c_x + \sum_{y=0}^{n-k-1} d_y$$

与题目分配无关，只需再最小化 $\sum_{i \in S} a_i + \sum_{j \notin S} b_j$，其中 $S$ 是分给 apiadu 的 $k$ 道题。变形：

$$\sum_{i \in S} a_i + \sum_{j \notin S} b_j = \sum_{i \in S} a_i + \left(\sum_{\text{all}} b - \sum_{i \in S} b_i\right) = \sum_{\text{all}} b + \sum_{i \in S} (a_i - b_i)$$

$\sum b$ 是常数，所以固定 $k$ 时，把 $a_i - b_i$ 最小的 $k$ 道题分给 apiadu 即可。

实现上，将 $a_i - b_i$ 排序后做前缀和 $pref[k]$（前 $k$ 个最小差值之和），并预处理 $c$、$d$ 的前缀和 $C$、$D$ 以及 $\sum b$，枚举 $k$ 取最小值：

$$ans = \min_{0 \le k \le n}\left( C[k] + D[n-k] + \sum b + pref[k] \right)$$

复杂度：时间 $O(n \log n)$（排序主导），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let d = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // diff[i] = a_i - b_i；sumB 为所有 b_i 之和
    var sumB: Int64 = 0
    let diff = Array<Int64>(nn, { _ => 0 })
    for (i in 0..nn) {
        sumB += b[i]
        diff[i] = a[i] - b[i]
    }
    // pc[k] = c_0 + ... + c_{k-1}，pd[k] = d_0 + ... + d_{k-1}
    let pc = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 0..nn) {
        pc[i + 1] = pc[i] + c[i]
    }
    let pd = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 0..nn) {
        pd[i + 1] = pd[i] + d[i]
    }
    // diff 升序后 pref[k] = 最小的 k 个 a_i - b_i 之和
    sort(diff)
    let pref = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 0..nn) {
        pref[i + 1] = pref[i] + diff[i]
    }
    // 枚举 apiadu 解题数 k
    var ans: Int64 = pd[nn] + sumB
    for (k in 1..nn + 1) {
        let cur = pc[k] + pd[nn - k] + sumB + pref[k]
        if (cur < ans) {
            ans = cur
        }
    }
    println(ans)
    return 0
}
```
