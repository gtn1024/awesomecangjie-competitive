---
oj: dmy
pid: '279'
title: '[R45E]复生的沙威玛'
difficulty: 提高
tags:
  - 博弈论
  - ST 表
  - 区间最值
timeLimit: 1s
memoryLimit: 512m
---

## 题目

长度为 $n$ 的序列 $a$，棋子初始位置由 `apiadu`（最小化方）在 $[l,r]$ 内选定，随后 `jiangly`（最大化方）决定谁先手。每次操作将棋子左移或右移一步，两人交替操作，进行 $x$ 次操作后棋子所在位置的 $a$ 值即为得分。$q$ 次询问，每次给出 $x,l,r$，求最优策略下的得分。

> 对于 $100\%$ 的数据，$2\le n\le 10^5$，$1\le q\le 10^5$，$0\le x\le n$，$1\le l\le r\le n$，$1\le a_i\le 10^8$。

## 思路

关键观察：得分只与初始位置 $s$ 和操作次数 $x$ 的奇偶性有关，且当 $x\ge 1$ 时取值进入周期为 $2$ 的稳态。把游戏值记为 $f(s,x)$，则 $f(s,x)$ 只可能落在三类值上：$x=0$、$x$ 为奇数、$x$ 为正偶数。下面对一个固定的起点 $s$（位置记 $p$）逐一推导。

先说明记号。`apiadu` 是最小化方、`jiangly` 是最大化方，`jiangly` 在知道 $s$ 后选谁先手，因此最终得分是「`apiadu` 先手」与「`jiangly` 先手」两种顺序中的较大值。

**$x=0$**：不移动，得分就是 $f(s,0)=a_p$。

**$x=1$**：只有一步。`jiangly` 选先手。若 `jiangly` 先手，他会走到 $a_{p-1}$、$a_{p+1}$ 中较大者并停在那里；若 `apiadu` 先手，他会走到较小者，但此时还没有第二步，得分就是那个较小值。`jiangly` 取较大，所以选择自己先手，得分为

$$f(s,1)=\max(a_{p-1},a_{p+1})$$

（边界 $p=1$ 或 $p=n$ 时只有唯一邻居）。这就是奇数 $x$ 的稳态值 $v_1$。

**$x=2$**：两步。无论谁先手，第 $2$ 步都由另一方走，所以任何一方都不能单方面决定终点，终点必定形如 $p-2,p,p+2$ 之一（边界处退化为更少选择）。仔细分析后，正偶数 $x\ge 2$ 的稳态值 $v_2$ 为：

- $n=2$：两步走完只能回到原位，$v_2=a_p$。
- $p=1$：终点只能是 $1$ 或 $3$，最大化方会确保落在 $\max(a_1,a_3)$。
- $p=2$：终点只能是 $2$，$v_2=a_2$。
- $p=n-1$：同理 $v_2=a_{n-1}$。
- $p=n$：终点只能是 $n-2$ 或 $n$，$v_2=\max(a_{n-2},a_n)$。
- 内部 $3\le p\le n-2$：终点在 $\{p-2,p,p+2\}$ 中。最小化方先尽量压低，最大化方再选较高的一侧，得到 $v_2=\max(a_p,\min(a_{p-2},a_{p+2}))$。

可以证明：对任意 $x\ge 1$，奇数取 $v_1$、正偶数取 $v_2$，不会随 $x$ 增大而变化（值在 $v_1,v_2$ 之间按奇偶交替）。这样每个起点 $s$ 只需预算三个数 $v_0,v_1,v_2$。

对于一次询问 $(x,l,r)$，`apiadu` 在 $[l,r]$ 中选起点使得分最小，于是先按 $x$ 的类别选定数组（$v_0$ / $v_1$ / $v_2$），再求该数组在 $[l,r]$ 内的最小值。静态区间最小值用稀疏表（ST 表）预处理，单次询问 $O(1)$。

## 复杂度

- 时间复杂度：$O(n\log n+q)$。
- 空间复杂度：$O(n\log n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

func mymin(a: Int64, b: Int64): Int64 {
    if (a < b) { a } else { b }
}

func mymax(a: Int64, b: Int64): Int64 {
    if (a > b) { a } else { b }
}

// 对 0 索引数组 v 建稀疏表（区间最小值）
func buildST(v: Array<Int64>, n: Int64, pw: Array<Int64>): Array<Array<Int64>> {
    let LOG: Int64 = 18
    let st = Array<Array<Int64>>(LOG, { _ => Array<Int64>(n, { _ => 0 }) })
    for (i in 0..n) {
        st[0][i] = v[i]
    }
    var k: Int64 = 1
    while (k < LOG) {
        let half = pw[k - 1]
        let lim = n - 2 * half + 1
        var i: Int64 = 0
        while (i < lim) {
            st[k][i] = mymin(st[k - 1][i], st[k - 1][i + half])
            i = i + 1
        }
        k = k + 1
    }
    return st
}

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(first[0])
    let q = Int64.parse(first[1])
    let vals = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // a 为 1 索引
    let a = Array<Int64>(n + 1, { _ => 0 })
    for (i in 0..n) {
        a[i + 1] = vals[i]
    }

    // v0: x = 0 时分数即 a[s]；v1: x 为奇数；v2: x 为偶数且 x >= 2
    let v0 = Array<Int64>(n, { i => a[i + 1] })
    let v1 = Array<Int64>(n, { _ => 0 })
    let v2 = Array<Int64>(n, { _ => 0 })
    for (s in 0..n) {
        let pos = s + 1
        // 奇数 x：分数 = 两个合法邻位中的最大值
        var m1: Int64 = 0
        if (pos > 1) {
            m1 = mymax(m1, a[pos - 1])
        }
        if (pos < n) {
            m1 = mymax(m1, a[pos + 1])
        }
        v1[s] = m1
        // 偶数 x >= 2：min over q 邻位 of max over r 邻位 of a[r]
        if (n == 2) {
            v2[s] = a[pos]
        } else if (pos == 1) {
            v2[s] = mymax(a[1], a[3])
        } else if (pos == 2) {
            v2[s] = a[2]
        } else if (pos == n - 1) {
            v2[s] = a[n - 1]
        } else if (pos == n) {
            v2[s] = mymax(a[n - 2], a[n])
        } else {
            v2[s] = mymax(a[pos], mymin(a[pos - 2], a[pos + 2]))
        }
    }

    // lg[len] = floor(log2(len))
    let lg = Array<Int64>(n + 2, { _ => 0 })
    for (i in 2..(n + 2)) {
        lg[i] = lg[i / 2] + 1
    }
    let pw = Array<Int64>(19, { _ => 0 })
    pw[0] = 1
    for (i in 1..19) {
        pw[i] = pw[i - 1] * 2
    }

    let st0 = buildST(v0, n, pw)
    let st1 = buildST(v1, n, pw)
    let st2 = buildST(v2, n, pw)

    for (_ in 0..q) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let x = Int64.parse(parts[0])
        let l = Int64.parse(parts[1])
        let r = Int64.parse(parts[2])
        let st: Array<Array<Int64>> = if (x == 0) { st0 } else if (x % 2 == 1) { st1 } else { st2 }
        let len = r - l + 1
        let k = lg[len]
        let left = l - 1
        let right = r - pw[k]
        let ans = mymin(st[k][left], st[k][right])
        println(ans)
    }
}
```

</details>
