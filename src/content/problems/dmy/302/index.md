---
oj: dmy
pid: '302'
title: '[R48G]子集求和'
difficulty: 提高
tags:
  - 组合数学
  - 数据结构
  - 离线
  - 树状数组
timeLimit: 1.5s
memoryLimit: 512m
---

## 题目

给定长度为 $n$ 的数组 $a$。对于任意一个子区间构成的可重集合 $S$，定义 $f(S_i)$ 为子集 $S_i$ 中「出现次数为奇数」的元素之和，定义 $G(S)=\big(\sum_{S_i\subseteq S}(f(S_i))^2\big)\bmod{10^9+7}$。有 $m$ 次询问，每次给定区间 $[l,r]$，求该区间对应集合的 $G(S)$。

> 对于 $100\%$ 的数据，$1\le n,m\le 5\times 10^5$，$1\le a_i\le 10^9$，$1\le l\le r\le n$。

## 思路

设区间内不同取值为 $v_1,v_2,\dots,v_k$，$v_j$ 在区间内的出现次数为 $c_j$，区间长度 $N=\sum c_j$。利用

$$
(f(S_i))^2=\sum_{p,q}v_p v_q\cdot[v_p\text{ 在 }S_i\text{ 中出现奇数次}]\cdot[v_q\text{ 在 }S_i\text{ 中出现奇数次}]
$$

对全部 $2^N$ 个子集求和。对每个值 $v_j$，从它的 $c_j$ 份副本里选若干份，奇数份的方案数为 $2^{c_j-1}$。于是：

- $p=q$：贡献 $v_j^2\cdot 2^{c_j-1}\cdot 2^{N-c_j}=v_j^2\cdot 2^{N-1}$；
- $p\ne q$（两个不同值）：贡献 $v_p v_q\cdot 2^{c_p-1}\cdot 2^{c_q-1}\cdot 2^{N-c_p-c_q}=v_p v_q\cdot 2^{N-2}$。

求和得

$$
G(S)=2^{N-1}\sum_j v_j^2+2^{N-2}\sum_{p\ne q}v_p v_q=2^{N-2}\Big((\textstyle\sum_j v_j)^2+\sum_j v_j^2\Big)\bmod{10^9+7}.
$$

**样例验证**：$S=\{2,2\}$，$N=2$，不同值 $\{2\}$，$T=2$，$\sum v_j^2=4$，$G=2^0(4+4)=8$；$S=\{2,2,3\}$，$N=3$，不同值 $\{2,3\}$，$T=5$，$\sum v_j^2=13$，$G=2(25+13)=76$，与样例一致。

因此关键只在于：对每个询问区间 $[l,r]$ 快速求出 **区间内不同元素之和 $T$** 与 **区间内不同元素平方之和 $Q$**。

这是经典的「区间不同元素求和」问题，离线处理：把询问按右端点 $r$ 升序（直接按 $r$ 分桶即可），用一个支持单点修改、区间求和的树状数组，对每个值只在其「最近出现位置」上累加贡献。从左到右扫到位置 $r$ 时，若 $a_r$ 之前在 $p$ 出现过，则先把 $p$ 处的贡献撤销，再把当前位置 $r$ 加入（值为 $a_r\bmod p$，平方贡献为 $(a_r\bmod p)^2$）。查询时对树状数组做 $\text{sum}(r)-\text{sum}(l-1)$，得到的恰好是区间 $[l,r]$ 内 **不同** 元素之和（平方同理）。

最后注意 $2^{N-2}$ 的 $N-2$ 可能为负（$N=1$ 时），直接用 $2^{N}\cdot 4^{-1}$ 代替 $2^{N-2}$ 即可，$4^{-1}$ 由费马小定理 $4^{p-2}\bmod p$ 给出，全程规避负指数。

## 复杂度

- 时间复杂度：$O((n+m)\log n)$。
- 空间复杂度：$O(n+m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

const MOD: Int64 = 1000000007

func modpow(base0: Int64, exp0: Int64): Int64 {
    var base = base0 % MOD
    var exp = exp0
    var res: Int64 = 1
    while (exp > 0) {
        if ((exp & 1) == 1) {
            res = (res * base) % MOD
        }
        base = (base * base) % MOD
        exp = exp / 2
    }
    return res
}

// BIT 维护模意义下的加法
class BIT {
    let n: Int64
    let t: Array<Int64>
    public init(n: Int64) {
        this.n = n
        this.t = Array<Int64>(n + 1, { _ => 0 })
    }
    public func add(i: Int64, v: Int64): Unit {
        var idx = i
        while (idx <= n) {
            t[idx] = (t[idx] + v) % MOD
            idx += idx & (-idx)
        }
    }
    public func sum(i: Int64): Int64 {
        var res: Int64 = 0
        var idx = i
        while (idx > 0) {
            res = (res + t[idx]) % MOD
            idx -= idx & (-idx)
        }
        return res
    }
}

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]

    let a = Array<Int64>(n + 1, { _ => 0 })
    let arrLine = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var idx: Int64 = 1
    while (idx <= n) {
        a[idx] = arrLine[idx - 1]
        idx += 1
    }

    // 读取询问，按右端点分桶
    let ql = Array<Int64>(m, { _ => 0 })
    let qr = Array<Int64>(m, { _ => 0 })
    // bucket[r] = 以 r 为右端点的询问下标列表
    let bucket = Array<ArrayList<Int64>>(n + 1, { _ => ArrayList<Int64>() })
    var i: Int64 = 0
    while (i < m) {
        let q = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        ql[i] = q[0]
        qr[i] = q[1]
        bucket[qr[i]].add(i)
        i += 1
    }

    // 预处理 2 的幂
    let pw2 = Array<Int64>(n + 2, { _ => 0 })
    pw2[0] = 1
    var k: Int64 = 1
    while (k <= n + 1) {
        pw2[k] = (pw2[k - 1] * 2) % MOD
        k += 1
    }
    let inv2 = modpow(2, MOD - 2)
    let inv4 = (inv2 * inv2) % MOD

    let bitSum = BIT(n)
    let bitSq = BIT(n)
    let lastPos = HashMap<Int64, Int64>()

    let ans = Array<Int64>(m, { _ => 0 })

    var pos: Int64 = 1
    while (pos <= n) {
        let v = a[pos]
        let vm = v % MOD
        let vsq = (vm * vm) % MOD
        if (lastPos.contains(v)) {
            let lp = lastPos[v]
            bitSum.add(lp, MOD - vm)
            bitSq.add(lp, MOD - vsq)
        }
        bitSum.add(pos, vm)
        bitSq.add(pos, vsq)
        lastPos[v] = pos

        // 处理右端点为 pos 的所有询问
        let lst = bucket[pos]
        for (qi in lst) {
            let l = ql[qi]
            let len = pos - l + 1
            let s1 = ((bitSum.sum(pos) - bitSum.sum(l - 1)) % MOD + MOD) % MOD
            let s2 = ((bitSq.sum(pos) - bitSq.sum(l - 1)) % MOD + MOD) % MOD
            var g = (s1 * s1) % MOD
            g = (g + s2) % MOD
            // G = 2^(len-2) * g；用 2^len * inv4 代替 2^(len-2)，避免负指数
            let factor = (pw2[len] * inv4) % MOD
            g = (g * factor) % MOD
            ans[qi] = g
        }
        pos += 1
    }

    var j: Int64 = 0
    while (j < m) {
        println(ans[j])
        j += 1
    }
}
```

</details>
