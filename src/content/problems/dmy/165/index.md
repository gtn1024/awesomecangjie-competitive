---
oj: dmy
pid: '165'
title: '[R27E]数字操作'
difficulty: 普及
tags:
  - BFS
  - 最短路
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定初始整数 $A$、$D$ 与参数 $B, C, P$，每次操作可把某个数 $x$ 变为 $(x + B) \bmod P$ 或 $(x \times C) \bmod P$。对 $A$ 的第 $i$ 次操作代价为 $2^{i-1}$，对 $D$ 同理独立计费。求让 $A$ 与 $D$ 相等的最小总代价，答案对 $998244353$ 取模；无法相等输出 `-1`。

> 数据规模：$0 \le A, D, B, C < P$，$2 \le P \le 10^6$。

## 思路

先看代价结构：对一个数执行 $k$ 次操作（不论种类与顺序），总代价为 $1 + 2 + \dots + 2^{k-1} = 2^k - 1$。因此方案只需关心**操作次数**：若 $A$ 用 $k_A$ 次、$D$ 用 $k_D$ 次，总代价就是 $2^{k_A} + 2^{k_D} - 2$。由于 $2^k$ 严格递增，对同一个公共目标值 $v$，最优必然是各自用最短次数 $distA[v]$、$distD[v]$ 到达；答案即枚举所有 $v$ 取 $2^{distA[v]} + 2^{distD[v]} - 2$ 的最小值。

模 $P$ 的运算只涉及 $P$ 个状态，从 $A$（或 $D$）出发每步只有 $+B$、$\times C$ 两条边，所以分别从 $A$、$D$ 跑一遍 BFS 即可得到 $distA$、$distD$。

最后的问题是比较真实代价的大小：$2^{distA[v]} + 2^{distD[v]}$ 是指数级的，远超 64 位。把一对距离排序为 $x \le y$，则 $2^x + 2^y$ 的真实大小完全由二元组 $(y, x)$ 的字典序决定（更大的 $y$ 支配，$y$ 相同时更大的 $x$ 支配），据此比较选出最优对，最后再用预计算的 $2^i \bmod 998244353$ 表求答案即可。

无法相等即没有任何 $v$ 同时被两侧到达，输出 `-1`；$A = D$ 时 $distA[A] = distD[A] = 0$，自然得到代价 $0$。

## 复杂度

- 时间复杂度：$O(P)$，两次 BFS 各 $O(P)$ 条边。
- 空间复杂度：$O(P)$，两个距离数组与一个 $2$ 的幂表。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

// 从 start 出发 BFS，dist[v] = 达到 v 的最小操作次数（-1 表示不可达）
func bfs(start: Int64, b: Int64, c: Int64, p: Int64, dist: Array<Int64>): Unit {
    let q = Array<Int64>(p, { _ => 0 })
    var head: Int64 = 0
    var tail: Int64 = 1
    q[0] = start
    dist[start] = 0
    while (head < tail) {
        let u = q[head]
        head += 1
        let du = dist[u] + 1
        var v = (u + b) % p
        if (dist[v] == -1) {
            dist[v] = du
            q[tail] = v
            tail += 1
        }
        v = (u * c) % p
        if (dist[v] == -1) {
            dist[v] = du
            q[tail] = v
            tail += 1
        }
    }
}

main() {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let a = parts[0]
    let d = parts[1]
    let b = parts[2]
    let c = parts[3]
    let p = parts[4]
    let mod: Int64 = 998244353

    let p2 = Array<Int64>(p + 1, { _ => 0 })
    p2[0] = 1
    var i: Int64 = 1
    while (i <= p) {
        p2[i] = (p2[i - 1] * 2) % mod
        i += 1
    }

    let distA = Array<Int64>(p, { _ => -1 })
    let distD = Array<Int64>(p, { _ => -1 })
    bfs(a, b, c, p, distA)
    bfs(d, b, c, p, distD)

    // 实际代价 2^da + 2^db 严格随 (min, max) 字典序增大而增大，据此比较取最优
    var bx: Int64 = -1
    var by: Int64 = -1
    var v: Int64 = 0
    while (v < p) {
        let x = distA[v]
        let y = distD[v]
        if (x >= 0 && y >= 0) {
            var sx = x
            var sy = y
            if (sx > sy) {
                let t = sx
                sx = sy
                sy = t
            }
            if (bx == -1 || sy < by || (sy == by && sx < bx)) {
                bx = sx
                by = sy
            }
        }
        v += 1
    }
    if (bx == -1) {
        println("-1")
    } else {
        println(((p2[bx] + p2[by] - 2) % mod).toString())
    }
}
```

</details>
