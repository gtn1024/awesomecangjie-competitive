---
oj: dmy
pid: '546'
title: '数位和整除'
difficulty: 提高
tags:
  - 数位DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 10^{14}$。

## 思路

**按数位和分类。** 判定一个数是否有趣只取决于它的十进制数位和 $s$。$N$ 最多 15 位，数位和不超过 $9\times 15=135$，于是可以枚举 $s=1,2,\dots,9L$（$L$ 为 $N$ 的位数），把原问题拆成至多 135 个子问题：统计 $[1,N]$ 中「数位和恰为 $s$ 且被 $s$ 整除」的数有多少个。每个数只有一个数位和，各子问题互不重叠，答案直接相加。

**固定 $s$ 后的数位 DP。** 把 $N$ 的数字按高位到低位存成 $d_0d_1\cdots d_{L-1}$，逐位决定 $x$ 的数字。任何 $x\le N$ 的位串（不足 $L$ 位时在高位补前导零）在扫描过程中只可能处于两类状态之一：前面若干位与 $N$ 完全相同，或者在某一位首次严格小于 $N$ 的对应位、之后完全自由。因此维护：

- $f[\text{sum}][\text{rem}]$：前缀已经严格小于 $N$ 的前缀的那些位串，已用数位和为 $\text{sum}$、当前数值对 $s$ 取模为 $\text{rem}$ 的个数；
- 一对数 $(\text{tsum},\text{trem})$：前缀与 $N$ 的前缀完全相等的位串。这种前缀每个长度只有一条，所以只是一个标量状态。

转移时枚举当前位填入的数字 $c$：

- 自由状态：$c$ 取 $0\dots 9$，转到 $\text{sum}'=\text{sum}+c$、$\text{rem}'=(10\,\text{rem}+c)\bmod s$；
- 紧贴状态：$c$ 取 $0\dots d_i-1$ 时前缀首次变小，每种取法各产生 $1$ 个计入新的 $f$；$c=d_i$ 时继续留在紧贴状态。

扫完 $L$ 位后，$f$ 中 $\text{sum}=s$、$\text{rem}=0$ 的那一项就是数位和恰为 $s$、且数值被 $s$ 整除的个数；若紧贴状态最终满足 $\text{tsum}=s$ 且 $\text{trem}=0$，再把 $N$ 本身补上。按 $s$ 把这一切累加即得答案。

**边界处理。**

- 前导零对 $\text{sum}$ 和 $\text{rem}$ 都没有影响，所以允许位串带前导零，就把「位数不足 $L$ 的数」一并统计进来了，不必按长度分段。全零串的数位和为 $0$，而 $s\ge 1$，因此 $0$ 永远不会被计入，恰好对应从 $1$ 开始计数。
- 只保留 $\text{sum}\le s$ 的状态：某分支的数位和一旦超过 $s$ 就再也回不到 $s$，可以直接丢弃。同理，紧贴状态一旦 $\text{tsum}>s$，整条紧贴链就此失效，后续位只需推进自由状态。
- 处理完 $i$ 位后已用数位和最多 $9i$，于是把 $\text{sum}$ 的枚举上界收紧到 $\min(s,9i)$，当前位取值的上界收紧到 $\min(9,s-\text{sum})$，未填满的和不会被访问，常数明显变小。

**正确性。** 每个 $[1,N]$ 内整数的补零位串与 $N$ 的前缀比较时，要么全程相等（此时该数就是 $N$），要么在唯一一个位置首次变小，两种情形在转移里都只被计入一次；而每个数只属于一个 $s$。两者合起来保证不重不漏。

## 复杂度

固定 $s$ 时状态 $(\text{sum},\text{rem})$ 共 $(s+1)s$ 个，每位至多转移 10 个数字，转移量 $O(10\,L\,s^2)$。对 $s\le 9L$ 求和得 $O(L^4)$，$L=15$ 时约 $10^8$ 次转移（收紧枚举上界后实际远少于此）。空间上每个 $s$ 只需两层滚动的 $(s+1)\times s$ 计数表，即 $O(s^2)$。

## 仓颉实现

计数表按一维数组存放，下标为 $\text{sum}\cdot s+\text{rem}$；自由状态的表用两个数组逐位滚动，紧贴状态只用两个标量。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let n = Int64.parse(getStdIn().readln().getOrThrow())
    var buf = Array<Int64>(20, { _ => 0 })
    var len: Int64 = 0
    var t = n
    while (t > 0) {
        buf[len] = t % 10
        t /= 10
        len += 1
    }
    let L = len
    let d = Array<Int64>(L, { _ => 0 })
    for (i in 0..L) {
        d[i] = buf[L - 1 - i]
    }

    var ans: Int64 = 0
    for (s in 1..=(9 * L)) {
        let sz = (s + 1) * s
        var cur = Array<Int64>(sz, { _ => 0 })
        var nxt = Array<Int64>(sz, { _ => 0 })
        var tsum: Int64 = 0
        var trem: Int64 = 0
        var alive = true
        for (i in 0..L) {
            for (j in 0..sz) {
                nxt[j] = 0
            }
            let curDigit = d[i]
            let cap = if (9 * i < s) { 9 * i } else { s }
            for (sum in 0..=cap) {
                let base = sum * s
                let lim = if (s - sum < 9) { s - sum } else { 9 }
                for (r in 0..s) {
                    let v = cur[base + r]
                    if (v == 0) {
                        continue
                    }
                    let nr = (r * 10) % s
                    for (c in 0..=lim) {
                        nxt[(sum + c) * s + (nr + c) % s] += v
                    }
                }
            }
            if (alive) {
                if (curDigit > 0) {
                    let rest = s - tsum
                    let cend = if (curDigit - 1 < rest) { curDigit - 1 } else { rest }
                    let base = tsum * s
                    let nr = (trem * 10) % s
                    for (c in 0..=cend) {
                        nxt[base + c * s + (nr + c) % s] += 1
                    }
                }
                tsum += curDigit
                trem = (trem * 10 + curDigit) % s
                if (tsum > s) {
                    alive = false
                }
            }
            let tmp = cur
            cur = nxt
            nxt = tmp
        }
        ans += cur[s * s]
        if (alive && tsum == s && trem == 0) {
            ans += 1
        }
    }
    println(ans)
}
```

</details>
