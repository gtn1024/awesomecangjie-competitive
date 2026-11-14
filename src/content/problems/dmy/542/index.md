---
oj: dmy
pid: '542'
title: '最大白色连通子树'
difficulty: 提高+
tags:
  - 换根 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le n \le 2\times 10^5$，$a_i \in \{0,1\}$，输入的边构成一棵树。

## 思路

**点权化。** 白点计 $+1$、黑点计 $-1$，即令 $w_v = 1$（白）或 $-1$（黑）。连通子图的得分就是其中所有点权之和。问题变成：对每个 $v$，求包含 $v$ 的连通子图的最大点权和。

**定根后的子树方向。** 以 $1$ 为根。设

$$down_v = w_v + \sum_{c \in son(v)} \max(0, down_c).$$

含义是「只向下延伸、必须包含 $v$」时的最大得分。正确性来自连通性的结构：要了某个孩子 $c$，就必须在 $c$ 的子树里取一棵包含 $c$ 的连通块，而那部分的最优值正是 $down_c$；每个孩子相互独立，所以对孩子只看「取收益为正的那些」。边界是叶子，此时 $down_v = w_v$。

**换根：父方向的贡献。** 设 $up_v$ 表示「$v$ 的父方向能给 $v$ 带来的最优贡献」，规定 $up_v \ge 0$（不取父方向时贡献为 $0$），根的 $up_1 = 0$。

把 $v$ 的父结点记作 $p$。若以 $p$ 为「必须包含的点」、只往除 $v$ 子树以外的方向延伸，最优得分是

$$f(v) = w_p + up_p + \sum_{c \in son(p),\, c \ne v} \max(0, down_c),$$

于是 $up_v = \max(0, f(v))$。注意 $up_p$ 是 $p$ 从父方向拿到的收益，$v$ 通过 $p$ 连出去时必须经过 $p$，因此 $w_p$ 与 $up_p$ 都要计入，而 $v$ 自己的 $w_v$ 不在 $f(v)$ 里，不会重复。

**避免维护前二大。** 求和式里有 $\max(0, down_c)$，直接看 $\max(0, down_v)$ 即可：由于

$$f(v) = (down_p - \max(0, down_v)) + up_p,$$

把 $down_p$ 里属于 $v$ 的那一项减掉就得到「其余部分」。这依赖 $down$ 的定义是精确的求和（不是取最大），所以每个点的 $f(v)$ 都能 $O(1)$ 求出，不需要记录孩子的最大值和次大值，也不需要前缀后缀积。

**最终答案。** 包含 $v$ 的连通子图，可以同时向子树方向和父方向延伸，两部分的取舍互不干扰：

$$ans_v = w_v + \sum_{c \in son(v)} \max(0, down_c) + \max(0, up_v) = down_v + up_v .$$

**计算顺序。** 用迭代 BFS 求出父结点与 BFS 序（$n$ 达到 $2\times 10^5$，递归会爆栈）。把 $down$ 初始化为 $w$，再按 BFS 序的 **逆序** 回推，保证孩子先于父亲结算；$up$ 则按 BFS 序 **正序** 推，保证父亲的 $up$ 已经算好。

**边界。** 全黑时 $w_v = -1$，$down_v = -1$，$up_v = \max(0, -1 - 0 + 0) = 0$，答案 $-1$，符合「至少包含 $v$ 自己」的要求，答案允许为负。

## 复杂度

每个点被常数次访问，邻接表用头指针 + 后继数组存储，时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0

func nextInt(): Int64 {
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) {
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < gdata.size && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    return x
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    let a = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        if (nextInt() == 1) {
            a[i] = 1
        } else {
            a[i] = -1
        }
    }
    let m = n - 1
    let head = Array<Int64>(n, { _ => -1 })
    let nxt = Array<Int64>(2 * m, { _ => 0 })
    let to = Array<Int64>(2 * m, { _ => 0 })
    var ec = 0
    for (_ in 0..m) {
        let u = nextInt() - 1
        let v = nextInt() - 1
        to[ec] = v
        nxt[ec] = head[u]
        head[u] = ec
        ec += 1
        to[ec] = u
        nxt[ec] = head[v]
        head[v] = ec
        ec += 1
    }

    let par = Array<Int64>(n, { _ => -2 })
    let order = Array<Int64>(n, { _ => 0 })
    var oc = 0
    par[0] = -1
    order[0] = 0
    oc = 1
    var qi = 0
    while (qi < oc) {
        let u = order[qi]
        qi += 1
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (v != par[u]) {
                par[v] = u
                order[oc] = v
                oc += 1
            }
            e = nxt[e]
        }
    }

    let down = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        down[i] = a[i]
    }
    var i = n - 1
    while (i >= 1) {
        let v = order[i]
        if (down[v] > 0) {
            down[par[v]] += down[v]
        }
        i -= 1
    }

    let up = Array<Int64>(n, { _ => 0 })
    for (j in 1..n) {
        let v = order[j]
        let p = par[v]
        var d = down[p]
        if (down[v] > 0) {
            d -= down[v]
        }
        let val = d + up[p]
        if (val > 0) {
            up[v] = val
        }
    }

    for (v in 0..n) {
        if (v > 0) {
            print(" ")
        }
        print(down[v] + up[v])
    }
    println()
}
```

</details>
