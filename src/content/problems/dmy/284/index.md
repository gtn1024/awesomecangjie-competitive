---
oj: dmy
pid: '284'
title: '[R46D]四元组'
difficulty: 提高
tags:
  - 枚举
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$4 \le n \le 2000$，$0 \le a_i \le 2000$。

## 思路

要求统计满足 $i < j < k < l$ 且 $a_i + a_j = a_k + a_l$ 的四元组个数。直接 $O(n^4)$ 枚举四元组显然超时，需要降维。

把条件 $a_i + a_j = a_k + a_l$ 看成：选定中间分割点 $k$（第三元下标），则等号左边是「前缀中某对 $(i,j)$（$i<j<k$）的和」，等号右边是「$k$ 与某个 $l>k$ 配对的和」。如果能在线性时间内维护出前缀中每种和出现了多少对，那么固定 $k$ 后只需对每个 $l>k$ 做一次 $O(1)$ 查询。

维护一个桶 $\textit{cnt2}[s]$，表示当前前缀里 $a_i + a_j = s$（$i<j<\text{当前}$）的对数。从左到右扫 $k$，对每个 $k$：

1. 枚举 $l = k+1, \dots, n-1$，把 $\textit{cnt2}[a_k + a_l]$ 累加进答案；
2. 处理完 $k$ 后，把所有以 $k$ 为右端点的新对 $(i,k)$（$i<k$）的和加入桶，为后续更大的 $k$ 服务。

初始时桶里只有 $(0,1)$ 这一对。整个扫描过程中，每对 $(i,j)$ 恰好在 $j$ 成为 $k$ 之后被加入一次，每对 $(k,l)$ 恰好被查询一次，总工作量为 $O(n^2)$。由于 $a_i \le 2000$，桶大小开 $4001$ 即可覆盖所有可能的和。

## 复杂度

时间 $O(n^2)$，空间 $O(n + \max a_i)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let nn = n
    let size = 4001
    var cnt2 = Array<Int64>(size, { _ => 0 })
    var ans: Int64 = 0

    // Invariant at the start of each iteration with index k: cnt2 holds the
    // pair-sum counts of all (i, j) with i < j < k.
    // Initialize with the only pair whose right endpoint < 2, namely (0, 1).
    cnt2[a[0] + a[1]] = 1

    var k: Int64 = 2
    while (k <= nn - 2) {
        // query every l > k
        var l: Int64 = k + 1
        while (l < nn) {
            ans += cnt2[a[k] + a[l]]
            l += 1
        }
        // promote k: pairs whose right endpoint is k now join the prefix, so that
        // for the next k the invariant (i < j < k) still holds.
        var i: Int64 = 0
        while (i < k) {
            cnt2[a[i] + a[k]] += 1
            i += 1
        }
        k += 1
    }

    println(ans.toString())
    return 0
}
```
