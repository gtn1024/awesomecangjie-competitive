---
oj: dmy
pid: '214'
title: '[R35E]锦标赛'
difficulty: 普及+/提高
tags:
  - 概率
  - 动态规划
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 12$，$1 \le a_i \le 10^6$。

## 思路

赛程固定：选手按编号顺序配对，胜者保持相对顺序进入下一轮。因此整个赛程就是一棵完整的二叉树——第 $k$ 轮（从 0 开始）中，选手只会与「相邻的 $2^k$ 人小组」里的选手相遇，两个小组合并成一个 $2^{k+1}$ 人小组。

设 $f_{i,k}$ 为选手 $i$ 赢得其所在 $2^k$ 人小组（即连赢 $k$ 场）的概率，边界 $f_{i,0} = 1$。

转移时考虑第 $k$ 轮的一个 $2^{k+1}$ 人小组 $[b, b + 2^{k+1})$，拆成左半区 $[b, b + 2^k)$ 与右半区 $[b + 2^k, b + 2^{k+1})$：

- 对左半区选手 $i$：先以概率 $f_{i,k}$ 赢下自己的半区；右半区的胜者是 $j$ 的概率为 $f_{j,k}$，$i$ 战胜 $j$ 的概率为 $\dfrac{a_i}{a_i + a_j}$。于是

$$f_{i,k+1} = f_{i,k} \cdot \sum_{j \in \text{右半区}} f_{j,k} \cdot \frac{a_i}{a_i + a_j}$$

- 右半区选手对称处理。

最终答案就是 $f_{i,n}$（全体选手所在小组即整个锦标赛）。

概率是分数，对模数 $998244353$（质数）取模时用逆元：$\dfrac{a_i}{a_i+a_j} \equiv a_i \cdot (a_i+a_j)^{-1} \pmod{P}$。由于 $a_i + a_j \le 2 \times 10^6 < P$，可以按线性递推 $inv[i] = P - \lfloor P/i \rfloor \cdot inv[P \bmod i] \bmod P$ 预处理 $1 \dots 2 \times 10^6$ 的所有逆元，转移时 $O(1)$ 查询。

## 复杂度

每对「可能相遇」的选手 $(i, j)$ 恰在其相遇那一轮被枚举一次，共 $\sum_{k=0}^{n-1} 2^{n-1+k} = 2^{n-1}(2^n - 1)$ 对。$n = 12$ 时约为 $8.4 \times 10^6$ 次运算。时间 $O(4^n)$，空间 $O(2^n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353
const MAXS: Int64 = 2000000

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let m = 1 << n

    // 预处理 1..2000000 的模逆元（a_i + a_j 最大 2e6）
    let inv = Array<Int64>(MAXS + 1, { _ => 0 })
    inv[1] = 1
    var i: Int64 = 2
    while (i <= MAXS) {
        inv[i] = MOD - (MOD / i) * inv[MOD % i] % MOD
        i = i + 1
    }

    // prev[x]：选手 x 赢得其所在 2^r 人小组的概率；初始 r=0 时概率为 1
    var prev = Array<Int64>(m, { _ => 1 })
    var cur = Array<Int64>(m, { _ => 0 })
    var r: Int64 = 0
    while (r < n) {
        let half = 1 << r
        let block = half << 1
        var b: Int64 = 0
        while (b < m) {
            // 左半区选手
            var p: Int64 = b
            while (p < b + half) {
                var s: Int64 = 0
                var q: Int64 = b + half
                while (q < b + block) {
                    s = (s + prev[q] * a[p] % MOD * inv[a[p] + a[q]]) % MOD
                    q = q + 1
                }
                cur[p] = prev[p] * s % MOD
                p = p + 1
            }
            // 右半区选手
            var q: Int64 = b + half
            while (q < b + block) {
                var s: Int64 = 0
                var p: Int64 = b
                while (p < b + half) {
                    s = (s + prev[p] * a[q] % MOD * inv[a[p] + a[q]]) % MOD
                    p = p + 1
                }
                cur[q] = prev[q] * s % MOD
                q = q + 1
            }
            b = b + block
        }
        let t = prev
        prev = cur
        cur = t
        r = r + 1
    }

    var k: Int64 = 0
    while (k < m) {
        if (k > 0) {
            print(" ")
        }
        print(prev[k])
        k = k + 1
    }
    println()
}
```
