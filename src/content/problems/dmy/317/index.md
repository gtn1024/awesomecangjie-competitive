---
oj: dmy
pid: '317'
title: '[R51C] 电脑蓝屏'
difficulty: 普及-
tags:
  - 差分
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le k \le n \le 10^5$，$0 \le m \le 10^5$，$1 \le x \le 10^9$，$1 \le l_i \le r_i \le n$，$1 \le a_i \le 10^4$。

## 思路

先求出在不玩游戏（游戏负担为 $0$）时，每一秒 $t \in [1, n]$ 电脑所承受的背景负担 $B(t)$。每个进程在第 $[l_i, r_i]$ 秒持续贡献 $a_i$，这是典型的**区间加**，用差分数组 $O(n + m)$ 求出所有 $B(t)$。

设游戏的恒定负担为 $g \ge 0$，则第 $t$ 秒电脑总负担为 $B(t) + g$。电脑蓝屏的条件是「总负担 **严格大于** 性能 $x$」的秒数 **至少** 为 $k$。也就是说，不蓝屏当且仅当这样的「坏秒数」至多为 $k - 1$。

注意 $g$ 越大，「坏秒数」越多——这是一个单调关系。把 $B(t)$ 从小到大排序后，为使坏秒数不超过 $k - 1$，只需让值最大的 $k - 1$ 个秒可以坏掉、其余 $n - k + 1$ 个秒都不坏。换句话说，排序后第 $n - k + 1$ 小的负担（即 $b[n-k]$，0-indexed）加上 $g$ 后仍不能超过 $x$：

$$g \le x - b[n - k]$$

因此最大负担就是

$$\mathrm{ans} = x - b[n - k]$$

若 $\mathrm{ans} < 0$，说明即便 $g = 0$（完全不玩游戏）坏秒数也已达到 $k$，电脑必然蓝屏，输出 `-1`。

复杂度：时间 $O(n \log n + m)$（排序为主），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*
import std.sort.*

main() {
    let reader = Console.stdIn
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let k = first[2]
    let x = first[3]

    // 差分数组，1-indexed，大小 n+2
    let diff = Array<Int64>(n + 2, { _ => 0 })
    var i = Int64(0)
    while (i < m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let l = line[0]
        let r = line[1]
        let a = line[2]
        diff[l] += a
        diff[r + 1] -= a
        i++
    }

    // 求前缀和得到每秒背景负担 B(t)
    let b = Array<Int64>(n, { _ => 0 })
    var cur = Int64(0)
    var t = Int64(0)
    while (t < n) {
        cur += diff[t + 1]
        b[t] = cur
        t++
    }

    sort(b)

    // 排序后第 (n-k+1) 小的负担，0-indexed 为 b[n-k]
    let threshold = b[n - k]
    let ans = x - threshold
    if (ans < 0) {
        println(-1)
    } else {
        println(ans)
    }
}
```
