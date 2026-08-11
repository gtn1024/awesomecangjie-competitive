---
oj: dmy
pid: '193'
title: '[R32B]优美数组'
difficulty: 普及
tags:
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq T \leq 10$，$1 \leq n \leq 10^5$，$1 \leq A_i \leq n$。

## 思路

先给出一个经典结论：一个长度为 $n$ 的数组能重排成「相邻元素互不相同」的充要条件是，出现次数最多的那种元素的次数 $mx$ 满足

$$
mx \leq n - mx + 1
$$

即「最多的那一种」不超过「其余所有元素总数加一」。必要性显然（每种元素至多占用 $n-mx$ 个间隔加首尾共 $n-mx+1$ 个槽位）；充分性可通过把出现最多的元素插入其余元素形成的间隙来构造。

于是我们要做的，就是删掉尽量少的元素，让剩下的数组满足上式。设原始总数为 $n$，最大频次为 $mx$。显然只需删出现次数最多的那种元素：删掉一个这样的元素后，$n$ 和 $mx$ 各减 $1$，其余不变，不等式两侧相对变化最有利于满足条件。

设删 $d$ 个，则要求

$$
mx - d \leq (n - d) - (mx - d) + 1 = n - mx + 1
$$

化简得 $d \geq 2mx - n - 1$。所以答案为

$$
\max(0,\ 2mx - n - 1)
$$

## 复杂度

每组数据一次遍历统计频次并维护最大值，时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main(): Int64 {
    let reader = Console.stdIn
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let n = Int64.parse(reader.readln().getOrThrow())
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        // 统计每个值出现次数的最大值。Ai in [1, n]，用数组计数。
        let cnt = Array<Int64>(Int64(n + 1), { _ => 0 })
        var mx = 0
        for (x in a) {
            cnt[x] = cnt[x] + 1
            if (cnt[x] > mx) {
                mx = cnt[x]
            }
        }
        var d = 2 * mx - n - 1
        if (d < 0) {
            d = 0
        }
        println(d)
    }
    return 0
}
```
