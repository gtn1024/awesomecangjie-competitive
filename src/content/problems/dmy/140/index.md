---
oj: dmy
pid: '140'
title: '[R23E]第k小子序列'
difficulty: 提高
tags:
  - 字符串
  - 动态规划
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq n \leq 10^5$，$1 \leq k \leq \min(f(s), 10^{18})$，其中 $f(s)$ 表示 $s$ 本质不同子序列的个数。

## 思路

本题的关键是给每个本质不同子序列一个**规范表示**：一个子序列 $t$ 由其首字符 $c$ 决定，我们规定 $t$ 的第一个字符取自 $c$ 在 $s$ 中**第一次出现的位置**。这样每个本质不同子序列恰好被计数一次，且计数方式可以直接对应字典序。

设 $\text{dp}[i]$ 表示后缀 $s[i..]$ 的本质不同子序列个数（**含空串**），并令 $\text{nxt}_c(i)$ 表示字符 $c$ 在位置 $i$ 及之后第一次出现的位置（不存在则为 $-1$）。按首字符分类：

$$\text{dp}[i] = 1 + \sum_{c} \text{dp}[\text{nxt}_c(i) + 1]$$

其中 $1$ 是空串，$c$ 取遍在 $s[i..]$ 中出现的字符。因为 $k \leq 10^{18}$，所有 $\text{dp}$ 值**超过 $2 \times 10^{18}$ 就截断**，既避免溢出又不会影响比较。

求出 $\text{dp}$ 后贪心构造答案。把空串看作字典序第 $1$ 名，那么要求的第 $k$ 个子序列就是含空串排序后的第 $k + 1$ 名，维护当前游标位置 $\text{cur}$ 与剩余排名 $\text{kk}$：

- 从 `a` 到 `z` 依次考察字符 $c$，设 $c$ 在 $\ge \text{cur}$ 处首次出现的位置为 $p$，以 $c$ 开头的子序列共有 $\text{dp}[p + 1]$ 个（首字符取规范位置 $p$，后缀任取 $s[p+1..]$ 的子序列，含空串）。
- 若 $\text{kk} \le \text{dp}[p + 1]$：输出 $c$，令 $\text{cur} = p + 1$，继续下一轮。
- 否则 $\text{kk} \mathrel{-}= \text{dp}[p + 1]$，跳过整个以 $c$ 开头的块。

由于 $\text{kk} \le \text{dp}[\text{cur}]$ 始终成立，循环必然找到字符，且 $\text{cur}$ 严格递增。查找「$c$ 在 $\ge \text{cur}$ 处首次出现的位置」时，预先按字符把出现位置存进数组，用**单调指针**维护，总移动次数为 $O(n)$。

**验证样例**：$s = \text{bcadc}$，$k = 10$。按上述方法排序后前 $10$ 个为 `a`、`ac`、`ad`、`adc`、`b`、`ba`、`bac`、`bad`、`badc`、`bc`，第 $10$ 个正是 `bc`，与样例一致。

## 复杂度

$\text{dp}$ 与构造都是 $O(26n)$，指针移动总量 $O(n)$。时间复杂度 $O(26n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

func solve(reader: ConsoleReader) {
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line[0])
    let k = Int64.parse(line[1])
    let s = reader.readln().getOrThrow()
    let nn = n
    let CAP = 2000000000000000000

    // 每个字符的出现位置列表（用 offset + posArr 组织，posArr[c 的出现位置] 递增）
    var cnt = Array<Int64>(26, { _ => 0 })
    for (i in 0..nn) {
        cnt[Int64(s[i]) - 97] += 1
    }
    var offset = Array<Int64>(27, { _ => 0 })
    for (c in 0..26) {
        offset[c + 1] = offset[c] + cnt[c]
    }
    var posArr = Array<Int64>(nn, { _ => 0 })
    var filled = Array<Int64>(26, { _ => 0 })
    for (i in 0..nn) {
        let c = Int64(s[i]) - 97
        posArr[offset[c] + filled[c]] = i
        filled[c] += 1
    }
    var ptr = Array<Int64>(26, { _ => 0 })
    for (c in 0..26) {
        ptr[c] = offset[c]
    }

    // dp[i]: s[i..] 的本质不同子序列个数（含空串），超过 CAP 截断
    var dp = Array<Int64>(nn + 1, { _ => 0 })
    dp[nn] = 1
    var nxt = Array<Int64>(26, { _ => -1 })
    var i = nn - 1
    while (i >= 0) {
        nxt[Int64(s[i]) - 97] = i
        var sum: Int64 = 1
        for (c in 0..26) {
            let p = nxt[c]
            if (p >= 0) {
                let x = dp[p + 1]
                if (sum > CAP - x) {
                    sum = CAP
                } else {
                    sum += x
                }
            }
        }
        dp[i] = sum
        i -= 1
    }

    // 贪心构造第 kk 个（含空串排第 1）子序列
    var kk = k + 1
    var cur = 0
    var ansLen = 0
    var ansBytes = Array<UInt8>(nn, { _ => 0u8 })
    while (kk > 1) {
        kk -= 1
        for (c in 0..26) {
            while (ptr[c] < offset[c + 1] && posArr[ptr[c]] < cur) {
                ptr[c] += 1
            }
            if (ptr[c] >= offset[c + 1]) {
                continue
            }
            let p = posArr[ptr[c]]
            let cntV = dp[p + 1]
            if (kk <= cntV) {
                ansBytes[ansLen] = s[p]
                ansLen += 1
                cur = p + 1
                break
            }
            kk -= cntV
        }
    }
    println(String.fromUtf8(ansBytes[0..ansLen]))
}

main() {
    let reader = getStdIn()
    solve(reader)
}
```
