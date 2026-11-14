---
oj: dmy
pid: '567'
title: '心愿清单'
difficulty: 提高
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le M \le N \le 5000$，$1 \le A_i, C_i \le 10^9$，$1 \le X_1 < X_2 < \cdots < X_M \le N$。

## 思路

**购买时的名次。** 设最终实际购买的商品集合为 $S \supseteq X$。商品 $i$ 被买走的那一刻，它的名次是「编号不超过 $i$ 且尚未售出的商品数」，即

$$\text{rank}(i) = i - \#\{k < i : k \in S,\ k \text{ 比 } i \text{ 先被买走}\}.$$

关键的一点是：**编号大于 $i$ 的商品无论是否已被买走，都不影响 $i$ 的名次**。它们在排序中排在 $i$ 后面，被移除也不会改变 $i$ 前面还剩几件。所以每件商品的名次只由它自身编号与更小编号商品的购买情况决定。

**名次的可选范围。** 记 $U_i$ 为编号小于 $i$、且最终没买的商品数，$s_i = \#\{k < i : k \in S\}$，$a_i$ 为 $S$ 中编号比 $i$ 小、却在 $i$ 之后才买走的商品数。则

$$\text{rank}(i) = U_i + 1 + a_i, \qquad 0 \le a_i \le s_i .$$

$U_i + 1$ 由 $S$ 唯一确定，$a_i$ 是唯一可以挑选的自由度。把购买顺序看成 $S$ 上的一个排列，向量 $a$ 就是这个排列的逆序表：按编号从小到大依次把商品插进当前序列，插入时让恰好 $a_i$ 件已插入（因而更小编号）的商品排在它右边。插入位置与最终排列一一对应，所以 $a_i$ 可以在 $[0, s_i]$ 中任意取值，且**各商品的 $a_i$ 互不影响**。

于是，若在处理第 $i$ 件时，前 $i-1$ 件里已经买走了 $j$ 件，就有 $U_i + 1 = i - j$、$s_i = (i-1)-j$，因此

$$\text{rank}(i) \in [\,i - j,\ i\,],$$

区间内每个值都可达，且与其它商品的取值无关。买下 $i$ 的最优附加费于是是 $\min_{r \in [i-j,\ i]} C_r$。

**状态与转移。** $dp[j]$ 表示处理完前 $i-1$ 件、其中买了 $j$ 件时的最小花费。对第 $i$ 件：

- 买：$nd[j+1] \leftarrow \min(nd[j+1],\ dp[j] + A_i + \min_{r=i-j}^{i} C_r)$；
- 不买：仅当 $i \notin X$ 时允许，$nd[j] \leftarrow \min(nd[j],\ dp[j])$。

心愿商品只允许走「买」这一支，因此结束时每个 $dp[j]$ 都已包含全部心愿商品，答案是 $\min_j dp[j]$。每件商品至多买一次，必须用两个数组交替转移，不能原地更新同一份 $dp$。

**实现与边界。** 枚举 $j$ 递增时，$\min_{r=i-j}^{i} C_r$ 只需随 $j$ 向左一格一格扩展，用滚动最小值维护即可，不必预存二维区间最小值表。花费上界约为 $5000 \times (10^9 + 10^9) = 10^{13}$，用 64 位整数不会溢出；不可达状态用一个足够大的哨兵值标记。当 $M = N$ 时全部商品都要买，答案退化为 $\sum A_i + \sum_i \min_{r \le i} C_r$，可用来对照检查。

## 复杂度

时间 $O(N^2)$，共约 $1.25 \times 10^7$ 次转移；空间 $O(N)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let xs = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let want = Array<Bool>(n + 1, { _ => false })
    for (x in xs) {
        want[x] = true
    }
    let INF: Int64 = 4000000000000000000
    var dp = Array<Int64>(n + 2, { _ => INF })
    var nd = Array<Int64>(n + 2, { _ => INF })
    dp[0] = 0
    for (i in 1..=n) {
        for (t in 0..=n) {
            nd[t] = INF
        }
        var curmin = c[i - 1]
        for (j in 0..i) {
            if (j > 0) {
                let v = c[i - j - 1]
                if (v < curmin) {
                    curmin = v
                }
            }
            let v = dp[j]
            if (v < INF) {
                let cand = v + a[i - 1] + curmin
                if (cand < nd[j + 1]) {
                    nd[j + 1] = cand
                }
                if (!want[i] && v < nd[j]) {
                    nd[j] = v
                }
            }
        }
        let tmp = dp
        dp = nd
        nd = tmp
    }
    var ans = INF
    for (j in 0..=n) {
        if (dp[j] < ans) {
            ans = dp[j]
        }
    }
    println(ans)
}
```

</details>
