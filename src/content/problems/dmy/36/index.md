---
oj: dmy
pid: '36'
title: '[R6F] 异或问题'
difficulty: 入门
tags:
  - 字典树
  - 计数
timeLimit: 2s
memoryLimit: 512m
---

## 思路

$\text{popcount}(A_i) \le 30$，按 $A_j$ 的 popcount 把后缀值分层维护：为每个 $p \in [0, 30]$ 建一棵 01 字典树，只插入 $\text{popcount}(A_j) = p$ 的值。

从右往左扫描 $i$，扫描到位置 $i$ 时，第 $p$ 棵字典树里恰好是「$j \ge i$ 且 $\text{popcount}(A_j) = p$」的所有 $A_j$。对 $p \ge \text{popcount}(A_i)$ 的每棵树查询「$A_i \oplus x > X$ 的 $x$ 个数」，累加到 $ans[i]$；然后把 $A_i$ 插入第 $\text{popcount}(A_i)$ 棵树。

字典树查询按位比较：从高位到低位，若 $X$ 当前位为 $0$，则 $A_i \oplus x$ 当前位为 $1$ 的分支全部满足（子树计数直接计入答案），继续沿与 $X$ 相同位的分支走。

复杂度：时间 $O(n \log^2 V)$（$V = \max A_i$，实际每轮查询可在无值时提前结束），空间 $O(n \log V)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

const MAXBIT: Int64 = 30

func popcount(x: Int64): Int64 {
    var v = x
    var c: Int64 = 0
    while (v > 0) {
        c += v & 1
        v >>= 1
    }
    c
}

func trieInsert(ch0: Array<Int64>, ch1: Array<Int64>, cnt: Array<Int64>, nodeCnt: Int64, v: Int64): Int64 {
    var nc = nodeCnt
    var node: Int64 = 1
    var b: Int64 = MAXBIT - 1
    while (b >= 0) {
        let bit = (v >> b) & 1
        var nxt: Int64 = 0
        if (bit == 0) {
            nxt = ch0[node]
        } else {
            nxt = ch1[node]
        }
        if (nxt == 0) {
            nxt = nc + 1
            if (bit == 0) {
                ch0[node] = nxt
            } else {
                ch1[node] = nxt
            }
            nc += 1
        }
        node = nxt
        cnt[node] += 1
        b -= 1
    }
    nc
}

func trieQuery(ch0: Array<Int64>, ch1: Array<Int64>, cnt: Array<Int64>, v: Int64, x: Int64): Int64 {
    var node: Int64 = 1
    var res: Int64 = 0
    var b: Int64 = MAXBIT - 1
    while (b >= 0) {
        let vb = (v >> b) & 1
        let xb = (x >> b) & 1
        if (xb == 0) {
            if (vb == 0) {
                res += cnt[ch1[node]]
            } else {
                res += cnt[ch0[node]]
            }
        }
        if (vb == xb) {
            node = ch0[node]
        } else {
            node = ch1[node]
        }
        if (node == 0) {
            break
        }
        b -= 1
    }
    res
}

main() {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = l1[0]
    let x = l1[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let pcArr = Array<Int64>(n, { i => popcount(a[i]) })
    let cntPc = Array<Int64>(31, { _ => 0 })
    for (p in pcArr) {
        cntPc[p] += 1
    }
    let ch0 = Array<Array<Int64>>(31, { p => Array<Int64>(cntPc[p] * 30 + 16, { _ => 0 }) })
    let ch1 = Array<Array<Int64>>(31, { p => Array<Int64>(cntPc[p] * 30 + 16, { _ => 0 }) })
    let cnt = Array<Array<Int64>>(31, { p => Array<Int64>(cntPc[p] * 30 + 16, { _ => 0 }) })
    let nodeCnt = Array<Int64>(31, { _ => 1 })
    let ans = Array<Int64>(n, { _ => 0 })
    var i = n - 1
    while (i >= 0) {
        let v = a[i]
        let pi = pcArr[i]
        var p2 = pi
        while (p2 < 31) {
            if (cntPc[p2] > 0) {
                ans[i] += trieQuery(ch0[p2], ch1[p2], cnt[p2], v, x)
            }
            p2 += 1
        }
        nodeCnt[pi] = trieInsert(ch0[pi], ch1[pi], cnt[pi], nodeCnt[pi], v)
        i -= 1
    }
    for (i in 0..n) {
        print(ans[i])
        if (i < n - 1) {
            print(" ")
        }
    }
    println()
}
```

</details>
