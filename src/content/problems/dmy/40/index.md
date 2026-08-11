---
oj: dmy
pid: '40'
title: '[R7D] 最小极差'
difficulty: 入门
tags:
  - 双指针
  - 排序
  - 归并
timeLimit: 1s
memoryLimit: 512m
---

## 思路

每个位置 $i$ 有 $m$ 个可选值 $A_i + B_j$（$m \le 10$）。任意一个选择方案对应候选值序列上的一个窗口：窗口最小值到最大值恰好覆盖了每个位置至少一次；反过来，任何「覆盖所有位置」的窗口，从窗口内为每个位置任选一个值，其极差不超过窗口极差。因此答案等于所有覆盖窗口的最小极差。

把所有 $n \times m$ 个候选值按值排序后双指针：右端扩展直到窗口覆盖所有位置，左端收缩到不能再缩，此时窗口极差就是该右端对应的最小覆盖窗口极差，取最小值。

对 $A$ 排序后，第 $j$ 路的序列 $A_i + B_j$ 单调递增，可做 $m$ 路归并（每步线性扫描 $m$ 路取最小值），避免对 $3 \times 10^6$ 个元素整体排序。

复杂度：时间 $O(nm \log n + nm \log m)$，空间 $O(nm)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main() {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = l1[0]
    let m = l1[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    sort(a)
    let ptr = Array<Int64>(m, { _ => 0 })
    let total = n * m
    let vals = Array<Int64>(total, { _ => 0 })
    let poss = Array<Int64>(total, { _ => 0 })
    // m 路归并：第 j 路为 a[i] + b[j]（a 已排序，每路递增）
    for (t in 0..total) {
        var bi: Int64 = -1
        var bv: Int64 = 0
        for (j in 0..m) {
            if (ptr[j] < n) {
                let cv = a[ptr[j]] + b[j]
                if (bi == -1 || cv < bv) {
                    bi = j
                    bv = cv
                }
            }
        }
        vals[t] = bv
        poss[t] = ptr[bi]
        ptr[bi] += 1
    }
    // 双指针：窗口覆盖所有位置时收缩左端，记录窗口极差
    let cnt = Array<Int64>(n, { _ => 0 })
    var covered: Int64 = 0
    var l: Int64 = 0
    var ans: Int64 = 4000000000000000000
    for (r in 0..total) {
        let p = poss[r]
        if (cnt[p] == 0) {
            covered += 1
        }
        cnt[p] += 1
        while (cnt[poss[l]] > 1) {
            cnt[poss[l]] -= 1
            l += 1
        }
        if (covered == n) {
            let diff = vals[r] - vals[l]
            if (diff < ans) {
                ans = diff
            }
        }
    }
    println(ans)
}
```
