---
oj: dmy
pid: '272'
title: '[R44D]好玩的游戏'
difficulty: 提高
tags:
  - 构造
  - 并查集
timeLimit: 1s
memoryLimit: 256m
---

> 对于 $100\%$ 的数据，$1 \le \sum n, \sum q \le 3 \times 10^5$，$1 \le l_i \le r_i \le n$，$t_i \in \{0, 1\}$。

## 思路

一轮游戏在子数组 $a[l..r]$ 上进行，两人轮流把数异或到自己的分数上直到取完。设 apiadu 的分数为 $X$，jiangly 的分数为 $Y$，那么每个元素都被异或到恰好一人的分数上，因此游戏结束后

$$
X \oplus Y = a_l \oplus a_{l+1} \oplus \cdots \oplus a_r = S
$$

**与两人的取数策略完全无关**——无论怎么轮流取，两个分数的异或始终等于子数组所有元素的异或和。

于是「apiadu 有必胜策略」等价于该确定结果满足胜负条件：

- $t=0$（要求 $X=Y$，即 $X \oplus Y=0$）：需要 $S=0$；
- $t=1$（要求 $X \ne Y$，即 $X \oplus Y \ne 0$）：需要 $S \ne 0$。

把构造转化为前缀异或的约束。设 $\text{pre}[0]=0$，$\text{pre}[i]=a_1 \oplus \cdots \oplus a_i$，则 $a[l..r]$ 的异或和 $= \text{pre}[r] \oplus \text{pre}[l-1]$。每轮条件改写为：

- $t=0$：$\text{pre}[r] = \text{pre}[l-1]$（一组**相等**约束）；
- $t=1$：$\text{pre}[r] \ne \text{pre}[l-1]$（一组**不等**约束）。

同时 $a_i \in [1, 10^9]$ 要求 $a_i = \text{pre}[i] \oplus \text{pre}[i-1] \ne 0$，即所有相邻前缀 $\text{pre}[i-1] \ne \text{pre}[i]$，这是额外的不等约束。

至此问题变成：在 $0, 1, \dots, n$ 这 $n+1$ 个点上同时满足一组「相等」和「不等」约束。用 **并查集** 合并所有 $t=0$ 的相等约束，使「在同一并查集里」恰好代表「前缀值必须相等」。合并完之后：

- $a_i \ge 1$ 的约束要求 $\text{pre}[i-1]$ 与 $\text{pre}[i]$ 不在同一集合，若发现某相邻对已在同一集合，则无解；
- $t=1$ 的约束要求 $\text{pre}[l-1]$ 与 $\text{pre}[r]$ 不在同一集合，否则其前缀值被迫相等，$S=0$，与 $t=1$ 矛盾，无解。

只要上述两类检查全通过，就一定有解。**赋值**很简单：令 $\text{pre}[v] = \text{find}(v)$（根下标），同一集合内的点取相同值、不同集合的点取不同值，于是所有不等约束自动满足；此时 $a_i = \text{pre}[i] \oplus \text{pre}[i-1]$，由相邻点必在不同集合保证 $a_i \ge 1$，且 $a_i \le 2n \le 10^9$ 满足上界。

以样例第二组 $n=5, q=2$，询问 `1 3 1` 与 `2 2 0` 为例：第二条是 $t=0$，合并 $\text{pre}[1]$ 与 $\text{pre}[2]$；而 $a_2 \ge 1$ 又要求二者不同，矛盾，故输出 `-1`。

## 复杂度

- 每组数据：并查集合并 $t=0$ 约束、扫描 $a_i \ge 1$ 与 $t=1$ 约束各 $O((n+q)\alpha(n))$，赋值输出 $O(n)$。
- 总时间 $O((\sum n + \sum q)\alpha)$，空间 $O(n+q)$，可在 1s/256MB 限制内通过。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

// 并查集：处理「相等」约束
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

func solve(reader: ConsoleReader): Unit {
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line0[0]
    let q = line0[1]

    // 前缀点 0..n，共 n+1 个
    let m = n + 1
    let dsu = DSU(m)

    // t=1 不等约束暂存
    var neqL = ArrayList<Int64>()
    var neqR = ArrayList<Int64>()

    var i = Int64(0)
    while (i < q) {
        i += 1
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let l = parts[0]
        let r = parts[1]
        let t = parts[2]
        let a = l - 1  // pre[l-1]
        let b = r      // pre[r]
        if (t == 0) {
            dsu.union(a, b)
        } else {
            neqL.add(a)
            neqR.add(b)
        }
    }

    // 检查 a_i>=1 约束：相邻 pre[i-1] 与 pre[i] 必须不同集合
    var bad = false
    for (j in 1..=n) {
        if (dsu.find(j - 1) == dsu.find(j)) {
            bad = true
        }
    }

    // 检查 t=1 约束：pre[l-1] 与 pre[r] 必须不同集合
    for (k in 0..Int64(neqL.size)) {
        if (dsu.find(neqL[k]) == dsu.find(neqR[k])) {
            bad = true
        }
    }

    if (bad) {
        println("-1")
        return
    }

    // 赋值：pre[i] = find(i)（根下标，集合内相同、集合间不同）
    // a[i] = pre[i] ^ pre[i-1]，因相邻不同集合故 a[i]>=1，且 <=2n<=1e9
    for (j in 1..=n) {
        let preNow = dsu.find(j)
        let prePrev = dsu.find(j - 1)
        let ai = preNow ^ prePrev
        if (j > 1) {
            print(" ")
        }
        print(ai)
    }
    println()
}

main() {
    let reader = getStdIn()
    let T = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..T) {
        solve(reader)
    }
}
```
