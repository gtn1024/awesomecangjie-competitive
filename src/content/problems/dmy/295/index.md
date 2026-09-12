---
oj: dmy
pid: '295'
title: '[R47G]收藏'
difficulty: 省选
tags:
  - 平衡树
  - 懒标记
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n,q \le 2 \times 10^5$，$1 \le a_i,v \le 10^9$；类型 $1$ 中 $0 \le k \le n$、$1 \le x \le n$，类型 $2$ 中增加量 $v \le 10^7$。

## 思路

序列会发生插入，普通线段树难以维护元素位置的整体移动。使用按位置维护的 **隐式 Treap**：Treap 的中序遍历顺序就是收藏从左到右的顺序，子树大小表示该子树包含的收藏数量。

一次插入的 $x$ 个收藏价值相同，不能逐个建点，否则总长度可能达到 $O(nq)$。因此让一个 Treap 节点表示一段连续且价值相同的收藏，并维护：

- 当前块的长度与价值；
- 整棵子树的收藏数量与价值总和；
- 整棵子树尚未下传的加法标记。

按前 $k$ 个收藏分裂 Treap 时，用左子树大小和当前块长度判断分界点。若分界点落在一个块内部，就把这个块拆成两块。每次分裂至多新建一个节点，因此节点总数仍是 $O(n+q)$。合并时按随机优先级保持 Treap 平衡。

三种操作分别如下：

1. 先在位置 $k$ 分裂为 $A,B$，新建长度为 $x$、价值为 $v$ 的块 $C$，合并成 $A+C+B$。再按前 $n$ 个收藏分裂，后一部分正是被卖掉的 $x$ 个收藏，其子树总和就是答案；只保留前一部分。
2. 在 $l-1$ 和 $r-l+1$ 处连续分裂，得到区间 $[l,r]$ 对应的子树，给它整体打上加法标记后重新合并。
3. 用相同方法取出区间 $[l,r]$，读取其子树总和，再按原顺序合并回去。

所有价值和都可能超过 `Int32` 范围，统一使用 `Int64`。

## 复杂度

初始建树的期望时间为 $O(n\log n)$，每次操作的期望时间为 $O(\log(n+q))$；总空间为 $O(n+q)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

class ImplicitTreap {
    var left: Array<Int64>
    var right: Array<Int64>
    var priority: Array<Int64>
    var blockLength: Array<Int64>
    var size: Array<Int64>
    var value: Array<Int64>
    var lazy: Array<Int64>
    var sum: Array<Int64>
    var nodeCount: Int64 = 0
    var seed: Int64 = 88172645463325252
    var root: Int64 = 0

    init(capacity: Int64) {
        left = Array<Int64>(capacity, { _ => 0 })
        right = Array<Int64>(capacity, { _ => 0 })
        priority = Array<Int64>(capacity, { _ => 0 })
        blockLength = Array<Int64>(capacity, { _ => 0 })
        size = Array<Int64>(capacity, { _ => 0 })
        value = Array<Int64>(capacity, { _ => 0 })
        lazy = Array<Int64>(capacity, { _ => 0 })
        sum = Array<Int64>(capacity, { _ => 0 })
    }

    func random(): Int64 {
        var x = seed
        x ^= x << 13
        x ^= x >> 7
        x ^= x << 17
        seed = x
        return x
    }

    func newNode(length: Int64, v: Int64): Int64 {
        nodeCount += 1
        let u = nodeCount
        left[u] = 0
        right[u] = 0
        priority[u] = random()
        blockLength[u] = length
        size[u] = length
        value[u] = v
        lazy[u] = 0
        sum[u] = length * v
        return u
    }

    func pull(u: Int64): Unit {
        size[u] = size[left[u]] + blockLength[u] + size[right[u]]
        sum[u] = sum[left[u]] + blockLength[u] * value[u] + sum[right[u]]
    }

    func applyAdd(u: Int64, delta: Int64): Unit {
        if (u != 0) {
            value[u] += delta
            lazy[u] += delta
            sum[u] += delta * size[u]
        }
    }

    func push(u: Int64): Unit {
        let delta = lazy[u]
        if (delta != 0) {
            applyAdd(left[u], delta)
            applyAdd(right[u], delta)
            lazy[u] = 0
        }
    }

    func merge(a: Int64, b: Int64): Int64 {
        if (a == 0) {
            return b
        }
        if (b == 0) {
            return a
        }
        if (priority[a] < priority[b]) {
            push(a)
            let ar = right[a]
            right[a] = merge(ar, b)
            pull(a)
            return a
        } else {
            push(b)
            let bl = left[b]
            left[b] = merge(a, bl)
            pull(b)
            return b
        }
    }

    func split(u: Int64, k: Int64): (Int64, Int64) {
        if (u == 0) {
            return (0, 0)
        }
        push(u)
        let leftSize = size[left[u]]
        if (k < leftSize) {
            let oldLeft = left[u]
            let (a, b) = split(oldLeft, k)
            left[u] = b
            pull(u)
            return (a, u)
        }
        let blockEnd = leftSize + blockLength[u]
        if (k > blockEnd) {
            let oldRight = right[u]
            let (a, b) = split(oldRight, k - blockEnd)
            right[u] = a
            pull(u)
            return (u, b)
        }
        let take = k - leftSize
        if (take == 0) {
            let a = left[u]
            left[u] = 0
            pull(u)
            return (a, u)
        }
        if (take == blockLength[u]) {
            let b = right[u]
            right[u] = 0
            pull(u)
            return (u, b)
        }

        let oldRight = right[u]
        let remain = blockLength[u] - take
        blockLength[u] = take
        right[u] = 0
        pull(u)
        let v = newNode(remain, value[u])
        return (u, merge(v, oldRight))
    }

    func append(v: Int64): Unit {
        root = merge(root, newNode(1, v))
    }

    func insertAndCut(k: Int64, x: Int64, v: Int64, n: Int64): Int64 {
        let (a, b) = split(root, k)
        let middle = newNode(x, v)
        root = merge(merge(a, middle), b)
        let (keep, removed) = split(root, n)
        let answer = sum[removed]
        root = keep
        return answer
    }

    func rangeAdd(l: Int64, r: Int64, delta: Int64): Unit {
        let (a, bc) = split(root, l - 1)
        let (b, c) = split(bc, r - l + 1)
        applyAdd(b, delta)
        root = merge(a, merge(b, c))
    }

    func rangeSum(l: Int64, r: Int64): Int64 {
        let (a, bc) = split(root, l - 1)
        let (b, c) = split(bc, r - l + 1)
        let answer = sum[b]
        root = merge(a, merge(b, c))
        return answer
    }
}

main(): Int64 {
    let reader = getStdIn()
    let _ = Int64.parse(reader.readln().getOrThrow())
    let nq = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nq[0]
    let q = nq[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let treap = ImplicitTreap(n + 3 * q + 10)
    for (v in a) {
        treap.append(v)
    }

    for (_ in 0..q) {
        let operation = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        if (operation[0] == 1) {
            let answer = treap.insertAndCut(operation[1], operation[2], operation[3], n)
            println(answer)
        } else if (operation[0] == 2) {
            treap.rangeAdd(operation[1], operation[2], operation[3])
        } else {
            let answer = treap.rangeSum(operation[1], operation[2])
            println(answer)
        }
    }
    return 0
}
```
