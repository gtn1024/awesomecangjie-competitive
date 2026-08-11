---
oj: dmy
pid: '278'
title: '[R45D]货架和沙威玛'
difficulty: 提高
tags:
  - 模拟
  - 分类讨论
timeLimit: 1.5s
memoryLimit: 512m
---

## 题目

按顺序排列的 $n$ 个调料品，第 $i$ 个风味值为 $a_i$。可以进行若干次操作：选择一个区间 $[l,r]$（$l<r$），使得该区间构成一个长度至少为 $2$ 的等差数列，然后将该区间从序列中删除（两侧拼接）。求最后货架上最少剩下几个调料品。多组测试数据，$\sum n\le 5000$。

## 思路

每次操作删掉至少 $2$ 个元素。注意到 **任意两个相邻元素都构成一个长度为 $2$ 的等差数列**，因此总是可以把任意相邻的一对删掉。反复删相邻对即可把序列长度归约到 $n\bmod 2$：偶数长度一定可以全部删空，奇数长度至多剩 $1$ 个。所以答案只可能是 $0$ 或 $1$：

- $n$ 为偶数：答案恒为 $0$。
- $n$ 为奇数：答案为 $0$ 当且仅当能把整个序列删空，否则为 $1$。

奇数 $n$ 要全部删空，必须出现一次删掉 **奇数个** 元素的操作（删掉长度为奇数的等差数列），把长度从奇数变成偶数。最小的这种结构是删掉 $3$ 个成等差数列的元素。关键结论是：

> 奇数 $n$ 能被全部删空，当且仅当存在下标 $i<j<k$，满足 $a_i+a_k=2a_j$（即 $a_i,a_j,a_k$ 成等差数列，$j$ 是 $i,k$ 的等差中项），并且 **$i,j$ 同奇偶、$k$ 与 $j$ 异奇偶、$k>j$**。

**奇偶条件的来源**：被最后一次操作删掉的三个元素，是原序列的一个子序列，它们之间的元素已经更早被成对删掉。成对删掉意味着 $i$ 与 $j$ 之间、$j$ 与 $k$ 之间各自删掉了偶数个元素，故 $i,j$ 同奇偶、$j,k$ 同奇偶；但三个下标 $i,j,k$ 本身要保持 $i<j<k$ 且整体跨越奇偶，再结合「$k$ 必须在 $j$ 之后」可归纳出 $k$ 与 $j$ 异奇偶。反过来的构造（先成对地清空 $i,j$ 之间与 $j,k$ 之间的元素，再把成等差数列的三个相邻元素一次删掉，最后用相邻对清空剩余偶数个元素）说明该条件也是充分的。

实现上，用两个哈希表分别记录「下标为奇数」「下标为偶数」的位置上每个值 **最后出现的位置**（取最大下标即可，因为只需要存在一个 $>j$ 的）。然后枚举所有同奇偶对 $(i,j)$（$j=i+1,i+3,\dots$），令目标值 $\text{target}=2a_j-a_i$，在与 $j$ 异奇偶的那个哈希表里查 $\text{target}$ 是否存在且位置 $>j$。一旦查到就直接输出 $0$；全部枚举完仍未查到则输出 $1$。

## 复杂度

- 时间复杂度：$O(n^2)$（同奇偶对约 $n^2/4$ 个，每次哈希表查询均摊 $O(1)$），多组数据合计 $O((\sum n)^2)$。
- 空间复杂度：$O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.console.*
import std.collection.*

func solve(reader: ConsoleReader): Unit {
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // 两个 map：mp0 记录偶数位（下标 %2==0），mp1 记录奇数位（下标 %2==1）每个值最后出现位置（1-based）
    var mp0 = HashMap<Int64, Int64>()
    var mp1 = HashMap<Int64, Int64>()
    var i: Int64 = 0
    while (i < n) {
        let idx = i + 1
        let v = a[i]
        if (idx % 2 == 1) {
            mp1[v] = idx
        } else {
            mp0[v] = idx
        }
        i += 1
    }
    if (n % 2 == 0) {
        println(0)
        return
    }
    var ii: Int64 = 0
    while (ii < n) {
        let i1 = ii + 1
        var j1 = i1 + 1
        while (j1 <= n) {
            let jPar = j1 % 2
            let target = 2 * a[j1 - 1] - a[i1 - 1]
            var kpos: Int64 = -1
            if (jPar == 1) {
                if (mp0.contains(target)) {
                    kpos = mp0[target]
                }
            } else {
                if (mp1.contains(target)) {
                    kpos = mp1[target]
                }
            }
            if (kpos > j1) {
                println(0)
                return
            }
            j1 += 2
        }
        ii += 1
    }
    println(1)
}

main(): Int64 {
    let reader = Console.stdIn
    let t = Int64.parse(reader.readln().getOrThrow())
    var c: Int64 = 0
    while (c < t) {
        solve(reader)
        c += 1
    }
    return 0
}
```
