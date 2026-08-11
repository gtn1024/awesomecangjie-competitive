---
oj: dmy
pid: '30'
title: '[R5F] 知识点复习'
difficulty: 入门
tags:
  - 二分
  - 折半枚举
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

## 思路

若已确定复习哪些知识点，最优复习顺序是 $c_i$ 从大到小：交换相邻两项 $i, j$（$i$ 在前）会使总时间改变 $c_j - c_i$，因此 $c_i \ge c_j$ 时总时间最小。先把所有知识点按 $c_i$ 降序排序，则任意被选集合的最优顺序就是该集合在排序后的相对顺序，第 $k$ 个被选知识点的名次就是 $k$。

$n \le 40$，用折半枚举：前 $\lfloor n/2 \rfloor$ 个与后 $n - \lfloor n/2 \rfloor$ 个各枚举 $2^{\lfloor n/2 \rfloor}$ 个子集。

- 前半子集记录（选择个数、时间、价值），按个数分组，每组内按时间排序后做 Pareto 过滤（时间升序、价值严格递增），得到「时间 $\le x$ 时最大价值」的二分查询表。
- 后半子集枚举时，若选了 $i$ 个，则前半还需补 $m - i$ 个；后半每个知识点的名次都会后移 $m - i$ 位，时间增加 $(m - i) \times \sum c$（后半已选知识点的 $c$ 之和）。用剩余预算在前半表 $[m-i]$ 中二分查找最大价值即可。

复杂度：时间 $O(n 2^{n/2})$，空间 $O(2^{n/2})$。

## 仓颉实现

```cangjie
import std.collection.*
import std.convert.*
import std.env.*
import std.sort.*

class P <: Comparable<P> {
    let tm: Int64
    let vl: Int64
    init(tm: Int64, vl: Int64) {
        this.tm = tm
        this.vl = vl
    }
    public func compare(that: P): Ordering {
        if (tm < that.tm) {
            return Ordering.LT
        } else if (tm > that.tm) {
            return Ordering.GT
        } else {
            return Ordering.EQ
        }
    }
}

func dfs2(items: Array<Int64>, a: Array<Int64>, b: Array<Int64>, c: Array<Int64>,
          pT: Array<Array<Int64>>, pV: Array<Array<Int64>>, t: Int64, m: Int64, s1: Int64,
          idx: Int64, cnt: Int64, tm: Int64, val: Int64, sumc: Int64): Int64 {
    if (idx == Int64(items.size)) {
        let need = m - cnt
        if (need < 0 || need > s1) {
            return -1
        }
        let budget = t - tm - need * sumc
        if (budget < 0) {
            return -1
        }
        let arr = pT[need]
        let sz = arr.size
        if (budget >= arr[sz - 1]) {
            return val + pV[need][sz - 1]
        }
        if (budget < arr[0]) {
            return -1
        }
        var lo: Int64 = 0
        var hi: Int64 = sz
        while (lo < hi) {
            let mid = (lo + hi) >> 1
            if (arr[mid] <= budget) {
                lo = mid + 1
            } else {
                hi = mid
            }
        }
        return val + pV[need][lo - 1]
    }
    var best = dfs2(items, a, b, c, pT, pV, t, m, s1, idx + 1, cnt, tm, val, sumc)
    let it = items[idx]
    let ntm = tm + b[it] + (cnt + 1) * c[it]
    if (ntm <= t) {
        let r = dfs2(items, a, b, c, pT, pV, t, m, s1, idx + 1, cnt + 1, ntm, val + a[it], sumc + c[it])
        if (r > best) {
            best = r
        }
    }
    best
}

main() {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = l1[0]
    let m = l1[1]
    let t = l1[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let idx = Array<Int64>(n, { i => i })
    sort(idx, key: { i => c[i] }, descending: true)
    let s1 = n / 2
    let s2 = n - s1
    let items1 = Array<Int64>(s1, { i => idx[i] })
    let items2 = Array<Int64>(s2, { i => idx[s1 + i] })
    let bitPos = Array<Int64>(1 << 20, { _ => 0 })
    for (bb in 0..20) {
        bitPos[Int64(1) << bb] = bb
    }
    // 前半：DP 枚举子集（新加入项名次为 cnt+1，原项名次整体后移一位）
    let S1 = Int64(1) << s1
    let cnt1 = Array<Int64>(S1, { _ => 0 })
    let tm1 = Array<Int64>(S1, { _ => 0 })
    let val1 = Array<Int64>(S1, { _ => 0 })
    let sumc1 = Array<Int64>(S1, { _ => 0 })
    for (mask in 1..S1) {
        let lb = mask & (-mask)
        let bi = bitPos[lb]
        let prev = mask ^ lb
        let it = items1[bi]
        cnt1[mask] = cnt1[prev] + 1
        val1[mask] = val1[prev] + a[it]
        sumc1[mask] = sumc1[prev] + c[it]
        tm1[mask] = tm1[prev] + sumc1[prev] + b[it] + c[it]
    }
    let freq = Array<Int64>(s1 + 1, { _ => 0 })
    for (mask in 0..S1) {
        freq[cnt1[mask]] += 1
    }
    let rawT = Array<Array<Int64>>(s1 + 1, { _ => Array<Int64>(0, { _ => 0 }) })
    let rawV = Array<Array<Int64>>(s1 + 1, { _ => Array<Int64>(0, { _ => 0 }) })
    let fill = Array<Int64>(s1 + 1, { _ => 0 })
    for (k in 0..(s1 + 1)) {
        rawT[k] = Array<Int64>(freq[k], { _ => 0 })
        rawV[k] = Array<Int64>(freq[k], { _ => 0 })
    }
    for (mask in 0..S1) {
        let k = cnt1[mask]
        let p = fill[k]
        rawT[k][p] = tm1[mask]
        rawV[k][p] = val1[mask]
        fill[k] = p + 1
    }
    // 每组按时间排序后做 Pareto 过滤（时间升序、价值严格递增）
    let pT = Array<Array<Int64>>(s1 + 1, { _ => Array<Int64>(0, { _ => 0 }) })
    let pV = Array<Array<Int64>>(s1 + 1, { _ => Array<Int64>(0, { _ => 0 }) })
    for (k in 0..(s1 + 1)) {
        let sz = freq[k]
        let arr = Array<P>(sz, { i => P(rawT[k][i], rawV[k][i]) })
        sort(arr)
        let tt = ArrayList<Int64>()
        let vv = ArrayList<Int64>()
        var best: Int64 = -1
        for (p in 0..sz) {
            if (arr[p].vl > best) {
                best = arr[p].vl
                tt.add(arr[p].tm)
                vv.add(arr[p].vl)
            }
        }
        pT[k] = Array<Int64>(tt.size, { i => tt[i] })
        pV[k] = Array<Int64>(vv.size, { i => vv[i] })
    }
    // 后半：DFS 枚举子集并直接查询前半表
    println(dfs2(items2, a, b, c, pT, pV, t, m, s1, 0, 0, 0, 0, 0))
}
```
