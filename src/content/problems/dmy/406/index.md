---
oj: dmy
pid: '406'
title: '[R65D] 构造树'
difficulty: 普及/提高-
tags:
  - 贪心
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$0 \le d_i \le n - 1$，$0 \le c_i \le n$。保证存在至少一种合法构造。

## 思路

每个点的深度 $d_i$ 已经给定，因此树上每一层的点集是固定的，问题只在于给每个点找一个父亲，使得父亲数组 $p_1, p_2, \dots, p_n$ 的字典序最小。

先考虑单个点 $i$（深度 $d_i$）：它的父亲必须来自深度 $d_i - 1$ 的层，且父亲的儿子数不能超过上限。为了让字典序最小，点 $i$ 的父亲应当取深度 $d_i - 1$ 中**编号最小且当前儿子未满**的点。

再考虑同一层内部的顺序：父亲数组按下标从小到大比较，编号越小的点越早被比较，因此编号小的点必须优先选择编号更小的父亲。所以同一层内按编号升序依次处理即可。

实现时把所有点按「深度、编号」双关键字排序，这样同一层的点连续且按编号升序排列。逐层扫描时，用一个指针指向上一层中第一个「儿子未满」的点：每个点直接取指针指向的点做父亲并增加其儿子数，若该点已满则指针后移。指针只增不减，上一层的每个点最多被跳过一次，整个扫描是线性的。

复杂度：排序 $O(n \log n)$，分层扫描 $O(n)$；空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let d = Array<Int64>(n + 1, { _ => 0 })
    let c = Array<Int64>(n + 1, { _ => 0 })
    var maxd: Int64 = 0
    for (i in 1..=n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        d[i] = line[0]
        c[i] = line[1]
        if (line[0] > maxd) {
            maxd = line[0]
        }
    }
    // 按深度排序，深度相同按编号排序
    let order = Array<Int64>(n, { i => Int64(i + 1) })
    sort(order, by: { a: Int64, b: Int64 =>
        if (d[a] != d[b]) {
            if (d[a] < d[b]) { Ordering.LT } else { Ordering.GT }
        } else {
            if (a < b) { Ordering.LT } else { Ordering.GT }
        }
    })
    // seg[k] 为深度 k 的点在 order 中的起始下标，seg[maxd + 1] = n
    let seg = Array<Int64>(maxd + 2, { _ => 0 })
    var idx: Int64 = 0
    for (k in 0..=maxd) {
        seg[k] = idx
        while (idx < n && d[order[idx]] == k) {
            idx += 1
        }
    }
    seg[maxd + 1] = n
    let p = Array<Int64>(n + 1, { _ => 0 })
    let used = Array<Int64>(n + 1, { _ => 0 })
    // 深度 0 的点为根，父亲记为 0
    for (j in seg[0]..seg[1]) {
        p[order[j]] = 0
    }
    // 逐层处理：每个点选上一层中编号最小且儿子未满的点做父亲
    for (k in 1..=maxd) {
        var fp = seg[k - 1]
        for (j in seg[k]..seg[k + 1]) {
            let cur = order[j]
            while (used[order[fp]] >= c[order[fp]]) {
                fp += 1
            }
            p[cur] = order[fp]
            used[order[fp]] += 1
        }
    }
    for (i in 1..=n) {
        if (i > 1) {
            print(" ")
        }
        print(p[i])
    }
    println()
}
```

</details>

要点：

- 按「深度、编号」排序后，`seg[k]` 到 `seg[k + 1]` 就是第 $k$ 层所有点，层内天然按编号升序，处理顺序即字典序最优顺序。
- 候选父亲指针 `fp` 只在当前层内单调后移（每层从 `seg[k - 1]` 重新开始），跳过儿子数已达上限的点，保证每个点取到编号最小的可用父亲。
- 输出逐个 `print`、行尾 `println()` 换行，直接输出。
