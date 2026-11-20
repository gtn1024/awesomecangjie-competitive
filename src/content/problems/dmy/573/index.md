---
oj: dmy
pid: '573'
title: '灯光师'
difficulty: 普及+/提高
tags:
  - 位运算
  - 贪心
  - 构造
timeLimit: 1s
memoryLimit: 512m
---

要求找一个 $x\in[1,m]$，使得对清单里每个 $a_i$ 都有 $(a_i\,\&\,x)\ne x$，即 $x$ 不是任何 $a_i$ 的子掩码；若无解输出 `No`。

> 数据规模：$1\le n\le 10^6$，$1\le m<2^{60}$，$1\le a_i\le m$。

## 思路

把条件改写成子掩码关系：$x$ 非法当且仅当 $x$ 是某个 $a_i$ 的子掩码（$x$ 的每个 $1$ 位在 $a_i$ 中也都是 $1$）。要找 $[1,m]$ 中不被任何 $a_i$「包含」的数。

**核心性质（超集单调性）**：若 $x$ 合法，则 $x$ 的任何超集 $y$（$x\,\&\,y=x$）也合法。因为使 $x\not\subseteq a_i$ 的那个「$x$ 有而 $a_i$ 没有」的位，$y$ 也保留着。这告诉我们：合法解只需要在一种极小的规范形态里找。

**候选形态只有 $61$ 种**：

1. $x=m$。注意 $m\subseteq a_i$ 与 $a_i\le m$ 同时成立时强制 $a_i=m$，所以 $x=m$ 合法当且仅当 $m$ 不在清单中。
2. 对 $m$ 的每个为 $1$ 的二进制位 $j$，构造
   $$t_j=\bigl(m\text{ 中高于 }j\text{ 的位}\bmid)\ \bigm|\ \bigl(2^j-1\bigr),$$
   即高位照抄 $m$、第 $j$ 位清 $0$、低于 $j$ 的位全部置 $1$。显然 $t_j<m$。

**完备性**：设存在合法的 $x<m$。取 $x$ 与 $m$ 的最高不同位 $j$（则 $x$ 高于 $j$ 的位与 $m$ 相同，且 $x$ 第 $j$ 位为 $0$），把 $x$ 扩成 $x'=t_j$（低位全补 $1$），则 $x\subseteq x'\le m$，由超集单调性 $x'$ 仍合法且非零。所以若有解，必有解落在上述 $61$ 个候选中。

**候选的判定**：$t_j$ 非法 $\iff$ 存在 $a_i\in\{t_j,\ t_j+2^j\}$。推导：$t_j\subseteq a_i$ 要求高位（同 $m$）$\subseteq a_i$，配合 $a_i\le m$ 得 $a_i$ 的高位恰与 $m$ 相同；再要求 $t_j$ 低 $j$ 位全 $1\ \subseteq a_i$，即 $a_i$ 低 $j$ 位全 $1$。两条件合起来恰好是这两个值。

**批量判定**：对每个 $a$ 记

- $d$：$a$ 与 $m$ 的最高不同位（$a=m$ 时记 $d=-1$，表示任何 $j$ 下高位都匹配）；
- $c$：$a$ 的低位连续 $1$ 的个数（即 $a+1$ 的最低 $1$ 位位置）。

则 $a$ 恰好破坏满足 $d\le j\le c$ 的所有候选 $j$。用位掩码 $B$ 累计：$B\ \vert=\ m\,\&\,\bigl(((1\ll(c+1))-1)-((1\ll d)-1)\bigr)$（$d=-1$ 时最后一项取 $0$）。最后扫描 $m$ 的每个 $1$ 位 $j$：若 $t_j\ge 1$ 且 $B$ 的第 $j$ 位为 $0$，输出 $t_j$；连同 $x=m$ 的情形都不可行则输出 `No`。

总复杂度 $O(n)$（外加读入），每个元素只做常数次位运算。

## 代码

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

// x >= 1，返回最高位 1 的索引
func msb(x: Int64): Int64 {
    var n: Int64 = 0
    var xx = x
    if (xx >= 1152921504606846976) {
        xx = xx >> 60
        n += 60
    }
    if (xx >= 1073741824) {
        xx = xx >> 30
        n += 30
    }
    if (xx >= 32768) {
        xx = xx >> 15
        n += 15
    }
    if (xx >= 256) {
        xx = xx >> 8
        n += 8
    }
    if (xx >= 16) {
        xx = xx >> 4
        n += 4
    }
    if (xx >= 4) {
        xx = xx >> 2
        n += 2
    }
    if (xx >= 2) {
        xx = xx >> 1
        n += 1
    }
    return n
}

// x >= 1，返回最低位 1 的索引
func ctz(x: Int64): Int64 {
    var n: Int64 = 0
    var xx = x
    if ((xx & 4294967295) == 0) {
        xx = xx >> 32
        n += 32
    }
    if ((xx & 65535) == 0) {
        xx = xx >> 16
        n += 16
    }
    if ((xx & 255) == 0) {
        xx = xx >> 8
        n += 8
    }
    if ((xx & 15) == 0) {
        xx = xx >> 4
        n += 4
    }
    if ((xx & 3) == 0) {
        xx = xx >> 2
        n += 2
    }
    if ((xx & 1) == 0) {
        xx = xx >> 1
        n += 1
    }
    return n
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    let m = nextInt()
    let a = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        a[i] = nextInt()
    }

    // B 的第 j 位为 1 表示候选 j（把 m 的第 j 位改成 0、低位全置 1）被某个 a_i 破坏
    var sawM = false
    var B: Int64 = 0
    for (i in 0..n) {
        let ai = a[i]
        var d: Int64 = 0
        if (ai == m) {
            sawM = true
            d = -1
        } else {
            d = msb(ai ^ m)
        }
        let c = ctz(ai + 1)
        if (c >= d) {
            var lo: Int64 = 0
            if (d >= 0) {
                lo = (Int64(1) << d) - 1
            }
            B |= m & (((Int64(1) << (c + 1)) - 1) - lo)
        }
    }

    var answer: Int64 = -1
    if (!sawM) {
        answer = m
    } else {
        var j: Int64 = 0
        while (j < 60) {
            if (((m >> j) & 1) == 1) {
                // 候选：高位与 m 相同，第 j 位为 0，低 j 位全 1
                let t = ((m >> (j + 1)) << (j + 1)) | ((Int64(1) << j) - 1)
                if (t >= 1 && ((B >> j) & 1) == 0) {
                    answer = t
                    break
                }
            }
            j += 1
        }
    }

    if (answer >= 1) {
        println("Yes")
        println(answer)
    } else {
        println("No")
    }
}
```
