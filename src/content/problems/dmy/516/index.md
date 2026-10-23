---
oj: dmy
pid: '516'
title: '[R81E] 均值'
difficulty: 提高+
tags:
  - 构造
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2\times 10^5$，$1 \le K \le 10^9$，$0 \le a_i \le K$。

## 思路

记前缀和 $S_i=b_1+b_2+\cdots+b_i$，约定 $S_0=0$。$\left\lfloor S_i/i\right\rfloor=a_i$ 等价于
$$a_i\cdot i \le S_i \le a_i\cdot i+i-1,$$
而 $0\le b_i\le K$ 等价于 $S_i-S_{i-1}\in[0,K]$。于是问题变成：为每个 $i$ 选一个 $S_i$，使相邻两项的差落在 $[0,K]$，且每项落在上面那个长度恰好为 $i$ 的窗口里。

关键在于可行的 $S_i$ 集合始终是一个区间。设第 $i-1$ 步结束时可行的 $S_{i-1}$ 恰好是 $[lo_{i-1},hi_{i-1}]$。固定一个 $S_{i-1}$，能接在它后面的 $S_i$ 是 $[S_{i-1},S_{i-1}+K]$；把所有 $S_{i-1}$ 对应的区间并起来，得到 $[lo_{i-1},hi_{i-1}+K]$，再与窗口 $[a_i\cdot i,\,a_i\cdot i+i-1]$ 取交，仍是区间。因此
$$lo_0=hi_0=0,\qquad lo_i=\max\left(a_i\cdot i,\;lo_{i-1}\right),\qquad hi_i=\min\left(a_i\cdot i+i-1,\;hi_{i-1}+K\right).$$
某一步 $lo_i>hi_i$ 就说明交集为空，无解，输出 $-1$。

有了整条可行区间链之后倒着定值最省事：令 $S_n=hi_n$，再对 $i=n,n-1,\dots,1$ 取
$$S_{i-1}=\min\left(hi_{i-1},\,S_i\right),\qquad b_i=S_i-S_{i-1}.$$
每次都把 $S_{i-1}$ 取到 $S_i$ 与上界的较小值，既保证 $b_i\ge0$，又保证 $b_i\le K$。

## 正确性

**可行集合确实是区间。** 对 $i$ 归纳。$i=0$ 时只有 $S_0=0$。设第 $i-1$ 步的可行集合为 $[lo_{i-1},hi_{i-1}]$，则所有能被某个可行 $S_{i-1}$ 推出的 $S_i$ 构成 $\bigcup_{S_{i-1}}[S_{i-1},S_{i-1}+K]=[lo_{i-1},hi_{i-1}+K]$（区间并起来仍是区间，因为相邻区间彼此相接），再与第 $i$ 个窗口取交。两个区间之交为空当且仅当 $lo_i>hi_i$，否则就是一个区间。所以判空的那一步恰好等价于真的无解，也说明第 $i$ 条约束只通过 $S_i$ 的取值范围影响后续，区间递推没有丢信息。

**倒推出的 $S_i$ 都落在区间里。** 对 $i=n$，$S_n=hi_n\in[lo_n,hi_n]$。设 $S_{i+1}$ 已满足 $lo_{i+1}\le S_{i+1}\le hi_{i+1}$，则 $S_{i+1}\ge lo_{i+1}\ge lo_i$，又 $hi_i\ge lo_i$，所以 $S_i=\min(hi_i,S_{i+1})\in[lo_i,hi_i]$，第 $i$ 条约束 $a_i\cdot i\le S_i\le a_i\cdot i+i-1$ 成立。

**差值的上下界。** $S_{i-1}=\min(hi_{i-1},S_i)\le S_i$，故 $b_i\ge0$。若 $S_i\le hi_{i-1}$，则 $S_{i-1}=S_i$，$b_i=0$；否则 $S_{i-1}=hi_{i-1}$，而 $S_i\le hi_i\le hi_{i-1}+K$，故 $b_i\le K$。因此每个 $b_i\in[0,K]$。

三条合起来：输出 $-1$ 当且仅当无解；非 $-1$ 时输出的 $b$ 一定满足全部约束。

## 复杂度

时间 $O(n)$，空间 $O(n)$。$a_i\cdot i$ 最大约 $2\times10^{14}$，用 64 位整数即可。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let k = head[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let nn = n
    let lo = Array<Int64>(nn + 1, { _ => 0 })
    let hi = Array<Int64>(nn + 1, { _ => 0 })
    var ok = true
    for (i in 1..=n) {
        let ai = a[i - 1]
        var l = ai * i
        if (lo[i - 1] > l) {
            l = lo[i - 1]
        }
        var h = ai * i + i - 1
        if (hi[i - 1] + k < h) {
            h = hi[i - 1] + k
        }
        lo[i] = l
        hi[i] = h
        if (l > h) {
            ok = false
            break
        }
    }

    if (!ok) {
        println(-1)
    } else {
        let s = Array<Int64>(nn + 1, { _ => 0 })
        s[n] = hi[n]
        let b = Array<Int64>(nn, { _ => 0 })
        var i = n
        while (i >= 1) {
            var prev = hi[i - 1]
            if (s[i] < prev) {
                prev = s[i]
            }
            s[i - 1] = prev
            b[i - 1] = s[i] - prev
            i -= 1
        }
        let sb = StringBuilder()
        for (j in 0..n) {
            if (j > 0) {
                sb.append(" ")
            }
            sb.append(b[j])
        }
        println(sb.toString())
    }
}
```

</details>
