---
oj: dmy
pid: '444'
title: '[R71F] 高塔传讯'
difficulty: 普及+/提高
tags:
  - 树
  - 笛卡尔树
  - 贪心
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$n \le 2 \times 10^5$，$w_i \le 10^9$，所有 $h_i$ 两两不同且构成 $1..n$ 的排列。

## 思路

先刻画「塔 $u$ 的数据能被接收站 $v$ 接收」这个条件。以高度为优先级构造一棵**笛卡尔树**：整棵树中高度最大的塔作为根，删掉它后，每个连通块递归地按同样方式建子树。这样构造出的树有一个关键性质——$u$ 是 $u$ 到 $v$ 路径上最高的塔，当且仅当 $u$ 是笛卡尔树中 $v$ 的祖先（因为笛卡尔树上任意两点路径上最高的点恰是两点的最近公共祖先）。

于是选两个接收站 $a, b$，能获得的价值就是「笛卡尔树根到 $a$ 的路径」与「根到 $b$ 的路径」上所有塔的价值并集。记 $f(x)$ 为根到 $x$ 的路径价值之和，则答案为：

$$f(a) + f(b) - f(\operatorname{lca}(a, b))$$

枚举最近公共祖先 $l$。固定 $l$ 时，$a, b$ 必须来自 $l$ 的**不同分支**：$l$ 自身算一个分支，每个儿子子树各算一个分支。由于 $w_i \ge 1$，$f$ 沿根向下的方向严格递增，每个分支的最优取法就是该分支中 $f$ 最大的节点。因此对每个节点维护其各分支 $f$ 最大值中的最大两个（自身贡献 $f(l)$，每个儿子子树贡献子树内 $f$ 的最大值 $g(\text{son})$），两者之和减去 $f(l)$ 即为以 $l$ 为最近公共祖先的最优答案，取全局最大值即可。

笛卡尔树可用并查集构建：按高度**升序**处理塔 $u$（此时已处理的邻居都比 $u$ 矮），每个已处理节点所在的连通块用并查集维护，块的代表是块内最高的塔；把 $u$ 的每个邻居所在块的代表挂成 $u$ 的儿子（注意去重），并把这些块并入 $u$ 的块。处理完所有塔后，树根就是最高塔。

## 复杂度

时间 $O(n \log n)$（排序高度，实际为排列可桶排到 $O(n \alpha(n))$），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

class DSU {
    var fa: Array<Int64>
    init(n: Int64) {
        fa = Array<Int64>(n, { i => i })
    }
    func find(x: Int64): Int64 {
        var r = x
        while (fa[r] != r) {
            r = fa[r]
        }
        var y = x
        while (fa[y] != y) {
            let t = fa[y]
            fa[y] = r
            y = t
        }
        return r
    }
    func union(a: Int64, b: Int64): Unit {
        let ra = find(a)
        let rb = find(b)
        if (ra != rb) {
            fa[ra] = rb
        }
    }
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let h = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let w = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let adj = Array<ArrayList<Int64>>(n, { _ => ArrayList<Int64>() })
    for (_ in 0..(n - 1)) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let u = Int64.parse(line[0]) - 1
        let v = Int64.parse(line[1]) - 1
        adj[u].add(v)
        adj[v].add(u)
    }

    // 高度是 1..n 的排列，pos[x] 为高度 x 的塔
    let pos = Array<Int64>(n + 1, { _ => 0 })
    for (i in 0..n) {
        pos[h[i]] = i
    }

    // 按高度升序用并查集构建笛卡尔树：父塔高于子塔
    let parent = Array<Int64>(n, { _ => -1 })
    let proc = Array<Bool>(n, { _ => false })
    let dsu = DSU(n)
    for (hv in 1..=n) {
        let u = pos[hv]
        for (v in adj[u]) {
            if (proc[v]) {
                let r = dsu.find(v)
                if (r != u && parent[r] == -1) {
                    parent[r] = u
                }
                dsu.union(r, u)
            }
        }
        proc[u] = true
    }

    // f[x] = 笛卡尔树根到 x 的路径价值和，按高度降序（父先于子）
    let f = Array<Int64>(n, { _ => 0 })
    var hv = n
    while (hv >= 1) {
        let u = pos[hv]
        let p = parent[u]
        if (p >= 0) {
            f[u] = f[p] + w[u]
        } else {
            f[u] = w[u]
        }
        hv -= 1
    }

    // g[x] = x 子树内最大的 f，按高度升序（子先于父）
    let g = Array<Int64>(n, { i => f[i] })
    var hv2: Int64 = 1
    while (hv2 <= n) {
        let u = pos[hv2]
        let p = parent[u]
        if (p >= 0 && g[u] > g[p]) {
            g[p] = g[u]
        }
        hv2 += 1
    }

    // 对每个节点 u 作为 LCA：候选分支为 u 自身与每个儿子子树，取其中最大两个
    let best1 = Array<Int64>(n, { i => f[i] })
    let best2 = Array<Int64>(n, { _ => 0 })
    for (u in 0..n) {
        let p = parent[u]
        if (p >= 0) {
            let gu = g[u]
            if (gu > best1[p]) {
                best2[p] = best1[p]
                best1[p] = gu
            } else if (gu > best2[p]) {
                best2[p] = gu
            }
        }
    }

    var ans: Int64 = 0
    for (u in 0..n) {
        if (best2[u] > 0) {
            let cur = best1[u] + best2[u] - f[u]
            if (cur > ans) {
                ans = cur
            }
        }
    }
    println(ans)
}
```
