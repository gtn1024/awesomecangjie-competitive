---
oj: dmy
pid: '106'
title: '[R18D]联想'
difficulty: 提高
tags:
  - 离线
  - 排序
  - 链表
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1\leq n,q\leq 10^5$，$1\leq a_i,x_i\leq 10^9$。

## 思路

题目要求按顺序完成 $n$ 道题。对于第 $i$ 道题，可以花 $a_i$ 直接做，也可以从某道已完成的前置题 $j<i$ 联想：若 $|a_j-a_i|\leq x$，则花费 $|a_j-a_i|$。

因为按顺序做题，处理到第 $i$ 道题时所有 $j<i$ 均已完成，所以联想的来源不受「如何完成」限制，只受下标限制。于是对固定的 $i$ 与联想能力 $x$：

- 若存在 $j<i$ 使 $|a_j-a_i|\leq x$，则联想代价为这些 $|a_j-a_i|$ 的最小值；
- 否则只能直接做，代价为 $a_i$。

记 $\text{mind}_i=\min_{j<i}|a_j-a_i|$ 为第 $i$ 道题到所有前置题的最小代价差（$i=1$ 时无前置题，只能直接做）。注意联想不一定更优：当 $\text{mind}_i>a_i$ 时直接做反而更省。因此第 $i$ 道题的贡献为

$$
\text{cost}_i=\begin{cases}\min(a_i,\text{mind}_i), & \text{mind}_i\leq x\\ a_i, & \text{mind}_i>x\end{cases}
$$

第 $1$ 道题恒为直接做，取 $\text{mind}_1=a_1$ 即可让上式自然成立。

### 计算 $\text{mind}_i$

朴素做法是边插入边维护一个有序集合，每次查询 $a_i$ 的前驱后继。但本题数据范围 $n\leq 10^5$，需要 $O(n\log n)$。

采用经典的 **排序 + 双向链表倒序删除** 技巧：

1. 把所有 $a_i$ 按值升序排序，得到值序位置 $\text{pos}_i$；在值序上构建双向链表（`prev`/`next` 数组）。
2. 按**原下标 $i$ 从大到小**遍历。处理 $i$ 时，链表中尚未被删除的元素恰好是 $\{a_0,a_1,\dots,a_i\}$，其中 $\text{pos}_i$ 在链表里的前驱和后继（不含自身）就落在 $\{a_0,\dots,a_{i-1}\}$ 中，且正是值域上离 $a_i$ 最近的两个元素，所以 $\text{mind}_i$ 即为二者与 $a_i$ 之差的较小者。
3. 查询完后把 $\text{pos}_i$ 从链表中删除（$O(1)$ 改指针），继续处理 $i-1$。

### 离线处理询问

令 $\text{save}_i=\min(a_i,\text{mind}_i)$。对所有 $i$ 按 $\text{mind}_i$ 升序排序，维护 $\text{save}$ 与 $a$ 的前缀和。记 $S_A=\sum a_i$。

对每个询问 $x$，二分找出 $\text{mind}_i\leq x$ 的元素集合（前 $\text{cnt}$ 个），则

$$
\text{ans}=\sum_{\text{active}}\text{save}_i+\sum_{\text{inactive}}a_i
=\text{pSave}[\text{cnt}]+(S_A-\text{pA}[\text{cnt}])
$$

## 复杂度

- 时间：排序 $O(n\log n)$，链表删除 $O(n)$，每个询问二分 $O(\log n)$，共 $O((n+q)\log n)$。
- 空间：$O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main() {
    let reader = getStdIn()
    let firstLine = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(firstLine[0])
    let q = Int64.parse(firstLine[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    // 把原下标按 a 值升序排序，构建值序双向链表
    let order = Array<Int64>(n, { k: Int64 => k })
    sort(order, key: { k: Int64 => a[k] })
    let vs = Array<Int64>(n, { k: Int64 => a[order[k]] })
    let pos = Array<Int64>(n, { _ => 0 })
    for (k in 0..n) {
        pos[order[k]] = k
    }
    let prev = Array<Int64>(n, { _ => 0 })
    let next = Array<Int64>(n, { _ => 0 })
    for (k in 0..n) {
        prev[k] = k - 1
        next[k] = k + 1
    }
    next[n - 1] = -1
    prev[0] = -1
    // mind[i] = min_{j<i} |a_j - a_i|；mind[0] = a[0] 表示恒直接做
    let mind = Array<Int64>(n, { _ => 0 })
    var ii = n - 1
    while (ii >= 0) {
        let p = pos[ii]
        let ai = a[ii]
        if (ii == 0) {
            mind[ii] = ai
        } else {
            // 当前存活集合 = {a_0..a_i}，前驱后继必在 {a_0..a_{i-1}} 中
            var best = Int64(2000000005)
            let pr = prev[p]
            if (pr >= 0) {
                let d = ai - vs[pr]
                if (d < best) {
                    best = d
                }
            }
            let nx = next[p]
            if (nx >= 0) {
                let d = vs[nx] - ai
                if (d < best) {
                    best = d
                }
            }
            mind[ii] = best
        }
        // 从链表删除位置 p
        let pr = prev[p]
        let nx = next[p]
        if (pr >= 0) {
            next[pr] = nx
        }
        if (nx >= 0) {
            prev[nx] = pr
        }
        ii -= 1
    }
    // 离线回答询问：save[i] = min(a[i], mind[i])
    var SA = Int64(0)
    for (k in 0..n) {
        SA += a[k]
    }
    let save = Array<Int64>(n, { k: Int64 => if (a[k] < mind[k]) { a[k] } else { mind[k] } })
    let idx = Array<Int64>(n, { k: Int64 => k })
    sort(idx, key: { k: Int64 => mind[k] })
    let sm = Array<Int64>(n, { _ => 0 })
    let psave = Array<Int64>(n, { _ => 0 })
    let pa = Array<Int64>(n, { _ => 0 })
    for (k in 0..n) {
        let oi = idx[k]
        sm[k] = mind[oi]
        psave[k] = save[oi]
        pa[k] = a[oi]
    }
    let pSave = Array<Int64>(n + 1, { _ => 0 })
    let pA = Array<Int64>(n + 1, { _ => 0 })
    for (k in 0..n) {
        pSave[k + 1] = pSave[k] + psave[k]
        pA[k + 1] = pA[k] + pa[k]
    }
    var qi = Int64(0)
    while (qi < q) {
        let x = Int64.parse(reader.readln().getOrThrow())
        // 二分找 mind <= x 的元素个数（上界）
        var lo = Int64(0)
        var hi = n
        while (lo < hi) {
            let mid = (lo + hi) >> 1
            if (sm[mid] <= x) {
                lo = mid + 1
            } else {
                hi = mid
            }
        }
        let cnt = lo
        let ans = pSave[cnt] + (SA - pA[cnt])
        println(ans)
        qi += 1
    }
}
```
