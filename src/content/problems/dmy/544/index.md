---
oj: dmy
pid: '544'
title: '连通染色'
difficulty: 提高+
tags:
  - 换根 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 10^5$，$2 \le M \le 10^9$，输入的边构成一棵树，$M$ 不一定是质数。

## 思路

**把黑块钉在必须为黑的那个点上。** 合法方案的黑点集合是一棵非空连通块。若要求 $v$ 为黑，黑块必然包含 $v$，于是可以按 $v$ 把树切成「$v$ 的子树」与「子树以外的部分」两块分别计数，再在 $v$ 处拼起来。

**子树一侧。** 以 $1$ 为根，定义 $f_u$ 为 $\text{subtree}(u)$ 内的染色数，要求 $u$ 为黑，且子树内的黑点非空、连通且包含 $u$。

考虑 $u$ 的每个儿子 $v$。若 $v$ 的子树里有黑点，由于 $u$ 为黑且黑块连通，这些黑点必须通过 $v$ 与 $u$ 相连，于是那一整块正是「$v$ 为黑、子树内黑点连通含 $v$」的形态，有 $f_v$ 种；反之 $v$ 的子树可以全白，只有 $1$ 种。各儿子子树之间没有边相连，选择互相独立，于是

$$f_u=\prod_{v\text{ 是 }u\text{ 的儿子}}\big(1+f_v\big),\qquad f_{\text{叶}}=1.$$

**子树外一侧。** 记 $T_u$ 为「$u$ 的子树外」再加上 $u$ 自己，即删去 $u$ 的所有真后代后剩下的部分。定义 $g_u$ 为 $T_u$ 内的染色数，要求 $u$ 为黑，且 $T_u$ 内的黑点连通且包含 $u$。

对根来说 $T_1=\{1\}$，只有一种染色，$g_1=1$。设 $v$ 是 $u$ 的儿子，则 $T_v=T_u\cup\bigcup_{w\text{ 是 }u\text{ 的儿子},\,w\ne v}\text{subtree}(w)$。按 $u$ 的颜色分两类：

- $u$ 为白：黑点只能落在兄弟子树里，但它们要与 $v$ 相连只能经过白点 $u$，不可能；所以 $T_v\setminus\{v\}$ 全白，只有 $1$ 种。
- $u$ 为黑：$T_u$ 部分的染色有 $g_u$ 种；每个兄弟 $w$ 的子树或全白，或是「$w$ 为黑且连通含 $w$」的形态，各有 $1+f_w$ 种，彼此独立。

于是

$$g_v=1+g_u\prod_{w\text{ 是 }u\text{ 的儿子},\,w\ne v}\big(1+f_w\big).$$

**合并答案，不重不漏。** 整棵树被 $v$ 分成 $\text{subtree}(v)$ 与 $T_v$，两块只交于 $v$，而 $v$ 在两块的计数里都固定为黑，所以「子树内的合法染色 + $T_v$ 内的合法染色」与「$v$ 为黑的整树合法染色」一一对应：拼接时黑块是两个含 $v$ 的连通块的并，仍然连通；拆分时任取黑块内两点，它们之间的路径全黑且落在同一块里，所以每块里的黑点仍连通。因此

$$ans_v=f_v\cdot g_v \bmod M.$$

「黑块没有跨过 $v$」的情形并不遗漏：黑块只落在子树内时，对应 $g_v$ 取第一项（$T_v$ 中除 $v$ 外全白）；黑块只落在子树外时不可能，因为 $v$ 本身必须为黑。

**为什么不能直接除法。** 想从 $u$ 的总积里除掉 $1+f_v$ 是最自然的写法，但 $M$ 不保证是质数，$1+f_v$ 也未必与 $M$ 互素，逆元可能不存在。改为在自上而下遍历时，把一个点所有儿子的 $1+f_w$ 排成数组，预处理前缀积与后缀积，则「其它儿子」的积等于 $pre_{i-1}\cdot suf_{i+1}$，$O(1)$ 取出，全过程只有乘法和取模。乘积最大约 $10^{18}$，落在 64 位整数范围内。

**实现。** $N$ 可达 $10^5$，深度可能很大，递归会爆栈，所以用显式队列求出一个「父结点排在子结点之前」的遍历序：逆序扫一遍算 $f$，正序扫一遍按 $g_v=1+g_u\cdot pre_{i-1}\cdot suf_{i+1}$ 推出儿子的 $g$，最后输出 $f_v\cdot g_v \bmod M$。边用链式前向星存储，前缀积、后缀积与儿子列表用定长数组在结点间复用。

## 复杂度

每个点和每条边都被常数次访问，时间 $O(N)$；链式前向星与各结点状态数组均为 $O(N)$，空间 $O(N)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0

func nextInt(): Int64 {
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) { gpos += 1 }
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
    let m = nextInt()
    let nn = n
    let head = Array<Int64>(nn + 1, { _ => -1 })
    let to = Array<Int64>(2 * nn, { _ => 0 })
    let nxt = Array<Int64>(2 * nn, { _ => -1 })
    var ec: Int64 = 0
    for (i in 0..(nn - 1)) {
        let x = nextInt()
        let y = nextInt()
        to[ec] = y
        nxt[ec] = head[x]
        head[x] = ec
        ec += 1
        to[ec] = x
        nxt[ec] = head[y]
        head[y] = ec
        ec += 1
    }

    let par = Array<Int64>(nn + 1, { _ => 0 })
    let order = Array<Int64>(nn + 1, { _ => 0 })
    var cnt: Int64 = 0
    order[0] = 1
    par[1] = 0
    cnt = 1
    var i: Int64 = 0
    while (i < cnt) {
        let u = order[i]
        i += 1
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (v != par[u]) {
                par[v] = u
                order[cnt] = v
                cnt += 1
            }
            e = nxt[e]
        }
    }

    let dp = Array<Int64>(nn + 1, { _ => 1 })
    var idx = cnt - 1
    while (idx >= 0) {
        let u = order[idx]
        var prod: Int64 = 1
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (v != par[u]) {
                prod = prod * ((dp[v] + 1) % m) % m
            }
            e = nxt[e]
        }
        dp[u] = prod
        idx -= 1
    }

    let g = Array<Int64>(nn + 1, { _ => 0 })
    let pre = Array<Int64>(nn + 2, { _ => 1 })
    let suf = Array<Int64>(nn + 2, { _ => 1 })
    let kids = Array<Int64>(nn + 1, { _ => 0 })
    g[1] = 1
    var oi: Int64 = 0
    while (oi < cnt) {
        let u = order[oi]
        oi += 1
        var k: Int64 = 0
        var e = head[u]
        while (e != -1) {
            let v = to[e]
            if (v != par[u]) {
                kids[k] = v
                k += 1
            }
            e = nxt[e]
        }
        pre[0] = 1
        var j: Int64 = 0
        while (j < k) {
            pre[j + 1] = pre[j] * ((dp[kids[j]] + 1) % m) % m
            j += 1
        }
        suf[k] = 1
        j = k - 1
        while (j >= 0) {
            suf[j] = suf[j + 1] * ((dp[kids[j]] + 1) % m) % m
            j -= 1
        }
        j = 0
        while (j < k) {
            let others = pre[j] * suf[j + 1] % m
            g[kids[j]] = (1 + g[u] * others % m) % m
            j += 1
        }
    }

    for (v in 1..=nn) {
        println(dp[v] * g[v] % m)
    }
}
```

</details>
