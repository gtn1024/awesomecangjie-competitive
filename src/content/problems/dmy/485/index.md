---
oj: dmy
pid: '485'
title: '[R78E] 递增'
difficulty: 提高
tags:
  - 动态规划
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 500$，$-10^9 \le a_i \le 10^9$。

## 思路

一个直观的贪心是：从左往右，每段取「极差刚好大于上一段极差的最短前缀」。它是错的。反例 $a=[6,6,2,0,4,5,1,1,6]$：贪心得到 $[6],[6,2],[0,4,5,1,1,6]$ 共 $3$ 段（极差 $0,4,6$），但 $[6,6],[2,0],[4,5,1],[1,6]$ 的极差为 $0,2,4,5$，共 $4$ 段。最短切法会把后面本可组成小极差段的元素「错相」，导致后续段被迫吞下过大极差，段数反而变少，需要 DP。

设段 $[l,r]$ 的极差为 $w(l,r)=\max a_{l..r}-\min a_{l..r}$。对每个位置 $i$，考虑前缀 $a_{1..i}$ 的所有合法划分，每个划分只保留两个信息：段数 $c$ 与最后一段的极差 $r$。状态 $(c_1,r_1)$ 被 $(c_2,r_2)$ **支配**（当 $c_1\le c_2$ 且 $r_1\ge r_2$）：任何能接在 $(c_1,r_1)$ 后面的段（极差要大于 $r_1$，自然也大于 $r_2$）都能接在 $(c_2,r_2)$ 后面，且后者段数不少，所以被支配的状态可以丢弃。于是每个 $i$ 只需维护一条 Pareto 前沿：按 $r$ 递增排列、$c$ 也严格递增的状态序列。

转移：枚举最后一段的起点 $j$（$1\le j\le i$），最后一段为 $a_{j..i}$，极差 $R=w(j,i)$。在前缀 $j-1$ 的前沿中查询所有 $r<R$ 的状态里最大的 $c$，产生候选状态 $(R,\,c+1)$。$j=1$ 时视作接在虚拟状态 $(c=0,r=-1)$ 之后，即整个前缀单独成段。

实现上从 $j=i$ 开始向左扫，顺带维护 $a_{j..i}$ 的最小值与最大值即可 $O(1)$ 得到每个 $R$；且 $j$ 减小时 $R$ 单调不减，候选状态天然按 $R$ 升序产生。前沿中 $r$ 升序、$c$ 严格升序，查询「$r<R$ 的最大 $c$」用二分查找；合并候选时顺序扫描，只保留 $c$ 严格大于此前所有候选的状态，即得位置 $i$ 的前沿。

答案即位置 $n$ 的前沿中最大的 $c$（序列末尾元素）。

## 复杂度

前沿长度不超过最大段数 $k$：严格递增的非负整数极差至少为 $0,1,\dots,k-1$，极差为 $0$ 的段至少 $1$ 个元素，其余段至少 $2$ 个，故 $k\le\lfloor(n+1)/2\rfloor$。

每个位置枚举 $j$ 共 $O(n)$ 次转移，每次二分查询 $O(\log n)$，合并候选 $O(n)$，总时间 $O(n^2\log n)$；保存所有位置的前沿，空间 $O(nk)=O(n^2)$。$n\le 500$ 下非常宽裕。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = n
    let frR = Array<ArrayList<Int64>>(nn, { _ => ArrayList<Int64>() })
    let frC = Array<ArrayList<Int64>>(nn, { _ => ArrayList<Int64>() })
    var i: Int64 = 0
    while (i < n) {
        let candR = ArrayList<Int64>()
        let candC = ArrayList<Int64>()
        var mn = a[i]
        var mx = a[i]
        var j = i
        while (j >= 0) {
            if (a[j] < mn) {
                mn = a[j]
            }
            if (a[j] > mx) {
                mx = a[j]
            }
            let r = mx - mn
            var bestc: Int64 = -1
            if (j == 0) {
                bestc = 0
            } else {
                let rs = frR[j - 1]
                let cs = frC[j - 1]
                var lo: Int64 = 0
                var hi = rs.size - 1
                var idx: Int64 = -1
                while (lo <= hi) {
                    let mid = (lo + hi) / 2
                    if (rs[mid] < r) {
                        idx = mid
                        lo = mid + 1
                    } else {
                        hi = mid - 1
                    }
                }
                if (idx >= 0) {
                    bestc = cs[idx]
                }
            }
            if (bestc >= 0) {
                candR.add(r)
                candC.add(bestc + 1)
            }
            j -= 1
        }
        let R2 = ArrayList<Int64>()
        let C2 = ArrayList<Int64>()
        var maxc: Int64 = 0
        var k: Int64 = 0
        while (k < candR.size) {
            let c = candC[k]
            if (c > maxc) {
                R2.add(candR[k])
                C2.add(c)
                maxc = c
            }
            k += 1
        }
        frR[i] = R2
        frC[i] = C2
        i += 1
    }
    let last = frC[n - 1]
    println(last[last.size - 1])
}
```
