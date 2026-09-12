---
oj: dmy
pid: '189'
title: '[R31D] 连通块'
difficulty: 普及+/提高
tags:
  - 并查集
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 2 \times 10^5$，$1 \le u < v \le n$。

## 思路

第 $k$ 次询问会移除所有满足 $u \le k < v$ 的边，剩余边分为两类：

- $v \le k$ 的边，两端都在 $[1, k]$ 内（因为 $u < v \le k$）；
- $u \ge k+1$ 的边，两端都在 $[k+1, n]$ 内（因为 $v > u \ge k+1$）。

两类边互不相交，所以答案等于两部分的连通块数之和：

$$ans_k = pre_k + suf_{k+1}$$

其中 $pre_i$ 表示只保留 $v \le i$ 的边时，节点 $1 \sim i$ 的连通块数；$suf_i$ 表示只保留 $u \ge i$ 的边时，节点 $i \sim n$ 的连通块数。

预处理 $pre$：节点 $1$ 到 $n$ 逐个加入并查集，每加入一个节点连通块数加一，同时把右端点为当前节点的边全部合并；$suf$ 同理从 $n$ 扫到 $1$，加入左端点为当前节点的边。每个询问 $O(1)$ 回答。

复杂度：时间 $O((n+m)\,\alpha(n))$，空间 $O(n+m)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

var parent = Array<Int64>(0, { _ => 0 })

func find(x: Int64): Int64 {
    var cur = x
    while (parent[cur] != cur) {
        cur = parent[cur]
    }
    var y = x
    while (parent[y] != cur) {
        let nxt = parent[y]
        parent[y] = cur
        y = nxt
    }
    return cur
}

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let nn = line0[0]
    let mm = line0[1]
    var eu = Array<Int64>(mm, { _ => 0 })
    var ev = Array<Int64>(mm, { _ => 0 })
    for (i in 0..mm) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let u = Int64.parse(line[0])
        let v = Int64.parse(line[1])
        eu[i] = u
        ev[i] = v
    }

    var byR = Array<ArrayList<Int64>>(nn + 2, { _ => ArrayList<Int64>() })
    var byL = Array<ArrayList<Int64>>(nn + 2, { _ => ArrayList<Int64>() })
    for (i in 0..mm) {
        let u = eu[i]
        let v = ev[i]
        byR[v].add(u)
        byL[u].add(v)
    }

    var pre = Array<Int64>(nn + 2, { _ => 0 })
    parent = Array<Int64>(nn + 1, { i => i })
    var comps: Int64 = 0
    for (i in 1..=nn) {
        comps += 1
        for (u in byR[i]) {
            let ru = find(u)
            let ri = find(i)
            if (ru != ri) {
                parent[ri] = ru
                comps -= 1
            }
        }
        pre[i] = comps
    }

    var suf = Array<Int64>(nn + 2, { _ => 0 })
    parent = Array<Int64>(nn + 1, { i => i })
    comps = 0
    var i = nn
    while (i >= 1) {
        comps += 1
        for (v in byL[i]) {
            let ri = find(i)
            let rv = find(v)
            if (ri != rv) {
                parent[rv] = ri
                comps -= 1
            }
        }
        suf[i] = comps
        i -= 1
    }

    for (k in 1..=nn) {
        let a = pre[k] + suf[k + 1]
        print(a)
        if (k < nn) {
            print(" ")
        }
    }
    println()
}
```
