---
oj: dmy
pid: '200'
title: '[R33C]数组加减'
difficulty: 提高
tags:
  - 数据结构
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n, q \le 2 \times 10^5$，$1 \le i < n$，$1 \le A_i, B_i, k \le 10^6$。

## 思路

设 $d_i = A_i - B_i$，两种基础操作本质都是在 $d$ 上做「相邻转移」：操作 1 让 $d_i$ 减 $1$、$d_{i+1}$ 加 $1$；操作 2 反过来。基础操作只移动相邻元素，总和不变。

记 $d$ 的前缀和 $p_i = \sum_{j=1}^{i} d_j$。把 $A$ 变成 $B$ 的最小操作次数，就是从左到右逐位消化差值：前 $i$ 个元素多出来的量 $p_i$ 必须全部通过 $(i, i+1)$ 之间的相邻操作转给第 $i+1$ 位，代价为 $|p_i|$。因此答案为

$$\text{ans} = \sum_{i=1}^{n-1} |p_i|$$

且要求 $p_n = \sum d = 0$（即 $A$、$B$ 总和相等），否则输出 $-1$。

接下来观察查询。一次 `type, i, k` 修改的是 $d_i$ 与 $d_{i+1}$：type 1 让 $d_i$ 减 $k$、$d_{i+1}$ 加 $k$；type 2 反之。注意到 $d_i + d_{i+1}$ 不变，所以对前缀和 $p_j$（$j > i$）来说，$d_i$ 与 $d_{i+1}$ 的变化相互抵消，**唯一受影响的是 $p_i$**：

- type 1：$p_i \mathrel{-}= k$；
- type 2：$p_i \mathrel{+}= k$。

这是一个关键简化：每次查询只改变一个前缀和值。于是只需维护一个全局量 $\text{sumAbs} = \sum_{i=1}^{n-1} |p_i|$，每次查询先用旧的 $|p_i|$ 减回，更新 $p_i$，再加回新的 $|p_i|$，单次查询 $O(1)$。

另外 $p_n = \sum d$ 在任何相邻转移操作下都不变，所以「是否可能」($\text{possible}$) 在全程是恒定的：初始判断一次即可。

## 复杂度

预处理 $O(n)$，每次查询 $O(1)$，总时间 $O(n + q)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let nq = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nq[0]
    let q = nq[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // d_i = a_i - b_i, prefix sum p_i = sum_{j<=i} d_j
    // answer = sum_{i=1}^{n-1} |p_i|, requires p_n == 0
    let p = Array<Int64>(n, { _ => Int64(0) })
    var s = Int64(0)
    for (i in 0..n) {
        s += a[i] - b[i]
        p[i] = s
    }
    let possible = (p[n - 1] == Int64(0))
    var sumAbs = Int64(0)
    for (i in 0..n - 1) {
        sumAbs += if (p[i] >= Int64(0)) { p[i] } else { -p[i] }
    }
    for (_ in 0..q) {
        let qline = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x: String => Int64.parse(x) })
        let typ = qline[0]
        let i = qline[1]  // 1-based, 1 <= i < n
        let k = qline[2]
        let idx = i - 1  // 0-based index into p
        let oldAbs = if (p[idx] >= Int64(0)) { p[idx] } else { -p[idx] }
        sumAbs -= oldAbs
        if (typ == Int64(1)) {
            // type1: A_i -= k, A_{i+1} += k => d_i -= k, d_{i+1} += k => p_i -= k
            p[idx] -= k
        } else {
            // type2: A_i += k, A_{i+1} -= k => d_i += k, d_{i+1} -= k => p_i += k
            p[idx] += k
        }
        let newAbs = if (p[idx] >= Int64(0)) { p[idx] } else { -p[idx] }
        sumAbs += newAbs
        if (possible) {
            println(sumAbs)
        } else {
            println(-1)
        }
    }
}
```

</details>
