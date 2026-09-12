---
oj: dmy
pid: '346'
title: '[R55F]异或的下传'
difficulty: 省选
tags:
  - 树
  - 树形 DP
  - 位运算
  - 组合数学
timeLimit: 2.5s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 2 \times 10^5$，$1 \le a_i < 2^{30}$。

## 思路

异或的每一位互不影响，因此分别统计答案的第 $b$ 位为 $1$ 的三元组数量，最后乘上 $2^b$ 求和。

固定一个二进制位。对于节点 $u$，设它的子树中该位为 $0$、$1$ 的节点数分别为 $z_u$、$o_u$。在这棵子树内任取三个节点，它们这一位的异或为偶数或奇数的方案数分别是：

$$
E_u=\binom{z_u}{3}+\binom{o_u}{2}z_u,
\qquad
O_u=\binom{o_u}{3}+o_u\binom{z_u}{2}.
$$

三个节点的最近公共祖先恰为 $u$，等价于它们都在 $u$ 的子树内，但没有全部落在 $u$ 的同一个儿子子树内。因此，设 $v$ 遍历 $u$ 的儿子，可以直接用容斥得到：

$$
G_u^0=E_u-\sum_v E_v,
\qquad
G_u^1=O_u-\sum_v O_v.
$$

这里 $G_u^0$、$G_u^1$ 分别表示最近公共祖先恰为 $u$，且三个节点这一位的异或为 $0$、$1$ 的方案数。每个三元组只会被唯一的最近公共祖先统计一次。

题目还要异或最近公共祖先的父亲节点。若 $u$ 的父亲在当前位为 $0$，应把 $G_u^1$ 加入答案；若为 $1$，则应把 $G_u^0$ 加入答案。根节点的父亲是权值为 $0$ 的虚拟节点，按前一种情况处理即可。

先用一次迭代 DFS 求出父亲数组、遍历序列与子树大小。对每个二进制位，逆序累加子树内的 $1$ 的数量，再逆序计算 $E_u$、$O_u$ 以及儿子贡献之和，便能在线性时间内完成这一位的统计。

## 复杂度

时间复杂度为 $O(30n)$，空间复杂度为 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

func c2(x: Int64): Int64 {
    if (x < 2) {
        return 0
    }
    return x * (x - 1) / 2
}

func c3(x: Int64): Int64 {
    if (x < 3) {
        return 0
    }
    return x * (x - 1) * (x - 2) / 6
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let head = Array<Int64>(n, { _ => -1 })
    let edgeSize = 2 * (n - 1)
    let to = Array<Int64>(edgeSize, { _ => 0 })
    let next = Array<Int64>(edgeSize, { _ => -1 })
    var edgeCount: Int64 = 0
    for (_ in 0..(n - 1)) {
        let edge = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = edge[0] - 1
        let v = edge[1] - 1

        to[edgeCount] = v
        next[edgeCount] = head[u]
        head[u] = edgeCount
        edgeCount += 1

        to[edgeCount] = u
        next[edgeCount] = head[v]
        head[v] = edgeCount
        edgeCount += 1
    }

    let parent = Array<Int64>(n, { _ => -2 })
    let order = Array<Int64>(n, { _ => 0 })
    let stack = Array<Int64>(n, { _ => 0 })
    parent[0] = -1
    stack[0] = 0
    var top: Int64 = 1
    var orderSize: Int64 = 0
    while (top > 0) {
        top -= 1
        let u = stack[top]
        order[orderSize] = u
        orderSize += 1

        var e = head[u]
        while (e >= 0) {
            let v = to[e]
            if (v != parent[u]) {
                parent[v] = u
                stack[top] = v
                top += 1
            }
            e = next[e]
        }
    }

    let subtreeSize = Array<Int64>(n, { _ => 1 })
    var index = n - 1
    while (index >= 0) {
        let u = order[index]
        let p = parent[u]
        if (p >= 0) {
            subtreeSize[p] += subtreeSize[u]
        }
        index -= 1
    }

    let ones = Array<Int64>(n, { _ => 0 })
    let childEven = Array<Int64>(n, { _ => 0 })
    let childOdd = Array<Int64>(n, { _ => 0 })
    var answer: Int64 = 0
    var mask: Int64 = 1
    var bit: Int64 = 0
    while (bit < 30) {
        var i: Int64 = 0
        while (i < n) {
            if ((a[i] & mask) != 0) {
                ones[i] = 1
            } else {
                ones[i] = 0
            }
            childEven[i] = 0
            childOdd[i] = 0
            i += 1
        }

        index = n - 1
        while (index >= 0) {
            let u = order[index]
            let p = parent[u]
            if (p >= 0) {
                ones[p] += ones[u]
            }
            index -= 1
        }

        var validTriples: Int64 = 0
        index = n - 1
        while (index >= 0) {
            let u = order[index]
            let oneCount = ones[u]
            let zeroCount = subtreeSize[u] - oneCount
            let evenCount = c3(zeroCount) + c2(oneCount) * zeroCount
            let oddCount = c3(oneCount) + oneCount * c2(zeroCount)
            let p = parent[u]

            if (p < 0 || (a[p] & mask) == 0) {
                validTriples += oddCount - childOdd[u]
            } else {
                validTriples += evenCount - childEven[u]
            }

            if (p >= 0) {
                childEven[p] += evenCount
                childOdd[p] += oddCount
            }
            index -= 1
        }

        answer = (answer + (validTriples % MOD) * (mask % MOD)) % MOD
        mask *= 2
        bit += 1
    }

    println(answer)
}
```
