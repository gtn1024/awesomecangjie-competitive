---
oj: dmy
pid: '201'
title: '[R33D]树加减'
difficulty: 提高
tags:
  - 树
  - 贪心
  - DFS
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$-10^9 \le a_i \le 10^9$，保证 $\sum a_i = 0$。

## 思路

操作 $(u, v, x)$ 要求 $u$ 是 $v$ 的祖先、$a_u > 0$、$a_v < 0$，把 $u$ 的正权 $x$ 转给 $v$。关键性质：正权只能**从祖先流向后代**，无法逆流。

### 判定

设 $\textit{sub}[v]$ 为 $v$ 子树的点权和。一次操作 $(u, v, x)$ 中，若 $u$ 在 $v$ 的子树**外**（即 $u$ 是 $v$ 的真祖先），则只有 $v$ 子树内的某个节点收到正权，子树权和 $\textit{sub}[v]$ 只增不减；若 $u$ 在 $v$ 子树内，则 $u, v$ 同属该子树，子树权和不变。总之 $\textit{sub}[v]$ 不会减小。

要让所有点权归零，必须有 $\textit{sub}[v] = 0$（终态）。又因 $\textit{sub}[v]$ 不减，所以**初态必须满足 $\textit{sub}[v] \le 0$**（对所有 $v \ne 1$；根节点由 $\sum a = 0$ 保证 $\textit{sub}[1] = 0$）。这是必要条件，下面构造说明它也充分。

### 构造

每个 $a_w < 0$ 的节点 $w$ 最终需要从某个祖先处获得 $|a_w|$ 的正权。由于操作允许 $u$ 是 $v$ 的**任意祖先**（不必相邻），中间节点不受影响，于是可对每个负点 $w$ 直接从其祖先处取权。

做法是 DFS 自根向下，维护根到当前节点的祖先栈及每个祖先的剩余正容量 $\textit{rem}[u]$（初值 $\max(0, a_u)$）。访问到 $a_w < 0$ 的 $w$ 时，从最近的、$\textit{rem} > 0$ 的祖先开始贪心取，直到凑满 $|a_w|$，每次取值记一条操作 $(\text{ancestor}, w, \text{take})$。由于 $\textit{sub}[v] \le 0$ 保证 $v$ 的祖先链上正容量总和足以覆盖 $v$ 及其后代的全部需求，贪心一定成功。

合法性验证：对正点 $u$，它的容量 $\textit{rem}$ 从 $a_u$ 单调减少到 $0$，所以每次作为操作源时 $a_u > 0$ 恒成立；对负点 $w$，它累计收到的量恰为 $|a_w|$，最后一次操作前 $a_w < 0$，操作后归零。

### 操作次数

每条操作形如 $(u, w)$，其中 $u$ 是 $w$ 的祖先、$w$ 是负点。不同的 $(u, w)$ 对可以合并为一条，故操作数等于**不同的 (祖先源, 负点汇) 对数**。最坏情形是链 $a = [1, 1, \dots, 1, -(n-1)]$，此时唯一负点要从 $n-1$ 个祖先各取 $1$，共 $n-1$ 条操作，恰好不超过 $n$。其余情形操作数只会更少。

## 复杂度

建邻接表 + BFS 求父节点 + 反向累加子树和 + 一次 DFS 贪心，均为 $O(n)$；贪心内层虽扫描祖先，但每个祖先一旦容量耗尽就不再访问，整体摊还 $O(n)$。空间 $O(n)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main(): Int64 {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 读 n-1 条边
    var eu = Array<Int64>(nn - 1, { _ => 0 })
    var ev = Array<Int64>(nn - 1, { _ => 0 })
    for (i in 0..nn - 1) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        eu[i] = line[0]
        ev[i] = line[1]
    }

    // 紧凑邻接表（CSR）
    let deg = Array<Int64>(nn + 2, { _ => 0 })
    for (i in 0..nn - 1) {
        deg[eu[i]] += 1
        deg[ev[i]] += 1
    }
    let head = Array<Int64>(nn + 2, { _ => 0 })
    var total: Int64 = 0
    for (v in 1..=nn) {
        head[v] = total
        total += deg[v]
    }
    let adj = Array<Int64>(total, { _ => 0 })
    let cur = Array<Int64>(nn + 2, { _ => 0 })
    for (i in 0..nn - 1) {
        let u = eu[i]
        let v = ev[i]
        adj[head[u] + cur[u]] = v
        cur[u] += 1
        adj[head[v] + cur[v]] = u
        cur[v] += 1
    }

    // BFS 求父节点和后序（order 反转即后序）
    let parent = Array<Int64>(nn + 1, { _ => 0 })
    let order = Array<Int64>(nn, { _ => 0 })
    var oc: Int64 = 0
    let visited = Array<Bool>(nn + 1, { _ => false })
    visited[1] = true
    order[0] = 1
    oc = 1
    var qh: Int64 = 0
    while (qh < oc) {
        let u = order[qh]
        qh += 1
        var j = head[u]
        let e = j + deg[u]
        while (j < e) {
            let w = adj[j]
            if (!visited[w]) {
                visited[w] = true
                parent[w] = u
                order[oc] = w
                oc += 1
            }
            j += 1
        }
    }

    // sub[v] = 子树点权和，反向 BFS 累加
    let sub = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 0..nn) {
        let v = order[i]
        sub[v] = a[v - 1]
    }
    var idx = nn - 1
    while (idx >= 1) {
        let v = order[idx]
        sub[parent[v]] += sub[v]
        idx -= 1
    }

    // 判定：根 sub[1]==0；非根 sub[v]<=0
    var ok = (sub[1] == Int64(0))
    if (ok) {
        for (v in 2..=nn) {
            if (sub[v] > Int64(0)) {
                ok = false
                break
            }
        }
    }
    if (!ok) {
        println("NO")
        return 0
    }

    // 构造操作：每个 a[w]<0 的节点 w 从最近的有剩余正容量的祖先贪心取 |a[w]|
    // rem[u] = u 的剩余正容量（初始为 max(0, a[u])）
    let rem = Array<Int64>(nn + 1, { _ => 0 })
    for (v in 1..=nn) {
        let av = a[v - 1]
        if (av > Int64(0)) {
            rem[v] = av
        }
    }

    // DFS 维护路径栈 pathArr[0..pathLen-1]（从根到当前节点），pathLen-1 是当前节点
    let childPtr = Array<Int64>(nn + 1, { _ => 0 })
    let pathArr = Array<Int64>(nn + 1, { _ => 0 })
    var pathLen: Int64 = 0
    let stack = Array<Int64>(nn + 1, { _ => 0 })
    var sp: Int64 = 0
    let opU = Array<Int64>(nn + 1, { _ => 0 })
    let opV = Array<Int64>(nn + 1, { _ => 0 })
    let opX = Array<Int64>(nn + 1, { _ => 0 })
    var opCount: Int64 = 0

    stack[0] = 1
    sp = 1
    while (sp > 0) {
        let u = stack[sp - 1]
        if (childPtr[u] == Int64(0)) {
            // 首次进入 u：压入路径
            pathArr[pathLen] = u
            pathLen += 1
            // 若 a[u]<0，从最近容量祖先贪心取 |a[u]|
            let au = a[u - 1]
            if (au < Int64(0)) {
                var need = -au
                var pi = pathLen - 2
                while (pi >= 0 && need > Int64(0)) {
                    let anc = pathArr[pi]
                    if (rem[anc] > Int64(0)) {
                        let take = if (rem[anc] <= need) { rem[anc] } else { need }
                        opU[opCount] = anc
                        opV[opCount] = u
                        opX[opCount] = take
                        opCount += 1
                        rem[anc] -= take
                        need -= take
                    }
                    pi -= 1
                }
            }
        }
        if (childPtr[u] < deg[u]) {
            let ci = childPtr[u]
            childPtr[u] = ci + 1
            let w = adj[head[u] + ci]
            if (w != parent[u]) {
                stack[sp] = w
                sp += 1
            }
        } else {
            pathLen -= 1
            sp -= 1
        }
    }

    let sb = StringBuilder()
    sb.append("YES\n")
    sb.append(opCount)
    sb.append("\n")
    for (i in 0..opCount) {
        sb.append(opU[i])
        sb.append(" ")
        sb.append(opV[i])
        sb.append(" ")
        sb.append(opX[i])
        sb.append("\n")
    }
    print(sb.toString())
    return 0
}
```
