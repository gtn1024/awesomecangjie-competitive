---
oj: dmy
pid: '133'
title: '[R22E]相似对数'
difficulty: 提高
tags:
  - 字符串
  - 最小表示
timeLimit: 1s
memoryLimit: 512m
---

## 题目

定义两个字符串 $s_i$ 和 $s_j$ 相似，当且仅当 $s_i$ 可以通过任意次循环移位（包括零次）后与 $s_j$ 相等。给定 $n$ 个由小写字母组成的字符串，求有多少个无序对 $(i,j)$（$i<j$）满足 $s_i$ 与 $s_j$ 相似。

> 对于 $100\%$ 的数据，$1\le n\le 10^5$，字符串由小写字母组成，且长度均不超过 $5$。

## 思路

**关键观察**：两个字符串相似，当且仅当它们是同一个字符串的循环移位，即互为循环同构。因此可以把每个字符串归一到「所有循环移位中字典序最小的那一个」（最小表示），两个字符串相似当且仅当它们的最小表示相同。

字符串长度不超过 $5$，直接枚举所有循环移位即可。为了便于比较，把小写字母映射为数字 $1\sim 26$，把字符串看作一个 $26$ 进制整数：因为最高位数字非零，该编码与字符串一一对应，且编码大小与字典序完全一致。对每个循环移位按顺序重新拼接出对应的 $26$ 进制整数，取其中的最小值，就是该字符串的最小表示。

最后统计每种最小表示出现的次数 $c$，这一类的内部相似对数为 $\binom{c}{2}=c(c-1)/2$，对所有类求和即为答案。

注意两点：长度不超过 $5$ 时编码值不超过 $26^5\approx 1.2\times 10^7$，远小于 `Int64` 上限；而答案最大约为 $\binom{10^5}{2}\approx 5\times 10^9$，超过 32 位整数范围，需要用 `Int64`。

## 复杂度

- 时间复杂度：$O(n\log n + nL^2)$，其中 $L\le 5$ 为字符串长度（每个串枚举 $L$ 个循环移位，每个移位 $O(L)$ 计算编码），排序 $O(n\log n)$。
- 空间复杂度：$O(n)$ 存储每个串的最小表示编码。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let pow26 = Array<Int64>(6, { _ => 0 })
    pow26[0] = 1
    for (i in 1..6) {
        pow26[i] = pow26[i - 1] * 26
    }
    let vals = Array<Int64>(nn, { _ => 0 })
    for (i in 0..nn) {
        let s = reader.readln().getOrThrow()
        let runes = s.toRuneArray()
        let len = runes.size
        let rv = Array<Int64>(len, { _ => 0 })
        for (k in 0..len) {
            rv[k] = Int64(UInt32(runes[k])) - 96
        }
        var best = Int64.Max
        for (k in 0..len) {
            var v: Int64 = 0
            for (t in 0..len) {
                v = v * 26 + rv[(k + t) % len]
            }
            if (v < best) {
                best = v
            }
        }
        vals[i] = best
    }
    sort(vals)
    var ans: Int64 = 0
    var i: Int64 = 0
    while (i < nn) {
        var j: Int64 = i
        while (j < nn && vals[j] == vals[i]) {
            j += 1
        }
        let c = j - i
        ans += c * (c - 1) / 2
        i = j
    }
    println(ans)
}
```

</details>
