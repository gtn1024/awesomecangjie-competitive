---
oj: dmy
pid: '402'
title: '[R64F] 购买'
difficulty: 普及+/提高
tags:
  - 线段树
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 2 \times 10^5$，$1 \le a_i \le 10^9$，$1 \le x_j \le 2 \times 10^{14}$。

## 思路

直接模拟每个人从 $1$ 走到 $n$ 是 $O(nm)$，会超时。

观察每个人的购买过程：他只会买「当前手里钱买得起的、还没被买走的最靠左商品」。这是正确的，因为他的钱只会减少不会增加——当全局最左的可买商品是 $p$ 时，$p$ 左侧所有未售商品价格都大于当前钱数，而更早时刻他的钱更多时都买不起，之后更买不起；已售商品也不可能再买。因此反复找到这个 $p$ 并买下，就等价于他从左到右的真实购物过程。

用一棵线段树维护：

- 叶子：若商品 $i$ 尚未售出，值为价格 $a_i$；已售出则为 $+\infty$；
- 内部节点：区间内剩余商品价格的最小值。

对每个人，反复执行：

1. 查询**全局第一个价格不超过当前钱数**的位置 $p$：从根开始，若左儿子最小值不超过当前钱数则往左走，否则往右走，直到叶子（线段树上二分，$O(\log n)$）。若根最小值已大于当前钱数，说明买不起了，此人购物结束；
2. 买下 $p$：扣钱，把叶子 $p$ 单点更新为 $+\infty$。

由于每次成功购买都会让一件商品永久下架，所有人的购买次数总和不超过 $n$；每个人还会做一次失败的查询来结束购物，所以线段树操作总次数为 $O(n + m)$。

## 复杂度

$+\infty$ 要大于任何可能的金额（$2 \times 10^{14}$ 量级），取 $10^{18}$ 即可。

时间复杂度 $O((n + m) \log n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

var INF: Int64 = 1000000000000000000
var tree = Array<Int64>(0, { _ => 0 })

func build(node: Int64, l: Int64, r: Int64, a: Array<Int64>): Unit {
    if (l == r) {
        tree[node] = a[l]
        return
    }
    let mid = (l + r) / 2
    build(node * 2, l, mid, a)
    build(node * 2 + 1, mid + 1, r, a)
    if (tree[node * 2] < tree[node * 2 + 1]) {
        tree[node] = tree[node * 2]
    } else {
        tree[node] = tree[node * 2 + 1]
    }
}

func update(node: Int64, l: Int64, r: Int64, pos: Int64): Unit {
    if (l == r) {
        tree[node] = INF
        return
    }
    let mid = (l + r) / 2
    if (pos <= mid) {
        update(node * 2, l, mid, pos)
    } else {
        update(node * 2 + 1, mid + 1, r, pos)
    }
    if (tree[node * 2] < tree[node * 2 + 1]) {
        tree[node] = tree[node * 2]
    } else {
        tree[node] = tree[node * 2 + 1]
    }
}

func findFirst(node: Int64, l: Int64, r: Int64, money: Int64): Int64 {
    if (tree[node] > money) {
        return -1
    }
    if (l == r) {
        return l
    }
    let mid = (l + r) / 2
    let res = findFirst(node * 2, l, mid, money)
    if (res != -1) {
        return res
    }
    return findFirst(node * 2 + 1, mid + 1, r, money)
}

main(): Int64 {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = line0[0]
    let mm = line0[1]
    let av = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let xs = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var a = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 1..=nn) {
        a[i] = av[i - 1]
    }
    tree = Array<Int64>(4 * nn + 5, { _ => 0 })
    build(1, 1, nn, a)
    var sb = StringBuilder()
    for (j in 0..mm) {
        var money = xs[j]
        var line = StringBuilder()
        var cnt: Int64 = 0
        while (true) {
            let p = findFirst(1, 1, nn, money)
            if (p == -1) {
                break
            }
            if (cnt > 0) {
                line.append(" ")
            }
            line.append(p.toString())
            cnt += 1
            money -= a[p]
            update(1, 1, nn, p)
        }
        sb.append(cnt.toString())
        if (cnt > 0) {
            sb.append(" ")
            sb.append(line.toString())
        }
        sb.append("\n")
    }
    print(sb.toString())
    return 0
}
```

要点：

- 金额与价格之差最多到 $2 \times 10^{14}$ 量级，必须用 `Int64`；$+\infty$ 取 $10^{18}$。
- 每人的购买编号天然按从小到大输出（每次取的都是全局最左可买位置）。
- 输出量大，每行用 `StringBuilder` 拼接，最后一次性输出。
