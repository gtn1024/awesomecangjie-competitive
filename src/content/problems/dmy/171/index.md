---
oj: dmy
pid: '171'
title: '[R28D]树上路径'
difficulty: 提高
tags:
  - 树
  - DFS
  - 哈希
timeLimit: 2s
memoryLimit: 512m
---

> $1 \le n \le 5 \times 10^5$，$-10^9 \le w \le 10^9$，$0 \le K \le 5 \times 10^{15}$。

## 思路

记 $\mathit{pref}[v]$ 为根到 $v$ 路径上所有边权之和（$v$ 自身时为 $0$）。对一条祖先到后代的路径 $u \to v$，其边权和恰为 $\mathit{pref}[v] - \mathit{pref}[u]$。于是条件转化为：

$$
\mathit{pref}[v] - \mathit{pref}[u] = K \iff \mathit{pref}[u] = \mathit{pref}[v] - K.
$$

其中 $u$ 必须是 $v$ 的祖先（含 $v$ 自身）。从根出发做一次 **DFS**，过程中维护 **当前 DFS 栈（即从根到当前节点的整条祖先链）** 上各前缀和的出现次数。这样对当前节点 $v$，只需在计数表里查询 $\mathit{pref}[v] - K$ 出现了几次，就能 $O(1)$ 得到以 $v$ 为后代、满足路径和为 $K$ 的祖先 $u$ 的个数。

具体做法：

- 进入节点 $v$ 时，先把 $\mathit{pref}[v]$ 加入计数表（根的 $\mathit{pref}=0$ 在 DFS 开始前预置），再查询 $\mathit{pref}[v] - K$ 的计数累加进答案。
- 离开节点 $v$ 时，把 $\mathit{pref}[v]$ 从计数表中减去，保证计数表始终只反映「根到当前节点的祖先链」。

由于边权可能为负、$K$ 最大可达 $5 \times 10^{15}$，前缀和范围很大，不能开数组下标，必须用哈希表（`HashMap<Int64, Int64>`）。

> 注：$u = v$（节点自身）也算祖先，此时路径和为 $0$；当 $K = 0$ 时每个节点都会贡献一个自配对，计数表中包含 $v$ 自身的 $\mathit{pref}[v]$ 正好覆盖这种情况。

$n$ 高达 $5 \times 10^5$，递归 DFS 有爆栈风险，改用 **迭代 DFS**（显式栈，每个节点压一次进入事件、一次离开事件）。邻接表用 **CSR（压缩稀疏行）平面数组** 构建，比嵌套 `ArrayList` 显著更快。

## 复杂度

- 时间：$O(n)$，每个节点常数次哈希表操作。
- 空间：$O(n)$，邻接表、前缀和数组、DFS 栈、哈希表。

## 仓颉实现

```cangjie
// DFS，维护根到当前节点路径上各前缀和出现次数。
// 对节点 v，祖先 u 满足路径和 pref[v]-pref[u]==K，即 pref[u]==pref[v]-K。
// 用 HashMap 计数当前路径上前缀和，O(1) 查询。
// 迭代 DFS 避免递归栈溢出（n=5e5）。
// 用 CSR 邻接表（平面数组）替代 ArrayList，提升构建速度。

import std.env.*
import std.convert.*
import std.collection.*

main(): Int64 {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = l1[0]
    let K = l1[1]
    let nn = n
    let m = nn - 1 // 边数

    // 先读所有边到平面数组
    let eu = Array<Int64>(m, { _ => 0 })
    let ev = Array<Int64>(m, { _ => 0 })
    let ew = Array<Int64>(m, { _ => 0 })
    let deg = Array<Int64>(nn + 2, { _ => 0 })
    for (i in 0..m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = line[0]
        let v = line[1]
        let w = line[2]
        eu[i] = u
        ev[i] = v
        ew[i] = w
        deg[u] = deg[u] + 1
        deg[v] = deg[v] + 1
    }

    // CSR：adjTo[adjStart[u] .. adjStart[u+1]] 存邻居，adjWt 同位存边权
    let adjStart = Array<Int64>(nn + 2, { _ => 0 })
    var acc: Int64 = 0
    for (i in 1..=nn + 1) {
        adjStart[i] = acc
        acc = acc + deg[i]
    }
    let total = acc
    let adjTo = Array<Int64>(total, { _ => 0 })
    let adjWt = Array<Int64>(total, { _ => 0 })
    let cur = Array<Int64>(nn + 2, { _ => 0 })
    for (i in 0..m) {
        let u = eu[i]
        let v = ev[i]
        let w = ew[i]
        let pu = adjStart[u] + cur[u]
        adjTo[pu] = v
        adjWt[pu] = w
        cur[u] = cur[u] + 1
        let pv = adjStart[v] + cur[v]
        adjTo[pv] = u
        adjWt[pv] = w
        cur[v] = cur[v] + 1
    }

    // 前缀和数组：pref[node] = 根到该节点路径边权和
    let pref = Array<Int64>(nn + 1, { _ => 0 })
    let parent = Array<Int64>(nn + 1, { _ => 0 })
    // 迭代 DFS 栈
    let stackNode = Array<Int64>(nn + 2, { _ => 0 })
    let stackState = Array<Int64>(nn + 2, { _ => 0 })
    var sp: Int64 = 0
    sp = sp + 1
    stackNode[sp] = 1
    stackState[sp] = 1
    parent[1] = 0
    pref[1] = 0

    let cnt = HashMap<Int64, Int64>(nn + 1)
    cnt[0] = 1 // 根的前缀和 0 在路径上

    var ans: Int64 = 0

    while (sp > 0) {
        let node = stackNode[sp]
        let st = stackState[sp]
        sp = sp - 1
        if (st == 1) {
            // 进入 node
            sp = sp + 1
            stackNode[sp] = node
            stackState[sp] = 2
            // 安排子节点进入事件
            var i = adjStart[node]
            let en = adjStart[node + 1]
            while (i < en) {
                let to = adjTo[i]
                if (to != parent[node]) {
                    parent[to] = node
                    pref[to] = pref[node] + adjWt[i]
                    sp = sp + 1
                    stackNode[sp] = to
                    stackState[sp] = 1
                }
                i = i + 1
            }
            // 把 node 的 pref 加入 cnt（根已在循环外加入）
            if (node != 1) {
                let pn = pref[node]
                let old = cnt.get(pn)
                match (old) {
                    case Some(vv) => cnt[pn] = vv + 1
                    case None => cnt[pn] = 1
                }
            }
            // 查询 pref[node]-K 的出现次数
            let target = pref[node] - K
            let got = cnt.get(target)
            match (got) {
                case Some(c) => ans = ans + c
                case None => ()
            }
        } else {
            // 离开 node：把自己的 pref 从 cnt 中减去
            let pn = pref[node]
            let cur2 = cnt.get(pn)
            match (cur2) {
                case Some(vv) =>
                    if (vv > 1) {
                        cnt[pn] = vv - 1
                    } else {
                        cnt.remove(pn)
                    }
                case None => ()
            }
        }
    }

    println(ans)
    return 0
}
```
