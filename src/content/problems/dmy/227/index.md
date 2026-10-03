---
oj: dmy
pid: '227'
title: '[R37F] 增长药剂'
difficulty: 提高
tags:
  - 组合数学
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 2 \times 10^5$，$1 \le a_i \le 10$，答案对 $998244353$ 取模。

## 思路

要统计所有 $n!$ 种排列下「喷洒后序列的逆序对总数」。逆序对是二元关系，先固定一对位置 $i < j$，考虑这对位置在所有排列中的贡献。

排列均匀地取遍 $n!$ 种情况时，$(p_i, p_j)$ 取到任意一对不同的值 $(x, y)$（$x \ne y$）的次数都是 $(n-2)!$。因此位置对 $(i, j)$ 的贡献为：

$$(n-2)! \cdot \#\{(x, y) : x \ne y,\ x \cdot a_i > y \cdot a_j\}$$

记 $C(u, v) = \#\{(x, y) : 1 \le x, y \le n,\ x \ne y,\ x u > y v\}$，则答案为：

$$(n-2)! \cdot \sum_{i < j} C(a_i, a_j)$$

注意 $C(u, v)$ 与位置无关，只与两个药剂的功效有关，而 $a_i \le 10$，值域很小。

**计算 $C(u, v)$**。先放宽 $x \ne y$ 的限制，统计 $G(u, v) = \#\{(x, y) : x u > y v\}$：固定 $x$，满足 $y v < x u$ 的 $y$ 有 $\min(n, \lfloor (xu-1)/v \rfloor)$ 个，于是

$$G(u, v) = \sum_{x=1}^{n} \min\left(n, \left\lfloor \frac{xu-1}{v} \right\rfloor\right)$$

对每个 $(u, v)$ 直接 $O(n)$ 求和即可。再减去对角线上 $x = y$ 且 $xu > xv$ 的 $n$ 个点（仅当 $u > v$ 时存在），得到 $C(u, v) = G(u, v) - [u > v] \cdot n$。

**汇总答案**。$S = \sum_{i<j} C(a_i, a_j)$ 不能只用每种功效的出现次数算（$C(u,v)$ 是「有序」的，依赖 $u$ 所在位置在 $v$ 之前），需要从左到右扫描：维护 $seen[u]$ 表示当前位置之前功效为 $u$ 的位置数，扫到位置 $j$（功效 $v = a_j$）时，累加 $\sum_u C(u, v) \cdot seen[u]$，然后 $seen[v] \gets seen[v] + 1$。最后答案乘上 $(n-2)!$ 再取模。

值域只有 $10$，预计算 $10 \times 10$ 个 $C(u, v)$ 总代价 $O(10^2 n)$，汇总扫描 $O(10 n)$。

## 复杂度

时间 $O(10^2 n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

const MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // C[u][v] = #{x != y : 1 <= x,y <= n, x*u > y*v}, u,v in 1..10
    var C = Array<Array<Int64>>(10, { _ => Array<Int64>(10, { _ => 0 }) })
    for (u in 1..=10) {
        for (v in 1..=10) {
            var g: Int64 = 0
            for (x in 1..=n) {
                let t = (x * u - 1) / v
                g += if (t < n) { t } else { n }
            }
            var c = g
            if (u > v) {
                c -= n
            }
            C[u - 1][v - 1] = c
        }
    }

    // S = sum_{i<j} C(a_i, a_j)
    var seen = Array<Int64>(10, { _ => 0 })
    var s: Int64 = 0
    for (j in 0..a.size) {
        let v = a[j]
        for (u in 1..=10) {
            if (seen[u - 1] > 0) {
                s = (s + C[u - 1][v - 1] * seen[u - 1]) % MOD
            }
        }
        seen[v - 1] += 1
    }

    // (n-2)! mod MOD
    var fact: Int64 = 1
    var k: Int64 = 2
    while (k <= n - 2) {
        fact = fact * k % MOD
        k += 1
    }

    println((s * fact) % MOD)
}
```

</details>
