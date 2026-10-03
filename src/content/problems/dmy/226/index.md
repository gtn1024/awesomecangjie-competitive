---
oj: dmy
pid: '226'
title: '[R37E] 走亲访友'
difficulty: 提高
tags:
  - 最短路
  - 动态规划
  - 位运算
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 18$，$m, q \le 2 \times 10^5$，$b_i, c_i \le 10^9$。

## 思路

城市构成 $n$ 维超立方体：两座城市 $i, j$ 之间有一条边当且仅当它们的二进制表示**恰好一位**不同，若该位从低到高是第 $x$ 位，则边权为 $b_x$。

先刻画一次旅行的总费用。设从机场 $a$ 出发到 $f$ 共走了 $k$ 条边。降落后车上已有 1 头大象，之后每经过一个城市多 1 头，因此走第 $t$ 条边时的油费为 $t$，总油费为

$$\frac{k(k+1)}{2} = 1 + 2 + \cdots + k$$

再加上沿途各边路费之和与机票 $c(a)$。

**关键观察**：由于 $b_x \ge 1$ 且油费随边数严格递增，最优路径一定恰好翻转「$a$ 与 $f$ 二进制不同的那几位」各一次——多翻转一对位只会白白增加路费和油费。因此最优边数恰为

$$k = \operatorname{popcount}(a \oplus f)$$

而路费之和为 $\sum_{x \in a \oplus f} b_x$，总费用只取决于 $a \oplus f$：

$$c(a) + \sum_{x \in a \oplus f} b_x + \frac{k(k+1)}{2}$$

直接对每个询问枚举所有机场是 $O(mq)$，不可行。换个角度，把费用按「走过的边数」分层递推：记 $d_j[v]$ 为车上已有 $j$ 头大象（即已走 $j-1$ 条边）时到达城市 $v$ 的最小总费用。初始层 $d_1[a_i] = c_i$。因为每走一条边大象数恰好加 1，转移只在相邻两层之间发生，形成分层 DAG：

$$d_{j+1}[v'] = \min_{x} \left( d_j[v' \oplus 2^x] + j + b_x \right)$$

即从 $v'$ 沿第 $x$ 位走到邻居，付出油费 $j$ 与路费 $b_x$。边数最多为 $n$，所以只需 $n+1$ 层，逐层递推即可，无需 Dijkstra。

对每个城市 $v$ 维护所有层的最小值 $\mathit{best}[v] = \min_j d_j[v]$，询问 $f$ 直接输出 $\mathit{best}[f]$。

## 复杂度

时间 $O(n^2 2^n)$，空间 $O(2^n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line0[0])
    let m = Int64.parse(line0[1])
    let q = Int64.parse(line0[2])

    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let nn = n
    let N = 1 << nn
    let INF = Int64(4000000000000000000)

    // 第 1 层：降落在机场 a[i]，车上 1 头大象，费用为机票 c[i]
    var dcur = Array<Int64>(N, { _ => INF })
    var i: Int64 = 0
    while (i < m) {
        dcur[a[i]] = c[i]
        i += 1
    }

    // best[v] = 到 v 的最小总费用（机票 + 路费 + 油费）
    let dc0 = dcur
    var best = Array<Int64>(N, { idx => dc0[idx] })

    let bits = Array<Int64>(nn, { x => 1 << x })
    let w = Array<Int64>(nn, { _ => 0 })

    // 分层 DP：dcur 为第 j 层（车上有 j 头大象，已走 j-1 条边）
    // 转移：dnext[v'] = min over x of dcur[v' ^ (1<<x)] + (j + b[x])
    var j: Int64 = 1
    while (j <= nn) {
        var x: Int64 = 0
        while (x < nn) {
            w[x] = j + b[x]
            x += 1
        }
        let dnext = Array<Int64>(N, { _ => INF })
        x = 0
        while (x < nn) {
            let bit = bits[x]
            let wx = w[x]
            var v: Int64 = 0
            while (v < N) {
                let cand = dcur[v ^ bit] + wx
                if (cand < dnext[v]) {
                    dnext[v] = cand
                }
                v += 1
            }
            x += 1
        }
        var v: Int64 = 0
        while (v < N) {
            if (dnext[v] < best[v]) {
                best[v] = dnext[v]
            }
            v += 1
        }
        dcur = dnext
        j += 1
    }

    var k: Int64 = 0
    while (k < q) {
        let f = Int64.parse(reader.readln().getOrThrow())
        println(best[f])
        k += 1
    }
}
```

</details>
