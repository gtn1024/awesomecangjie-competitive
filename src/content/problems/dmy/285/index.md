---
oj: dmy
pid: '285'
title: '[R46E]机器'
difficulty: 提高
tags:
  - 差分
  - 树状数组
  - 逆向递推
timeLimit: 1s
memoryLimit: 512m
---

## 题目

有 $n$ 个糖果盒（初始为 $0$）和 $m$ 台机器。机器有两种：

1. 加法机器：给糖果盒区间 $[l,r]$ 每个盒子加 $x$。
2. 调用机器：依次运行第 $l$ 台到第 $r$ 台机器。保证调用区间内的机器编号严格小于自身。

收到 $q$ 条指令，每条指令给出区间 $[l,r]$，依次运行该区间内的机器。求所有指令执行完毕后每个盒子里的糖果数，对 $10^9+7$ 取模。

> 对于 $100\%$ 的数据，$1\le n,m,q\le 2\times 10^5$，$1\le x\le 10^9$。

## 思路

直接模拟每条指令会反复触发调用机器，最坏情况呈指数级膨胀，显然不可行。注意到一个关键性质：**机器只会调用编号比自己小的机器**，构成一张「编号偏序」的 DAG，于是可以按编号从大到小递推。

定义 $\mathit{cnt}[i]$ 为机器 $i$ 在所有指令（含间接调用）中被执行的总次数。一旦求出 $\mathit{cnt}$，每台类型 1 机器对糖果盒的贡献就是 $\mathit{cnt}[i]\cdot x_i$ 作用在区间 $[l_i,r_i]$ 上，用糖果盒差分数组累计即可。

**计算 $\mathit{cnt}$**：

1. 指令本身直接命中机器的次数，用一个机器维度差分数组处理：每条指令 $[l,r]$ 做 $\mathit{directDiff}[l]\mathrel{+}=1,\ \mathit{directDiff}[r+1]\mathrel{-}=1$，前缀和得到 $\mathit{dir}[i]$（机器 $i$ 被指令直接覆盖的次数）。
2. 调用机器传递的次数按编号从大到小累加：处理到机器 $i$ 时，所有编号大于 $i$ 的调用机器已经处理完毕。维护一个**机器维度的树状数组**（支持区间加、单点查询），当某台类型 2 机器 $j$（$j>i$）的执行次数 $\mathit{cnt}[j]$ 确定后，把它向其调用区间 $[l_j,r_j]$ 贡献一次，即对树状数组做区间加 $\mathit{cnt}[j]$。这样 $\mathit{fw.query}(i)$ 就汇聚了所有 $j>i$ 的调用机器传递给 $i$ 的次数。

于是

$$
\mathit{cnt}[i] = \mathit{dir}[i] + \mathit{fw.query}(i).
$$

若 $\mathit{typ}[i]=1$，把 $\mathit{cnt}[i]\cdot (x_i\bmod p)$ 写入糖果盒差分数组（$l$ 处加，$r+1$ 处减）；若 $\mathit{typ}[i]=2$，则对树状数组做 $\mathit{rangeAdd}(l_i,r_i,\mathit{cnt}[i])$，把执行次数传递给被调用的机器。全部全程对 $p=10^9+7$ 取模。

最后对糖果盒差分数组求一遍前缀和即得答案。

**复杂度**：机器维度的差分、糖果盒差分均为 $O(n+m+q)$；树状数组部分每台机器一次区间加、一次查询，共 $O((n+m+q)\log m)$，在 $2\times 10^5$ 规模下轻松通过。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

let MOD: Int64 = 1000000007

// 树状数组，支持区间加、单点查询（差分实现，全程取模）
class Fenwick {
    var n: Int64
    var bit: Array<Int64>

    init(n: Int64) {
        this.n = n
        bit = Array<Int64>(n + 2, { _ => 0 })
    }

    func add(pos: Int64, v: Int64): Unit {
        var p = pos
        while (p <= n) {
            bit[p] = (bit[p] + v) % MOD
            p += p & (-p)
        }
    }

    func rangeAdd(l: Int64, r: Int64, v: Int64): Unit {
        add(l, v)
        add(r + 1, (MOD - v) % MOD)
    }

    func query(pos: Int64): Int64 {
        var p = pos
        var s: Int64 = 0
        while (p > 0) {
            s = (s + bit[p]) % MOD
            p -= p & (-p)
        }
        return s
    }
}

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let q = first[2]

    let typ = Array<Int64>(m + 2, { _ => 0 })
    let ml = Array<Int64>(m + 2, { _ => 0 })
    let mr = Array<Int64>(m + 2, { _ => 0 })
    let mx = Array<Int64>(m + 2, { _ => 0 })

    for (i in 1..=m) {
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        typ[i] = a[0]
        ml[i] = a[1]
        mr[i] = a[2]
        if (a[0] == 1) {
            mx[i] = a[3]
        }
    }

    // 指令直接执行产生的次数（差分数组）
    let directDiff = Array<Int64>(m + 2, { _ => 0 })
    for (_ in 1..=q) {
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        directDiff[a[0]] = (directDiff[a[0]] + 1) % MOD
        directDiff[a[1] + 1] = (directDiff[a[1] + 1] + MOD - 1) % MOD
    }

    let dir = Array<Int64>(m + 2, { _ => 0 })
    var acc: Int64 = 0
    for (i in 1..=m) {
        acc = (acc + directDiff[i]) % MOD
        dir[i] = acc
    }

    // 机器只会调用编号比自己小的机器，按编号从大到小处理：
    // cnt[i] = 直接执行次数 + 所有编号更大的调用机器传给它的次数（树状数组区间加累计）
    let fw = Fenwick(m)
    var boxDiff = Array<Int64>(n + 2, { _ => 0 })
    var i = m
    while (i >= 1) {
        let cnt = (dir[i] + fw.query(i)) % MOD
        if (typ[i] == 1) {
            let add = (cnt * (mx[i] % MOD)) % MOD
            boxDiff[ml[i]] = (boxDiff[ml[i]] + add) % MOD
            boxDiff[mr[i] + 1] = (boxDiff[mr[i] + 1] + MOD - add) % MOD
        } else {
            fw.rangeAdd(ml[i], mr[i], cnt)
        }
        i -= 1
    }

    var cur: Int64 = 0
    for (i in 1..=n) {
        cur = (cur + boxDiff[i]) % MOD
        if (i > 1) {
            print(" ")
        }
        print(cur)
    }
    println()
}
```
