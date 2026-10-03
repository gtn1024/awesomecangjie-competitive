---
oj: dmy
pid: '249'
title: '[R40F] Yet another tree problem'
difficulty: 提高
tags:
  - 树形 DP
  - 换根 DP
  - 数论
timeLimit: 2.5s
memoryLimit: 1024m
---

> 数据规模：$2 \le n \le 5 \times 10^5$，$0 \le k < 998244353$。

## 思路

设 $S(u,v)$ 为路径 $u \to v$ 上所有 `sqr` 操作的参数之和。路径上某条 `* C` 的边，若它之后（通往 $v$ 的方向）累积经过 $S'$ 次平方操作，则因子 $C$ 最终变成 $C^{2^{S'}}$。因此

$$d(u,v) = \prod_{\text{路径上的 } * C \text{ 边}} C^{2^{S'}}$$

其中 $S'$ 是该边之后到 $v$ 的平方次数之和。

**状态压缩**：指数 $2^S$ 只需要它在模 $P-1$（$P = 998244353$）下的值。对 $S < 23$，$2^S$ 互不相同；对 $S \ge 23$，

$$2^S \equiv 2^{23} \cdot \left(2^{S-23} \bmod 119\right) \pmod{P-1}$$

而 $2^t \bmod 119$ 以 24 为周期，故指数状态总共只有 $23 + 24 = 47$ 种，记为 $\operatorname{Map}(S)$：状态 $0..22$ 代表 $S = 0..22$，状态 $23+j$ 代表 $S \ge 23$ 且 $S \equiv 23+j \pmod{24}$。

**子树 DP**：以 1 为根，设 $f[u][i]$ 为子树 $u$ 中所有满足 $\operatorname{Map}(S(u,v)) = i$ 的 $d(u,v)$ 之和，初始 $f[u][0] = 1$（$d(u,u) = 1$）。合并子节点 $v$（边参数 $k$）：

- 边为 `sqr k`：从 $u$ 出发先平方 $1$ 仍为 $1$，路径值不变，状态加 $k$：$f[u][\operatorname{Map}(S+k)] \mathrel{+}= f[v][i]$；
- 边为 `* k`：状态不变，所有路径值乘 $k^{2^S}$：$f[u][i] \mathrel{+}= f[v][i] \cdot k^{e_i}$，其中 $e_i$ 是状态 $i$ 对应的指数 $2^S \bmod (P-1)$。

同一状态的路径加 $k$ 后的新状态只由 $\operatorname{Map}(S)$ 和 $k$ 决定，故 `sqr` 的转移可直接按状态计算，无需知道 $S$ 本身。

**换根**：令 $T[u][i]$ 为所有 $j$ 的 $d(u,j)$ 按状态分类之和（含 $u$ 自身），则答案 $\operatorname{ans}(u) = \sum_i T[u][i]$。设 $T_e$ 为跨过边 $e$ 的变换（`sqr` 为状态重排、`*` 为逐状态乘 $k^{e_i}$），对子节点 $v$（父边 $e$）：

$$T[v] = T_e\big(T[u] - T_e(f[v])\big) + f[v]$$

其中 $T_e(f[v])$ 正是子树 DP 中 $f[v]$ 对 $f[u]$ 的贡献，$T[u] - T_e(f[v])$ 即「$v$ 子树之外」所有节点按状态分类的贡献。实现时 $T$ 直接覆盖 $f$ 的数组：先自底向上算 $f$，再自顶向下换根。

## 复杂度

时间 $O(47n)$，空间 $O(47n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353
const ST: Int64 = 47

var head = Array<Int64>(0, { _ => 0 })
var eto = Array<Int64>(0, { _ => 0 })
var enxt = Array<Int64>(0, { _ => 0 })
var eval = Array<Int64>(0, { _ => 0 })
var esqr = Array<Bool>(0, { _ => false })
var parent = Array<Int64>(0, { _ => 0 })
var parEdge = Array<Int64>(0, { _ => 0 })
var order = Array<Int64>(0, { _ => 0 })
var farr = Array<Int32>(0, { _ => 0 })
var ans = Array<Int64>(0, { _ => 0 })

// 状态转移：Map(S + k)，状态 i 的代表 S 满足 Map(S) = i
func tIdx(i: Int64, k: Int64): Int64 {
    let s = i + k
    if (s < 23) {
        return s
    }
    return 23 + (s + 1) % 24
}

var pk = Array<Int64>(ST, { _ => 0 })
var b2 = Array<Int64>(8, { _ => 0 })
var rtab = Array<Int64>(24, { _ => 0 })

// pk[i] = k^{e_i} mod MOD；e_i = 2^i (i<23)，e_i = 2^23 * (2^(i-23) mod 119) (i>=23)
func calcPowK(k: Int64): Unit {
    var cur = k % MOD
    pk[0] = cur
    for (i in 1..23) {
        cur = cur * cur % MOD
        pk[i] = cur
    }
    b2[0] = cur * cur % MOD
    for (t in 1..7) {
        b2[t] = b2[t - 1] * b2[t - 1] % MOD
    }
    for (j in 0..24) {
        var r = rtab[j]
        var res: Int64 = 1
        var bit: Int64 = 0
        while (r > 0) {
            if ((r & 1) != 0) {
                res = res * b2[bit] % MOD
            }
            r = r / 2
            bit += 1
        }
        pk[23 + j] = res
    }
}

var wbuf = Array<Int64>(ST, { _ => 0 })
var tmpb = Array<Int64>(ST, { _ => 0 })
var outb = Array<Int64>(ST, { _ => 0 })

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())

    let m = 2 * (n - 1)
    head = Array<Int64>(n, { _ => -1 })
    eto = Array<Int64>(m, { _ => 0 })
    enxt = Array<Int64>(m, { _ => 0 })
    eval = Array<Int64>(m, { _ => 0 })
    esqr = Array<Bool>(m, { _ => false })

    var ec: Int64 = 0
    for (_ in 0..(n - 1)) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let u = Int64.parse(parts[0]) - 1
        let v = Int64.parse(parts[1]) - 1
        let isMul = parts[2] == "*"
        let k = Int64.parse(parts[3])
        eto[ec] = v
        eval[ec] = k
        esqr[ec] = isMul
        enxt[ec] = head[u]
        head[u] = ec
        ec += 1
        eto[ec] = u
        eval[ec] = k
        esqr[ec] = isMul
        enxt[ec] = head[v]
        head[v] = ec
        ec += 1
    }

    rtab[0] = 1
    for (j in 1..24) {
        rtab[j] = rtab[j - 1] * 2 % 119
    }

    // BFS 求拓扑序（父先子后）
    parent = Array<Int64>(n, { _ => -1 })
    parEdge = Array<Int64>(n, { _ => -1 })
    order = Array<Int64>(n, { _ => 0 })
    var que = Array<Int64>(n, { _ => 0 })
    var qh: Int64 = 0
    var qt: Int64 = 0
    var on: Int64 = 1
    order[0] = 0
    que[qt] = 0
    qt += 1
    while (qh < qt) {
        let u = que[qh]
        qh += 1
        var e = head[u]
        while (e != -1) {
            let w = eto[e]
            if (w != parent[u]) {
                parent[w] = u
                parEdge[w] = e
                order[on] = w
                on += 1
                que[qt] = w
                qt += 1
            }
            e = enxt[e]
        }
    }

    // 自底向上：f[u] = e0 + Σ T_e(f[v])，e0 为状态 0 值 1
    farr = Array<Int32>(n * ST, { _ => 0 })
    for (u in 0..n) {
        farr[u * ST] = 1
    }
    var oi: Int64 = n - 1
    while (oi >= 1) {
        let u = order[oi]
        let p = parent[u]
        let e = parEdge[u]
        let k = eval[e]
        let uu = u * ST
        let pp = p * ST
        if (!esqr[e]) {
            for (i in 0..ST) {
                let t = tIdx(i, k)
                let a = Int64(farr[pp + t]) + Int64(farr[uu + i])
                farr[pp + t] = Int32(a % MOD)
            }
        } else {
            calcPowK(k)
            for (i in 0..ST) {
                let a = Int64(farr[pp + i]) + Int64(farr[uu + i]) * pk[i]
                farr[pp + i] = Int32(a % MOD)
            }
        }
        oi -= 1
    }

    // 自顶向下换根：T[u] = T_e(T[p] - T_e(f[u])) + f[u]，覆盖 f[u] 槽位
    ans = Array<Int64>(n, { _ => 0 })
    var s0: Int64 = 0
    for (i in 0..ST) {
        s0 += Int64(farr[i])
    }
    ans[0] = s0 % MOD
    for (oi2 in 1..n) {
        let u = order[oi2]
        let p = parent[u]
        let e = parEdge[u]
        let k = eval[e]
        let uu = u * ST
        let pp = p * ST
        if (!esqr[e]) {
            for (i in 0..ST) {
                wbuf[i] = 0
            }
            for (i in 0..ST) {
                let t = tIdx(i, k)
                wbuf[t] += Int64(farr[uu + i])
            }
            for (i in 0..ST) {
                var d = Int64(farr[pp + i]) - wbuf[i] % MOD
                if (d < 0) {
                    d += MOD
                }
                tmpb[i] = d
            }
            for (i in 0..ST) {
                outb[i] = 0
            }
            for (i in 0..ST) {
                let t = tIdx(i, k)
                outb[t] += tmpb[i]
            }
            for (i in 0..ST) {
                farr[uu + i] = Int32((outb[i] + Int64(farr[uu + i])) % MOD)
            }
        } else {
            calcPowK(k)
            for (i in 0..ST) {
                wbuf[i] = Int64(farr[uu + i]) * pk[i] % MOD
            }
            for (i in 0..ST) {
                var d = Int64(farr[pp + i]) - wbuf[i]
                if (d < 0) {
                    d += MOD
                }
                tmpb[i] = d
            }
            for (i in 0..ST) {
                outb[i] = tmpb[i] * pk[i] % MOD
            }
            for (i in 0..ST) {
                farr[uu + i] = Int32((outb[i] + Int64(farr[uu + i])) % MOD)
            }
        }
        var su: Int64 = 0
        for (i in 0..ST) {
            su += Int64(farr[uu + i])
        }
        ans[u] = su % MOD
    }

    for (u in 0..n) {
        if (u > 0) {
            print(" ")
        }
        print(ans[u])
    }
    println()
}
```

</details>

要点：

- $k^{e_i}$ 现场计算：对 `*` 边先平方 23 次得到 $k^{2^{23}}$；状态 $i < 23$ 时沿平方链逐项得到，状态 $23+j$ 时按 $2^j \bmod 119$ 的二进制分解乘上 $k^{2^{23}}$ 的对应二次幂，不需要 $47 \times n$ 的预处理表。
- BFS 得到父先子后的顺序，逆序做子树 DP、正序做换根 DP，避免递归爆栈。
- 换根时 $T$ 直接覆盖 $f$ 的槽位：处理到 $u$ 时 $f[u]$ 已用完，$T[u]$ 只需被其子节点读取，两遍扫描可复用同一块内存。
