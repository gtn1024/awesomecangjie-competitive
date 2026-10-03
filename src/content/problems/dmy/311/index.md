---
oj: dmy
pid: '311'
title: '[R50C]截断加法'
difficulty: 提高
tags:
  - 贪心
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le k \le n \le 2 \times 10^5$，$1 \le D \le 10^9$，$1 \le a_i, b_i \le 10^9$，保证 $a_i \le D$。

## 思路

题目要找最小的非负整数 $x$，使得令 $c_i = \min(D, a_i + x)$ 后，至少 $k$ 个位置满足 $c_i \ge b_i$。

先刻画单个位置 $i$ 在什么 $x$ 下能达标。因为 $c_i = \min(D, a_i + x) \le D$：

- 若 $b_i > D$，则 $c_i \le D < b_i$ 恒成立，**该位置永远无法达标**，无论 $x$ 多大；
- 若 $b_i \le D$，则 $c_i \ge b_i$ 等价于 $a_i + x \ge b_i$（因为此时 $\min$ 取到 $b_i$ 这一侧即足够），即 $x \ge b_i - a_i$。再与 $x \ge 0$ 取下界，得到该位置达标所需的最小非负 $x$ 为 $\max(0, b_i - a_i)$。

于是问题转化为：每个「可达标位置」（$b_i \le D$）对应一个阈值 $\max(0, b_i - a_i)$，要选最小的 $x$ 使至少 $k$ 个阈值 $\le x$。这等价于把所有阈值排序后取第 $k$ 小的值——选它作为 $x$ 时，恰有至少 $k$ 个阈值不超过它，且再小就会有不足 $k$ 个。

边界：若可达标位置总数不足 $k$，无解，输出 `-1`。

## 复杂度

时间 $O(n \log n)$（排序主导），空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.collection.*
import std.convert.*
import std.env.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let hdr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = hdr[0]
    let D = hdr[1]
    let k = hdr[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var needs = ArrayList<Int64>(0)
    var i = 0
    while (i < n) {
        if (b[i] <= D) {
            var need = b[i] - a[i]
            if (need < 0) {
                need = 0
            }
            needs.add(need)
        }
        i++
    }
    if (Int64(needs.size) < k) {
        println("-1")
        return 0
    }
    sort(needs)
    println("${needs[k - 1]}")
    return 0
}
```

</details>
