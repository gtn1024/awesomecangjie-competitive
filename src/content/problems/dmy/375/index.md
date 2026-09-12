---
oj: dmy
pid: '375'
title: '[R60C] 加'
difficulty: 普及
tags:
  - 枚举
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le m \le n \le 5000$，$|a_i| \le 10^5$。

## 思路

一次操作把 $a_x$ 的值合并到右侧 $a_{x+1}$，并把 $a_x$ 置 $0$：

$$a_{x+1}:=a_{x+1}+a_x,\quad a_x:=0$$

要把连续区间 $[l,r]$ 的和集中到右端点 $r$，只需依次操作 $x=l,l+1,\dots,r-1$，共 $r-l$ 次操作。因此任意长度不超过 $m+1$ 的连续子段，其和都能被集中到右端点；反过来一次操作只向右累加、且每次消耗一次操作，所以能集中的也就是这些长度不超过 $m+1$ 的连续子段。

于是直接枚举所有区间 $[l,r]$，若 $r-l\le m$，用区间和 $a_l+\dots+a_r$ 更新答案，前缀和可在 $O(1)$ 内算出单个区间和。

需要注意边界：

- 可以不进行操作，答案至少是原数组的最大值；
- 若 $n\ge 2$ 且 $m\ge 1$，可以做一次操作产生一个 $0$，因此答案还可以与 $0$ 取较大（全为负数时答案为 $0$）；
- 若 $n=1$，不存在合法操作，答案只能是 $a_1$。

时间复杂度 $O(n^2)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line1[0])
    let m = Int64.parse(line1[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })

    // 可以不操作，答案至少是原数组最大值
    var ans = a[0]
    for (i in 0..Int64(a.size)) {
        if (a[i] > ans) {
            ans = a[i]
        }
    }

    var pref = Array<Int64>(a.size + 1, { _ => 0 })
    for (i in 0..Int64(a.size)) {
        pref[i + 1] = pref[i] + a[i]
    }

    // 枚举区间 [l, r]（0-based），把和集中到右端点 r 需要 r - l 次操作
    var l = Int64(0)
    while (l < n) {
        var r = l
        while (r < n) {
            if (r - l <= m) {
                let s = pref[r + 1] - pref[l]
                if (s > ans) {
                    ans = s
                }
            }
            r++
        }
        l++
    }

    // n >= 2 且 m >= 1 时可以产生一个 0
    if (n >= 2 && m >= 1) {
        if (0 > ans) {
            ans = 0
        }
    }

    println(ans)
}
```

## 要点

- **关键观察**：连续子段和能集中到右端点当且仅当段长不超过 $m+1$，把问题归约为「在所有长度 $\le m+1$ 的连续子段和中取最大」。
- 前缀和避免每次重算区间和，整体降到 $O(n^2)$。
- 别漏了与原数组最大值、与 $0$（当 $n\ge 2$ 且 $m\ge 1$）取较大这两个下界。
