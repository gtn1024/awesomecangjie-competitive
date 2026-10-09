---
oj: dmy
pid: '492'
title: '[R79E] 这是一道01串题5'
difficulty: 入门
tags:
  - 贪心
  - 思维
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 200000$，$S$ 为 01 串。

## 思路

**翻转不改变字符间的相对顺序，只改变每个字符的「当前值」。** 维护一个全局翻转奇偶性 $p$（$p=0$ 表示累计翻转了偶数次）。无论怎么删，剩余串永远是原串的一个连续子串 $S[l..r]$，位置 $i$ 上的字符当前读作 $S[i] \oplus p$。

**关键不变量：每次删除后，奇偶性恰好等于被删字符的原始值。** 删除位置 $i$ 时其当前值为 $S[i] \oplus p$；若它是 $1$ 则触发翻转，新奇偶性

$$p' = p \oplus (S[i] \oplus p) = S[i].$$

若没触发翻转，则 $S[i] = p$，同样有 $p' = p = S[i]$。

**可达状态的分析。** 到达 $(l, r)$ 的代价恒为 $(l-1)+(n-r)$，与被删顺序无关。而最后一步删除不是从左边删（位置 $l-1$）就是从右边删（位置 $r+1$），由不变量，此时的奇偶性只能是 $S[l-1]$（当 $l>1$）或 $S[r+1]$（当 $r<n$）；这两种也确实可达——先删完另一侧，最后删这一侧即可。

**终止条件**：$S[l..r]$ 中每个字符异或 $p$ 都是 $0$，即整段都等于 $p$。所以剩余串必须是一个值全为 $c$ 的连续段，且 $c$ 是可达奇偶性。

**对一个极大连续段 $[a,b]$（长 $L$，值全为 $c$）**，若两端都还有字符，取整段时奇偶性被强制为 $S[a-1]=S[b+1]=1-c \ne c$，不合法；弃掉任一端、保留长 $L-1$ 的一段后，最后删被弃端的外侧邻居即可让奇偶性等于 $c$，合法。贴边界的段同理最多保留 $L-1$。唯一例外是整个串全为 $0$：此时不动即可，答案为 $0$。

因此答案为 $n-(\text{最长连续段长度}-1)$，即 **$n$ 减去最长连续段长度再加 $1$**；全 $0$ 串特判输出 $0$。一次遍历同时维护当前段长与最大值即可。

## 复杂度

时间 $O(n)$，额外空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    var maxrun: Int64 = 1
    var cur: Int64 = 1
    var allzero = true
    if (s[0] == 49) {
        allzero = false
    }
    var i: Int64 = 1
    while (i < n) {
        if (s[i] == 49) {
            allzero = false
        }
        if (s[i] == s[i - 1]) {
            cur += 1
            if (cur > maxrun) {
                maxrun = cur
            }
        } else {
            cur = 1
        }
        i += 1
    }
    if (allzero) {
        println(0)
    } else {
        println(n - maxrun + 1)
    }
}
```

</details>
