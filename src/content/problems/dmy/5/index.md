---
oj: dmy
pid: '5'
title: '[R1E] 过分的子区间'
difficulty: 普及/提高-
tags:
  - 双指针
  - 二分
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le k \le n \le 2 \times 10^5$，$1 \le x,A_i \le 10^9$。

## 思路

「区间内第 $k$ 小的数 $\ge x$」等价于「区间内小于 $x$ 的数不足 $k$ 个」。而区间长度小于 $k$ 时自动满足该条件，所以两类区间可以统一计数。

对每个左端点 $l$，区间内小于 $x$ 的元素个数随右端点 $r$ 增大而单调不减，因此满足条件（小于 $x$ 的个数 $\le k-1$）的最大右端点 $r$ 也随 $l$ 增大而单调不减，用 **双指针** 扫描：

- 维护指针 $r$ 和当前区间 $[l,r]$ 中小于 $x$ 的个数 $cnt$；
- 不断右移 $r$，直到再加入一个小于 $x$ 的数就会达到 $k$ 个为止，此时以 $l$ 为左端点且满足条件的子区间有 $r-l+1$ 个，累加进答案；
- $l$ 右移时把 $A_l$ 的贡献从 $cnt$ 中移除。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nkx = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nkx[0]
    let k = nkx[1]
    let x = nkx[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var ans: Int64 = 0
    var r: Int64 = -1
    var less: Int64 = 0
    for (l in 0..n) {
        if (r < l - 1) {
            r = l - 1
            less = 0
        }
        while (r + 1 < n && less + (if (a[r + 1] < x) { 1 } else { 0 }) < k) {
            r += 1
            if (a[r] < x) {
                less += 1
            }
        }
        ans += r - l + 1
        if (l <= r && a[l] < x) {
            less -= 1
        }
    }
    println(ans)
}
```

要点：

- 条件写成「小于 $x$ 的个数 $< k$」，处理时用 `Int64`，答案最大为全部 $n(n+1)/2 \approx 2 \times 10^{10}$ 个子区间，不能存进 `Int32`。
- 当 $r < l-1$ 时区间为空，需把 $r$ 拉回 $l-1$ 并把 $cnt$ 清零，否则负数会污染计数。
