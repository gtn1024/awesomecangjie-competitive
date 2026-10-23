---
oj: dmy
pid: '515'
title: '[R80D] 三元组计数'
difficulty: 普及+/提高
tags:
  - 枚举
  - 前缀和
  - 计数
timeLimit: 1s
memoryLimit: 256m
---

## 数据规模

$3 \le n \le 2\times 10^5$，$1 \le a_i \le 5$。答案不超过 $\binom{n}{3}\approx 1.33\times 10^{15}$，需要用 64 位整数保存。

## 思路

**固定中间下标。** 三个下标 $i<j<k$ 里，$j$ 的位置把序列分成左右两段，条件只关心左边取哪个值、右边取哪个值，与它们的相对位置无关。于是枚举 $j$，设 $y=a_j$，令 $L_x$ 为 $j$ 左侧值等于 $x$ 的元素个数，$R_z$ 为 $j$ 右侧值等于 $z$ 的元素个数。

由于 $i<j<k$，左侧每个值为 $x$ 的位置都能与右侧每个值为 $z$ 的位置配对，配对数就是 $L_x\cdot R_z$。再套上 $a_i>a_k>a_j$ 与整除条件，$j$ 的贡献为

$$
\sum_{\substack{1\le x,z\le 5\\ x>z>y\\ (x+z)\bmod y=0}} L_x\cdot R_z.
$$

**维护左右频次。** 先扫一遍序列，把每个值的总出现次数记到 $R$ 里。随后从左到右扫 $j$：进入 $j$ 时先令 $R_{a_j}$ 减一，此时 $R$ 恰好统计 $j$ 右侧，$L$ 恰好统计 $j$ 左侧，算出贡献后再令 $L_{a_j}$ 加一，把 $j$ 交给下一步的左侧。

**值域只有 $5$ 的好处。** 内层只需枚举 $x,z\in[1,5]$ 且 $x>z>y$ 的组合，至多 $25$ 种，每种用一次乘法和一次取模就能判定，无需任何数据结构。注意 $y$ 与 $x,z$ 相同时不满足严格不等式，比较时不能用等号。

## 复杂度

每个下标只做 $O(5^2)$ 次检查，时间 $O(25n)=O(n)$；除读入的序列外只用了两个长度为 $6$ 的计数数组，额外空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let L = Array<Int64>(6, { _ => 0 })
    let R = Array<Int64>(6, { _ => 0 })
    for (v in a) {
        R[v] += 1
    }
    var ans: Int64 = 0
    for (j in 0..n) {
        let y = a[j]
        R[y] -= 1
        for (x in 1..=5) {
            if (x <= y) {
                continue
            }
            for (z in 1..=5) {
                if (z <= y || z >= x) {
                    continue
                }
                if ((x + z) % y == 0) {
                    ans += L[x] * R[z]
                }
            }
        }
        L[y] += 1
    }
    println(ans)
}
```

</details>
