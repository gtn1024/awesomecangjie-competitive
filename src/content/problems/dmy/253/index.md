---
oj: dmy
pid: '253'
title: '[R41D]和一位'
difficulty: 提高
tags:
  - 排序
  - 双指针
  - 二分
timeLimit: 1s
memoryLimit: 512m
---

## 题目

称数对 $(x,y)$ 为 **和一位数对**，当且仅当 $0\le |x+y|\le 9$，即 $-9\le x+y\le 9$。称数组 $a$ 为 **和一位数组**，当且仅当对任意 $i\neq j$ 都有 $(a_i,a_j)$ 是和一位数对。给定长度为 $n$ 的数组 $b$，求使 $b$ 变为和一位数组所需删去的最少元素数量。

> 对于 $100\%$ 的数据，$1\le n\le 5\times 10^5$，$-10^9\le b_i\le 10^9$。

## 思路

把保留集合记为 $S$。由对称性，条件等价于 $S$ 中 **任意两元素之和** 都落在 $[-9,9]$。

先看一个关键事实：若 $x,y\le -5$，则 $x+y\le -10<-9$，必然不合法；若 $x,y\ge 5$，则 $x+y\ge 10>9$，也不合法。因此：

- 值落在 $[-4,4]$ 内的元素相互之间永远合法（两数之和最小为 $-8$、最大为 $8$），称这些为 **核心值**，全部保留。
- 保留集合中至多含一个 $\le -5$ 的值（记候选为负极端 $L$）。
- 保留集合中至多含一个 $\ge 5$ 的值（记候选为正极端 $R$）。

于是最优保留集合只可能有四种结构：

1. **仅核心值**：直接取 $[-4,4]$ 的全部元素。
2. **核心 + 一个负极端 $L$**：需 $L$ 与每个保留的核心值 $c$ 都满足 $-9\le L+c\le 9$。由于 $L\le -5$，$L+c\le 9$ 恒成立，只需 $L+c\ge -9$，即 $c\ge -9-L$。故核心保留范围是 $[\,-9-L,\ 4\,]$（裁剪到 $[-4,4]$）。
3. **核心 + 一个正极端 $R$**：对称地，核心保留范围是 $[\,-4,\ 9-R\,]$。
4. **核心 + 一负极端 $L$ + 一正极端 $R$**：除上述两条核心范围限制外，还需 $|L+R|\le 9$。此时核心保留范围是 $[\,-9-L,\ 9-R\,]$。

为快速回答「核心值落在某区间内的个数」，对核心值在 $[-4,4]$ 这 9 个整数值上做计数，并预处理前缀和，使每次询问变为 $O(1)$。

对四种结构分别取最大值即可。对于结构 4，将负极端、正极端分别去重并排序；按 $L$ 从大到小枚举（$L$ 越接近 $-5$，核心下界 $-9-L$ 越靠左，保留的核心越多），对每个 $L$ 在升序的正极端数组上二分找落在合法窗口 $[\,\max(5,-9-L),\ 9-L\,]$ 内的最小 $R$（$R$ 越接近 $5$，核心上界 $9-R$ 越靠右，保留的核心越多）。

## 复杂度

- 时间复杂度：排序 $O(n\log n)$，前缀和 $O(1)$，结构 1–3 共 $O(n)$，结构 4 为 $O(d_{\text{neg}}\log d_{\text{pos}})$，其中 $d$ 为去重后极端值个数，不超过 $n$。总计 $O(n\log n)$。
- 空间复杂度：$O(n)$ 存输入与极端值列表。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*
import std.sort.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(b)
    // 核心值落在 [-4,4]：任意两元素和落在 [-8,8]，必相互兼容，全部保留。
    // 至多保留一个 ≤ -5 的值（两个其和 ≤ -10 必越界），至多保留一个 ≥ 5 的值。
    // 分类与去重后枚举：仅核心；核心 + 一个负极端；核心 + 一个正极端；核心 + 一负一正（需 |L+R| ≤ 9）。
    var core = Array<Int64>(9, { _ => 0 }) // core[i] 对应值 i - 4
    var negExtreme = ArrayList<Int64>([]) // 所有 ≤ -5 的值
    var posExtreme = ArrayList<Int64>([]) // 所有 ≥ 5 的值
    for (x in b) {
        if (x >= -4 && x <= 4) {
            core[Int64(x + 4)] += 1
        } else if (x <= -5) {
            negExtreme.add(x)
        } else {
            posExtreme.add(x)
        }
    }
    // 核心前缀和 P[i] = core[0]+...+core[i]
    let P = Array<Int64>(9, { _ => 0 })
    var s: Int64 = 0
    for (i in 0..9) {
        s += core[i]
        P[i] = s
    }
    // sumcnt(a,b)：核心值落在 [a,b]（裁剪到 [-4,4]）的元素个数
    let sumcnt = { a0: Int64, b0: Int64 =>
        var aa = a0
        var bb = b0
        if (aa < -4) { aa = -4 }
        if (aa > 4) { aa = 4 }
        if (bb < -4) { bb = -4 }
        if (bb > 4) { bb = 4 }
        var r: Int64 = 0
        if (aa <= bb) {
            let ia = aa + 4
            let ib = bb + 4
            r = P[Int64(ib)] - (if (ia - 1 >= 0) { P[Int64(ia - 1)] } else { 0 })
        }
        r
    }
    var best: Int64 = 1
    let onlyCore = sumcnt(-4, 4)
    if (onlyCore > best) { best = onlyCore }
    sort(negExtreme)
    sort(posExtreme)
    let negCnt = negExtreme.size
    let posCnt = posExtreme.size
    // 负极端去重（升序），枚举「核心 + 一个 L」
    var prevL: Int64 = -1000000000000
    for (k in 0..negCnt) {
        let L = negExtreme[k]
        if (L == prevL) { continue }
        prevL = L
        let size = 1 + sumcnt(-9 - L, 4)
        if (size > best) { best = size }
    }
    // 正极端去重（升序），枚举「核心 + 一个 R」
    var prevR: Int64 = -1000000000000
    for (k in 0..posCnt) {
        let R = posExtreme[k]
        if (R == prevR) { continue }
        prevR = R
        let size = 1 + sumcnt(-4, 9 - R)
        if (size > best) { best = size }
    }
    // 「核心 + 一负一正」：枚举去重 L（升序），对每个 L 在升序 posExtreme 中二分找
    // 落在 [max(5, -9-L), 9-L] 的最小 R。L 越大（接近 -5）保留核心越多，故从大到小枚举
    // 并维护 best；当 L 过小、即便取到最大可能核心也无法超越 best 时停止。
    var prevL2: Int64 = -1000000000000
    var k2 = negCnt - 1
    while (k2 >= 0) {
        let L = negExtreme[k2]
        k2 -= 1
        if (L == prevL2) { continue }
        prevL2 = L
        // R 的合法窗口 [rlo, rhi]，且 R ≥ 5
        var rlo = -9 - L
        if (rlo < 5) { rlo = 5 }
        let rhi = 9 - L
        if (rlo > rhi) { continue }
        if (rhi < 5) { continue }
        // 二分：在升序 posExtreme 中找第一个 ≥ rlo 的下标
        var lo = 0
        var hi = posCnt
        while (lo < hi) {
            let mid = (lo + hi) >> 1
            if (posExtreme[mid] < rlo) {
                lo = mid + 1
            } else {
                hi = mid
            }
        }
        if (lo < posCnt && posExtreme[lo] <= rhi) {
            let R = posExtreme[lo]
            let size = 2 + sumcnt(-9 - L, 9 - R)
            if (size > best) { best = size }
        }
    }
    println(nn - best)
}
```

</details>
