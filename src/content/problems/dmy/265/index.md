---
oj: dmy
pid: '265'
title: '[R43C]序列(Medium Ver.)'
difficulty: 提高
tags:
  - 枚举
  - 子数组
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 5000$，$0 \le k, a_i \le 10^9$。注意本题统计的是**连续子数组**，不是子序列。

## 思路

$n \le 5000$ 允许 $O(n^2)$ 的做法。直接枚举所有连续子数组 $[l, r]$：固定左端点 $l$，让右端点 $r$ 从 $l$ 向右扩展。扩展过程中只需维护当前段的最大值 $\mathrm{mx}$ 与最小值 $\mathrm{mn}$——每加入一个 $a_r$，用一次比较更新二者即可，无需重新扫描整段。

于是对每个 $[l, r]$ 能在 $O(1)$ 时间内判断 $\mathrm{mx} - \mathrm{mn} \le k$ 是否成立，成立则计数加一。整体复杂度 $O(n^2)$。

关键在于「固定左端点、向右扩展」时 $\mathrm{mx}$、$\mathrm{mn}$ 可以**增量维护**：因为向段内加入新元素只可能让最大值变大、最小值变小，不会回退，所以一次遍历就够了。

## 复杂度

时间 $O(n^2)$，空间 $O(n)$（仅存原数组）。$n = 5000$ 时约 $1.25 \times 10^7$ 次比较，远在时限内。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line[0])
    let k = Int64.parse(line[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var ans = Int64(0)
    for (l in 0..n) {
        var mx = a[l]
        var mn = a[l]
        for (r in l..n) {
            let v = a[r]
            if (v > mx) {
                mx = v
            }
            if (v < mn) {
                mn = v
            }
            if (mx - mn <= k) {
                ans = ans + 1
            }
        }
    }
    println(ans)
    return 0
}
```
