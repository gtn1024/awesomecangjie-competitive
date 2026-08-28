---
oj: dmy
pid: '456'
title: '[R73F] 无根树'
difficulty: 提高
tags:
  - 树
  - LCA（倍增）
  - 差分
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$n \le 2 \times 10^5$，$n$ 为偶数，每种颜色恰好出现两次。

## 思路

把树定根在 $1$。对于颜色对 $(u, v)$，以 $r$ 为根时两个顶点深度相同，等价于 $dist(r, u) = dist(r, v)$。

沿着路径 $u \to v$ 分析：设 $d = dist(u, v)$，路径上的点为 $x_0 = u, x_1, \ldots, x_d = v$。任意顶点 $r$ 都挂在某个 $x_i$ 的「旁支」上（$i = 0$ 表示 $u$ 侧的连通块，依此类推），此时

$$
dist(r, u) - dist(r, v) = (dist(r, x_i) + i) - (dist(r, x_i) + d - i) = 2i - d
$$

- 若 $d$ 为奇数，$2i - d$ 恒为奇数，不可能等于 $0$，该颜色对任何 $r$ 都合法，无需处理；
- 若 $d$ 为偶数，$2i - d = 0$ 当且仅当 $i = d/2$，即 $r$ 落在以路径中点 $m$ 为中心的连通块中：删掉 $m$ 朝向 $u$、$v$ 的两条边后含 $m$ 的那一块。这些 $r$ 都是非法根。

所以答案等于 $n$ 减去所有颜色禁区（上述连通块）的并集大小。

用定根 $1$ 后的子树来描述禁区。设 $l = \operatorname{lca}(u, v)$，$d_u = depth(u) - depth(l)$，$d_v = depth(v) - depth(l)$：

- **$d_u = d_v$**：路径中点是 $l$，禁区分成三块后剩下的是全集去掉 $l$ 的「朝向 $u$ 的儿子」子树与「朝向 $v$ 的儿子」子树，即
  $$
  \text{禁区} = V \setminus (subtree(a) \cup subtree(b))
  $$
  其中 $a, b$ 分别是 $l$ 朝 $u$、$v$ 方向的两个儿子；
- **$d_u > d_v$**（对称地处理 $d_u < d_v$）：设 $t = (d_u - d_v) / 2$，路径中点是 $l$ 沿 $u$ 方向往下第 $t$ 个点 $m$，禁区为
  $$
  \text{禁区} = subtree(m) \setminus subtree(a)
  $$
  其中 $a$ 是 $m$ 朝向 $u$ 的儿子。

两种禁区都能写成若干子树指示函数的 $\pm 1$ 线性组合：子树类用 Euler 序上的区间加/减表示，$V \setminus (T_a \cup T_b)$ 额外需要一个全局 $+1$。于是对每对同色顶点做 $O(1)$ 次差分区间修改，最后做一遍前缀和，所有位置值为 $0$ 的顶点就是合法根，计数即答案。

需要的基础设施：迭代 DFS 求 `parent`、`depth`、前序序号 `tin` 与子树大小 `sz`（迭代避免递归爆栈），倍增表用于 `lca` 与「向上跳 $k$ 步」。

## 复杂度

时间 $O(n \log n)$，空间 $O(n \log n)$（倍增表 $19 \times (n+1)$）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const LOG: Int64 = 19

func jumpUp(up: Array<Array<Int64>>, u0: Int64, steps0: Int64): Int64 {
    var u = u0
    var steps = steps0
    var j: Int64 = 0
    while (steps > 0) {
        if (steps % 2 == 1) {
            u = up[j][u]
        }
        steps = steps / 2
        j = j + 1
    }
    return u
}

func lca(up: Array<Array<Int64>>, depth: Array<Int64>, u0: Int64, v0: Int64): Int64 {
    var u = u0
    var v = v0
    if (depth[u] < depth[v]) {
        let tmp = u
        u = v
        v = tmp
    }
    u = jumpUp(up, u, depth[u] - depth[v])
    if (u == v) {
        return u
    }
    var j = LOG - 1
    while (j >= 0) {
        if (up[j][u] != up[j][v]) {
            u = up[j][u]
            v = up[j][v]
        }
        j = j - 1
    }
    return up[0][u]
}

func addRange(delt: Array<Int64>, l: Int64, r: Int64, v: Int64) {
    delt[l] = delt[l] + v
    delt[r] = delt[r] - v
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let colors = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let head = Array<Int64>(nn + 1, { _ => -1 })
    let tv = Array<Int64>(2 * nn, { _ => 0 })
    let nx = Array<Int64>(2 * nn, { _ => 0 })
    var eidx: Int64 = 0
    for (i in 0..(nn - 1)) {
        let uv = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let u = uv[0]
        let v = uv[1]
        tv[eidx] = v
        nx[eidx] = head[u]
        head[u] = eidx
        eidx = eidx + 1
        tv[eidx] = u
        nx[eidx] = head[v]
        head[v] = eidx
        eidx = eidx + 1
    }
    // 迭代 DFS：求 parent、depth、tin（前序序号）、order
    let parent = Array<Int64>(nn + 1, { _ => 0 })
    let depth = Array<Int64>(nn + 1, { _ => 0 })
    let tin = Array<Int64>(nn + 1, { _ => -1 })
    let order = Array<Int64>(nn, { _ => 0 })
    let stk = Array<Int64>(nn, { _ => 0 })
    let sz = Array<Int64>(nn + 1, { _ => 1 })
    parent[1] = 1
    stk[0] = 1
    var sp: Int64 = 1
    var cnt: Int64 = 0
    while (sp > 0) {
        let u = stk[sp - 1]
        if (tin[u] == -1) {
            tin[u] = cnt
            order[cnt] = u
            cnt = cnt + 1
        }
        if (head[u] == -1) {
            sp = sp - 1
        } else {
            let uv = head[u]
            head[u] = nx[uv]
            let v = tv[uv]
            if (v == parent[u]) {
                continue
            }
            parent[v] = u
            depth[v] = depth[u] + 1
            stk[sp] = v
            sp = sp + 1
        }
    }
    // 子树大小（逆前序累加）
    var ii = cnt - 1
    while (ii >= 1) {
        let u = order[ii]
        let p = parent[u]
        sz[p] = sz[p] + sz[u]
        ii = ii - 1
    }
    // 倍增表
    let up = Array<Array<Int64>>(LOG, { _ => Array<Int64>(nn + 1, { _ => 0 }) })
    for (v in 1..=nn) {
        up[0][v] = parent[v]
    }
    for (j in 1..LOG) {
        for (v in 1..=nn) {
            up[j][v] = up[j - 1][up[j - 1][v]]
        }
    }
    // 每种颜色的两个顶点：若路径长度为奇数则无限制；
    // 否则 r 使两顶点深度相同当且仅当 r 落在路径「中点连通块」。
    let k = nn / 2
    let first = Array<Int64>(k + 1, { _ => 0 })
    let delt = Array<Int64>(nn + 2, { _ => 0 })
    var global: Int64 = 0
    for (i in 0..nn) {
        let c = colors[i]
        let v = i + 1
        if (first[c] == 0) {
            first[c] = v
        } else {
            let u = first[c]
            let l = lca(up, depth, u, v)
            let du = depth[u] - depth[l]
            let dv = depth[v] - depth[l]
            if ((du + dv) % 2 == 1) {
                continue
            }
            if (du == dv) {
                // 两顶点同深度：禁区为全集去掉 l 的两个儿子子树
                let a = jumpUp(up, u, du - 1)
                let b = jumpUp(up, v, dv - 1)
                global = global + 1
                addRange(delt, tin[a], tin[a] + sz[a], -1)
                addRange(delt, tin[b], tin[b] + sz[b], -1)
            } else {
                // 深度不同：禁区为以路径中点为根的子树去掉朝深顶点的一支
                var uu = u
                var vv = v
                var duu = du
                var dvv = dv
                if (duu < dvv) {
                    let tmpU = uu
                    uu = vv
                    vv = tmpU
                    let tmpD = duu
                    duu = dvv
                    dvv = tmpD
                }
                let t = (duu - dvv) / 2
                let m = jumpUp(up, uu, duu - t)
                let a = jumpUp(up, uu, duu - t - 1)
                addRange(delt, tin[m], tin[m] + sz[m], 1)
                addRange(delt, tin[a], tin[a] + sz[a], -1)
            }
        }
    }
    // 差分前缀和：值为 0 的顶点即合法的根
    var acc: Int64 = 0
    var ans: Int64 = 0
    for (i in 0..nn) {
        acc = acc + delt[i]
        if (acc + global == 0) {
            ans = ans + 1
        }
    }
    println(ans)
}
```