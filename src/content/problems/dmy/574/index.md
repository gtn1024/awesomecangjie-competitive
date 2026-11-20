---
oj: dmy
pid: '574'
title: '书签'
difficulty: 提高
tags:
  - 字符串
  - 枚举
  - 后缀和
timeLimit: 1s
memoryLimit: 512m
---

从 $S$ 和 $T$ 中各取一段等长子串 $A$、$B$，要求正读 $A<B$、倒读 $A>B$，统计位置四元组数量。

> 数据规模：$n,m\le 4000$。

## 思路

设 $p$ 是两串从左数第一个不同的位置，$q$ 是最后一个不同的位置。正读 $A<B$ 即 $A[p]<B[p]$；倒读 $A>B$ 即从右数第一个不同处 $A$ 的字符更大，即 $A[q]>B[q]$。若 $p=q$ 则两个要求矛盾，所以合法的一对子串必然形如：

- 从起点到 $p-1$：两串完全相同；
- 位置 $p$：$A$ 的字符更小（记为「小于分叉」）；
- 位置 $q>p$：$A$ 的字符更大（记为「大于会合」）；
- 从 $q+1$ 到终点：两串完全相同。

中间 $p+1\ldots q-1$ 任意，不影响「第一个」和「最后一个」不同的判定。

由于两段子串等长，起点差 $\delta=l_1-l_2$ 固定时，$A$ 的每个位置 $x$ 恰好对齐 $B$ 的位置 $x-\delta$。于是枚举 $\delta\in[-(m-1),\,n-1]$，把每个合法的 $S$ 位置 $x$（即 $x\in[\max(0,\delta),\ \min(n-1,m-1+\delta)]$）按 $S[x]$ 与 $T[x-\delta]$ 的大小标为「小于」「大于」或「相等」，越界视为打断。

一对合法子串在该对齐下唯一对应：一个「小于」位置 $a$ 和一个在它右边的「大于」位置 $c$。其中：

- 起点 $l_1$ 可以取 $a$ 左侧连续相等段（含 $a$ 自身）中的任意位置，共 $w_L(a)=\text{左侧连续相等长度}+1$ 种；
- 终点 $r_1$ 可以取 $c$ 右侧连续相等段（含 $c$ 自身）中的任意位置，共 $w_R(c)=\text{右侧连续相等长度}+1$ 种。

两者独立组合，故该对齐下的答案为

$$\sum_{a\ \text{为小于位置}} w_L(a)\cdot\sum_{\substack{c>a\\ c\ \text{为大于位置}}} w_R(c).$$

对每个 $\delta$ 从右往左扫一遍维护右侧连续相等长度与 $w_R$ 的后缀和 $\mathrm{suff}$，再从左往右扫一遍维护左侧连续相等长度，遇到「小于」位置累加 $w_L(a)\cdot \mathrm{suff}[a+1]$ 即可。

所有 $\delta$ 的对齐位置总数恰为 $n\cdot m$，总复杂度 $O(n(n+m))$，对 $n,m\le 4000$ 约 $3\times 10^7$ 次比较。答案上界约 $n^2m$ 量级，用 64 位整数累加。

## 代码

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let m = head[1]
    let s = reader.readln().getOrThrow().trimAscii().toArray()
    let t = reader.readln().getOrThrow().trimAscii().toArray()
    var ans: Int64 = 0
    let suff = Array<Int64>(n + 2, { _ => 0 })
    var delta = -m + 1
    while (delta < n) {
        var lo = delta
        if (lo < 0) {
            lo = 0
        }
        var hi = m - 1 + delta
        if (hi > n - 1) {
            hi = n - 1
        }
        if (lo <= hi) {
            suff[hi + 1] = 0
            var runR: Int64 = 0
            var x = hi
            while (x >= lo) {
                let cs = s[x]
                let ct = t[x - delta]
                if (cs == ct) {
                    runR += 1
                    suff[x] = suff[x + 1]
                } else {
                    if (cs > ct) {
                        suff[x] = suff[x + 1] + runR + 1
                    } else {
                        suff[x] = suff[x + 1]
                    }
                    runR = 0
                }
                x -= 1
            }
            var runL: Int64 = 0
            x = lo
            while (x <= hi) {
                let cs = s[x]
                let ct = t[x - delta]
                if (cs == ct) {
                    runL += 1
                } else {
                    if (cs < ct) {
                        ans += (runL + 1) * suff[x + 1]
                    }
                    runL = 0
                }
                x += 1
            }
        }
        delta += 1
    }
    println(ans)
}
```
