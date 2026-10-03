---
oj: dmy
pid: '441'
title: '[R71C] 区间校温'
difficulty: 入门
tags:
  - 枚举
  - 前缀最值
timeLimit: 1s
memoryLimit: 256m
---

## 思路

先统计初始同步对数量 `base`。

关键观察：对区间 $[l, r]$ 内部的相邻对 $(i, i+1)$（$l \le i < r$），两个温度都加 $1$，同步关系不变；区间外的相邻对也不变。真正可能变化的只有两个边界对：$(l-1, l)$（若 $l > 1$）和 $(r, r+1)$（若 $r < n$）。

定义左端点贡献与右端点贡献：

$$L(l) = \begin{cases} [a_{l-1}=a_l+1] - [a_{l-1}=a_l], & l > 1 \\ 0, & l = 1 \end{cases}$$

即左侧被加 $1$ 后，边界对 $(l-1, l)$ 的同步状态变化量：原本差 $1$ 则变为同步（$+1$），原本相等则变为不同步（$-1$）。

$$R(r) = \begin{cases} [a_r=a_{r+1}-1] - [a_r=a_{r+1}], & r < n \\ 0, & r = n \end{cases}$$

同理是右侧边界对 $(r, r+1)$ 的变化量。答案即为

$$base + \max_{1 \le l \le r \le n} \left( L(l) + R(r) \right)$$

直接枚举 $l, r$ 是 $O(n^2)$。由于 $L$ 与 $R$ 相互独立，只受 $l \le r$ 约束，可以扫描右端点 $r$，同时维护前缀最大值 $\text{mx} = \max(L(1), \ldots, L(r))$，每次用 $\text{mx} + R(r)$ 更新答案即可。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var base: Int64 = 0
    var i: Int64 = 0
    while (i + 1 < n) {
        if (a[i] == a[i + 1]) {
            base += 1
        }
        i += 1
    }
    var maxL: Int64 = 0
    var best: Int64 = -2
    i = 0
    while (i < n) {
        if (i >= 1) {
            var li: Int64 = 0
            if (a[i - 1] == a[i] + 1) {
                li = 1
            }
            if (a[i - 1] == a[i]) {
                li -= 1
            }
            if (li > maxL) {
                maxL = li
            }
        }
        var ri: Int64 = 0
        if (i + 1 < n) {
            if (a[i] == a[i + 1] - 1) {
                ri = 1
            }
            if (a[i] == a[i + 1]) {
                ri -= 1
            }
        }
        let cur = maxL + ri
        if (cur > best) {
            best = cur
        }
        i += 1
    }
    println(base + best)
}
```

</details>
