---
oj: dmy
pid: '42'
title: '[R7F] 连续区间'
difficulty: 提高
tags:
  - 分块
  - 众数
  - 离线
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 10^5$，$1 \le A_i \le n$，$1 \le L_i \le R_i \le n$。

## 思路

要让 $[L,R]$ 成为连续区间，未被修改的元素 $A_i,A_j$（$L \le i < j \le R$）必须满足 $A_j - A_i = j - i$，即 $A_j - j = A_i - i$。所以不修改的元素 $A_i - i$ 取值相同。令 $B_i = A_i - i$，则 $f(L,R) = (R-L+1) - \{B_L,\dots,B_R\}$ 中众数的出现次数。问题归约为静态区间众数出现次数。

采用分块。设块长为 $S \approx \sqrt n$，块数为 $nb$。预处理：

- $h[i][j]$：第 $i \sim j$ 块这一段的众数频次。对每个起点块 $i$，右端点向右扫，累加计数并维护当前众数频次。
- 对每个离散值 $v$，保存它在原数组中所有出现位置（已有序）。

回答询问 $[L,R]$（记左端块 $bl$，右端块 $br$）：若同块直接暴力统计；否则答案为「中间整块 $[bl+1,br-1]$ 的众数频次」与「左右散块中每个出现过的值 $v$ 在 $[L,R]$ 中的总出现次数」取最大。散块去重用时间戳数组而非哈希表以减小常数；$v$ 在区间内的次数用位置数组上二分（upper - lower）得到。

复杂度：时间 $O(n \cdot nb + m \cdot S \log n) = O(n\sqrt n + m\sqrt n \log n)$，空间 $O(n + nb^2)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*
import std.collection.*

main(): Int64 {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = l1[0]
    let m = l1[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let b = Array<Int64>(n, { i => a[i] - i - 1 })
    var bsz: Int64 = 1
    while ((bsz + 1) * (bsz + 1) <= n) {
        bsz += 1
    }
    if (bsz < 1) {
        bsz = 1
    }
    let B = bsz
    let nb = (n + B - 1) / B
    // 离散化 B
    let sb = Array<Int64>(n, { i => b[i] })
    sort(sb)
    var uid: Int64 = 0
    let idmap = HashMap<Int64, Int64>()
    for (i in 0..n) {
        if (i == 0 || sb[i] != sb[i - 1]) {
            idmap[sb[i]] = uid
            uid += 1
        }
    }
    let K = uid
    let bid = Array<Int64>(n, { i => idmap.get(b[i]).getOrThrow() })
    let pos = ArrayList<ArrayList<Int64>>(K, { _ => ArrayList<Int64>() })
    for (i in 0..n) {
        pos[bid[i]].add(i)
    }
    let blk = Array<Int64>(n, { i => i / B })
    let nbI = Int64(nb)
    let h = Array<Array<Int64>>(nbI, { _ => Array<Int64>(nbI, { _ => 0 }) })
    for (i in 0..nb) {
        var cnt = Array<Int64>(K, { _ => 0 })
        var mx: Int64 = 0
        for (j in i..nb) {
            let lo = j * B
            let hi = if (((j + 1) * B) < n) { (j + 1) * B } else { n }
            for (x in lo..hi) {
                let c = bid[x]
                cnt[c] += 1
                if (cnt[c] > mx) {
                    mx = cnt[c]
                }
            }
            h[i][j] = mx
        }
    }
    func lower(arr: ArrayList<Int64>, v: Int64): Int64 {
        var l: Int64 = 0
        var r: Int64 = arr.size
        while (l < r) {
            let mid = (l + r) / 2
            if (arr[mid] < v) {
                l = mid + 1
            } else {
                r = mid
            }
        }
        return l
    }
    func upper(arr: ArrayList<Int64>, v: Int64): Int64 {
        var l: Int64 = 0
        var r: Int64 = arr.size
        while (l < r) {
            let mid = (l + r) / 2
            if (arr[mid] <= v) {
                l = mid + 1
            } else {
                r = mid
            }
        }
        return l
    }
    let seenStamp = Array<Int64>(K, { _ => -1 })
    let curCnt = Array<Int64>(K, { _ => 0 })
    var stamp: Int64 = 0
    for (_ in 0..m) {
        let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let L = lr[0] - 1
        let R = lr[1] - 1
        let bl = blk[L]
        let br = blk[R]
        var ans: Int64 = 0
        if (bl == br) {
            stamp += 1
            for (x in L..=R) {
                let c = bid[x]
                if (seenStamp[c] != stamp) {
                    seenStamp[c] = stamp
                    curCnt[c] = 1
                } else {
                    curCnt[c] += 1
                }
                if (curCnt[c] > ans) {
                    ans = curCnt[c]
                }
            }
        } else {
            let lp = bl + 1
            let rp = br - 1
            var base: Int64 = 0
            if (lp <= rp) {
                base = h[lp][rp]
            }
            ans = base
            stamp += 1
            let lrEnd = (bl + 1) * B - 1
            for (x in L..=lrEnd) {
                let c = bid[x]
                if (seenStamp[c] != stamp) {
                    seenStamp[c] = stamp
                    let arr = pos[c]
                    let tot = upper(arr, R) - lower(arr, L)
                    if (tot > ans) {
                        ans = tot
                    }
                }
            }
            let rl = br * B
            for (x in rl..=R) {
                let c = bid[x]
                if (seenStamp[c] != stamp) {
                    seenStamp[c] = stamp
                    let arr = pos[c]
                    let tot = upper(arr, R) - lower(arr, L)
                    if (tot > ans) {
                        ans = tot
                    }
                }
            }
        }
        let res = (R - L + 1) - ans
        println(res)
    }
    return 0
}
```

要点：

- 转化为 $B_i = A_i - i$ 的静态区间众数频次问题，是经典分块场景。
- 散块去重用时间戳数组代替哈希集合，常数更小，是把 $O(n\sqrt n)$ 跑进时限的关键。
