---
oj: dmy
pid: '196'
title: '[R32E] 回文串'
difficulty: 普及+
tags:
  - 树
  - 位运算
  - 计数
timeLimit: 2s
memoryLimit: 128m
---

> 数据规模：$n \le 2 \times 10^5$，边上的字母均为小写英文字母。

## 思路

一个字符串能重排成回文串，当且仅当其中出现次数为奇数的字符至多有**一个**。因此只需要关心路径上每个字母出现次数的奇偶性，用 26 位二进制掩码表示：第 $c$ 位为 1 表示字母 $c$ 出现奇数次。

把树以 1 为根，令 $\text{mask}(x)$ 表示根到 $x$ 路径上字母奇偶性构成的掩码。那么 $u \to v$ 路径的掩码就是 $\text{mask}(u) \oplus \text{mask}(v)$，路径 $(u, v)$ 是好路径当且仅当

$$\operatorname{popcount}(\text{mask}(u) \oplus \text{mask}(v)) \le 1$$

即 $\text{mask}(v)$ 属于集合 $\{\text{mask}(u)\} \cup \{\text{mask}(u) \oplus 2^c \mid c = 0 \dots 25\}$，一共 27 个目标值。

于是先用一次 DFS 求出所有 $\text{mask}(x)$，再用哈希表统计每个掩码的出现次数。对每个节点 $u$，累加这 27 个目标掩码的出现次数，即为满足条件的 $v$ 的总数；其中 $\text{mask}(v) = \text{mask}(u)$ 时 $v = u$ 也满足条件，题目要求 $v \ne u$，所以最后再减 1。

DFS 用显式栈迭代实现，避免递归爆栈；邻接表用前向星数组存储，控制内存占用。

## 复杂度

时间 $O(26n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())

    // 前向星存边，边权为字母对应的二进制位
    let mm = 2 * (n - 1)
    let head = Array<Int64>(n + 1, { _ => -1 })
    let to = Array<Int64>(mm, { _ => 0 })
    let bit = Array<Int64>(mm, { _ => 0 })
    let nxt = Array<Int64>(mm, { _ => 0 })
    var ec: Int64 = 0
    for (_ in 0..(n - 1)) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let u = Int64.parse(line[0])
        let v = Int64.parse(line[1])
        let rs = line[2].toRuneArray()
        let shift = Int64(UInt32(rs[0]) - UInt32(r'a'))
        let b = Int64(1) << shift
        to[ec] = v
        bit[ec] = b
        nxt[ec] = head[u]
        head[u] = ec
        ec += 1
        to[ec] = u
        bit[ec] = b
        nxt[ec] = head[v]
        head[v] = ec
        ec += 1
    }

    // 迭代 DFS：mask[x] 为根到 x 路径上各字母奇偶性的异或掩码
    let mask = Array<Int64>(n + 1, { _ => 0 })
    let seen = Array<Bool>(n + 1, { _ => false })
    let stack = Array<Int64>(n + 1, { _ => 0 })
    var top: Int64 = 0
    stack[top] = 1
    top += 1
    seen[1] = true
    while (top > 0) {
        top -= 1
        let u = stack[top]
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (!seen[v]) {
                seen[v] = true
                mask[v] = mask[u] ^ bit[e]
                stack[top] = v
                top += 1
            }
            e = nxt[e]
        }
    }

    // 统计每种掩码的出现次数
    let cnt = HashMap<Int64, Int64>()
    for (u in 1..=n) {
        let m = mask[u]
        if (cnt.contains(m)) {
            cnt[m] = cnt[m] + 1
        } else {
            cnt[m] = 1
        }
    }

    // 路径 (u, v) 好当且仅当 popcount(mask[u] ^ mask[v]) <= 1，
    // 即 mask[v] 属于 {mask[u]} ∪ {mask[u] ^ 2^c}，最后去掉 v == u 自身
    let sb = StringBuilder()
    for (u in 1..=n) {
        let m = mask[u]
        var res: Int64 = 0
        if (cnt.contains(m)) {
            res += cnt[m]
        }
        for (c in 0..26) {
            let t = m ^ (Int64(1) << c)
            if (cnt.contains(t)) {
                res += cnt[t]
            }
        }
        res -= 1
        if (u > 1) {
            sb.append(' ')
        }
        sb.append(res)
    }
    println(sb.toString())
    return 0
}
```
