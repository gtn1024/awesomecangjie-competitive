---
oj: dmy
pid: '141'
title: '[R23F]寻路'
difficulty: 提高
tags:
  - 图论
  - 割点
  - DFS 树
  - 差分
timeLimit: 2s
memoryLimit: 256m
---

## 题目

给定一个 $n$ 个点 $m$ 条边的无向连通图。对每个 $i=0,1,\dots,n$，称一条从 $1$ 到 $n$ 的路径是符合条件的，当且仅当路径中被访问了两次的点（重访点）不超过 $i$ 个，且其余每个点至多被访问一次。若存在至少一条符合条件的路径经过点 $v$，则称 $v$ 可被计入。求出 $n+1$ 个答案（每个 $i$ 对应的可计入点数）的异或和。

> 对于 $100\%$ 的数据，$1\le n\le 10^6$，$1\le m\le 10^6$，图连通且无重边自环。

## 思路

这里的「路径」实际上是一条游走（walk）：每个点至多被访问两次，且被访问两次的点数不超过 $i$。

对每个点 $v$，设 $\text{cost}(v)$ 为所有经过 $v$ 的 $1\to n$ 游走中，重访点数的最小值。则第 $i$ 个答案恰好等于 $\#\{v:\text{cost}(v)\le i\}$，因此只需算出每个点的 $\text{cost}$ 再统计。

**关键结论**：$\text{cost}(v)$ 等于满足下述条件的割点 $a$ 的个数：$v$ 位于 $G-a$ 中一个既不包含 $1$ 也不包含 $n$ 的连通分量内。

- 下界：若删去 $a$ 后 $v$ 所在的分量不含 $1$ 与 $n$，则任意 $1\to n$ 的游走进入该分量必须经过 $a$，离开又必须再经过 $a$，故 $a$ 至少被访问两次，且这些 $a$ 互不相同。
- 上界：考虑 $v$ 上方的割点链 $a_1,a_2,\dots,a_k$（$a_1$ 最靠近 $1$、$n$ 所在的主干）。构造游走：先沿一条简单 $1\to n$ 路径走，并让路径绕经 $a_1$；到达 $a_1$ 后沿链下探到 $v$ 再原路返回，之后继续走到 $n$。在每段点双连通分量内，任意两点间存在两条点不交的路径，可以走一条下去、另一条上来，于是分量内部的点都至多被访问一次，只有链上的割点 $a_1,\dots,a_k$ 被访问两次。

**用 DFS 树计算**：以 $1$ 为根做 DFS，求出时间戳 $\text{dfn}$、$\text{low}$ 与子树大小 $\text{sz}$。标准结论：对点 $a$ 的任意 DFS 儿子 $c$，子树 $c$ 构成 $G-a$ 的一个连通分量，当且仅当 $\text{low}[c]\ge\text{dfn}[a]$（根的儿子也满足该条件，此时每个儿子子树都是 $G-1$ 的分量）。该分量总是包含 $1$ 当且仅当 $a=1$，其余情况下 $1$ 都在 $a$ 的上方，因此只要再检查分量中是否含 $n$：不含 $n$ 的分量即为悬挂分量。

于是对每个满足 $\text{low}[c]\ge\text{dfn}[a]$ 且 $n\notin\text{subtree}(c)$ 的二元组 $(a,c)$，给子树 $c$ 内所有点的 $\text{cost}$ 加 $1$。子树对应欧拉序上的连续区间 $[\text{dfn}[c],\text{dfn}[c]+\text{sz}[c]-1]$，用差分数组做区间加，最后扫一遍前缀和即得每个点的 $\text{cost}$。注意割点 $a$ 不会出现在自己儿子的子树里，因此不会被自己计入。

最后统计 $\text{cnt}[j]=\#\{v:\text{cost}(v)=j\}$，答案数组满足 $\text{ans}[i]=\sum_{j\le i}\text{cnt}[j]$，输出 $\bigoplus_{i=0}^{n}\text{ans}[i]$ 即可。

## 复杂度

- 时间复杂度：$O(n+m)$，一次 DFS 加一次差分扫描。
- 空间复杂度：$O(n+m)$。

## 仓颉实现

```cangjie
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0
var glen: Int64 = 0

func nextInt(): Int64 {
    while (gpos < glen) {
        if (Int64(gdata[gpos]) > 32) {
            break
        }
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < glen) {
        let b = Int64(gdata[gpos])
        if (b <= 32) {
            break
        }
        x = x * 10 + b - 48
        gpos += 1
    }
    return x
}

func readAll(): Array<Byte> {
    let reader = getStdIn()
    return reader.readToEnd().getOrThrow().toArray()
}

main(): Int64 {
    gdata = readAll()
    glen = gdata.size
    let n = nextInt()
    let m = nextInt()

    // 邻接表（链表式）
    let head = Array<Int64>(n + 1, { _ => 0 })
    let to = Array<Int64>(2 * m + 1, { _ => 0 })
    let nxt = Array<Int64>(2 * m + 1, { _ => 0 })
    var ec: Int64 = 0
    for (_ in 0..m) {
        let u = nextInt()
        let v = nextInt()
        ec += 1
        to[ec] = v
        nxt[ec] = head[u]
        head[u] = ec
        ec += 1
        to[ec] = u
        nxt[ec] = head[v]
        head[v] = ec
    }

    // 以 1 为根的 DFS 生成树：dfn/low/sz/par，显式栈避免递归爆栈
    let dfn = Array<Int64>(n + 1, { _ => 0 })
    let low = Array<Int64>(n + 1, { _ => 0 })
    let par = Array<Int64>(n + 1, { _ => 0 })
    let sz = Array<Int64>(n + 1, { _ => 0 })
    let tin2v = Array<Int64>(n + 1, { _ => 0 })
    let diff = Array<Int64>(n + 2, { _ => 0 })
    let stk = Array<Int64>(n + 1, { _ => 0 })
    let ptr = Array<Int64>(n + 1, { _ => 0 })

    var tm: Int64 = 0
    for (s in 1..=n) {
        if (dfn[s] != 0) {
            continue
        }
        tm += 1
        dfn[s] = tm
        low[s] = tm
        sz[s] = 1
        tin2v[tm] = s
        var top: Int64 = 0
        top += 1
        stk[top] = s
        ptr[top] = head[s]
        while (top > 0) {
            let u = stk[top]
            let e = ptr[top]
            if (e != 0) {
                ptr[top] = nxt[e]
                let v = to[e]
                if (dfn[v] == 0) {
                    par[v] = u
                    tm += 1
                    dfn[v] = tm
                    low[v] = tm
                    sz[v] = 1
                    tin2v[tm] = v
                    top += 1
                    stk[top] = v
                    ptr[top] = head[v]
                } else if (v != par[u] && dfn[v] < dfn[u] && dfn[v] < low[u]) {
                    low[u] = dfn[v]
                }
            } else {
                top -= 1
                let p = par[u]
                if (p != 0) {
                    if (low[u] < low[p]) {
                        low[p] = low[u]
                    }
                    sz[p] += sz[u]
                    // 子树 u 是 G - p 的一个连通分量，当且仅当 low[u] >= dfn[p]
                    // 若其中不含 n，则该分量内的所有点都要多记一次重访
                    if (low[u] >= dfn[p]) {
                        let tin = dfn[u]
                        if (!(dfn[n] >= tin && dfn[n] < tin + sz[u])) {
                            diff[tin] += 1
                            diff[tin + sz[u]] -= 1
                        }
                    }
                }
            }
        }
    }

    // 按欧拉序前缀和得到每个点的重访次数，再统计答案分布
    let cnt = Array<Int64>(n + 2, { _ => 0 })
    var run: Int64 = 0
    for (t in 1..=n) {
        run += diff[t]
        cnt[run] += 1
    }
    var ans: Int64 = 0
    run = 0
    for (i in 0..=n) {
        run += cnt[i]
        ans ^= run
    }
    println(ans.toString())
    return 0
}
```
