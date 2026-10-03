---
oj: dmy
pid: '429'
title: '[R69C] 这是一个01串题4'
difficulty: 入门
tags:
  - 滑动窗口
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le k \le n$，$s$ 是长度为 $n$ 的 01 串。

## 思路

题意是统计满足 $i < j$、$s_i = 0$、$s_j = 1$ 且 $j - i \le k$ 的数对 $(i, j)$ 的个数。可以把它理解为：对于每个位置 $j$，统计它左侧 $k$ 个位置（即窗口 $[j-k,\, j-1]$）内有多少个 `0`，这些 `0` 都能与 $j$ 配对。

从左到右扫描，维护一个长度为 $k$ 的滑动窗口内 `0` 的个数 `cnt`：

- 当前字符是 `1`，则窗口内的每个 `0` 都能与之配对，`ans += cnt`；
- 然后窗口右移一格：位置 $j - k$ 出窗（若该位置是 `0` 则 `cnt--`），位置 $j$ 入窗（若是 `0` 则 `cnt++`）。

注意先配对再移窗，保证入窗字符不会与自身位置 $j$ 的 `1` 错误配对，出窗判断也不会误删未参与统计的字符。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line[0]
    let k = line[1]
    let s = reader.readln().getOrThrow().toRuneArray()
    // 滑动窗口：窗口 [j-k, j-1] 内 '0' 的个数 cnt
    // 当前位置 j 是 '1' 时，这些 0 都可与 j 配对，ans += cnt
    // 处理完 j 后窗口右移一位：位置 j-k 出窗（j-k>=0 且为 '0' 则 cnt--），位置 j 入窗（为 '0' 则 cnt++）
    var cnt: Int64 = 0
    var ans: Int64 = 0
    var j: Int64 = 0
    while (j < n) {
        if (s[j] == r'1') {
            ans += cnt
        }
        let out = j - k
        if (out >= 0 && s[out] == r'0') {
            cnt -= 1
        }
        if (s[j] == r'0') {
            cnt += 1
        }
        j += 1
    }
    println(ans)
}
```

</details>

要点：

- 先用 `s[j]` 配对，再把 `s[j-k]` 出窗、`s[j]` 入窗，三者顺序固定，避免窗口统计错位。
- 字符比较需要 `Rune` 类型：用 `toRuneArray()` 取字符数组，字面量写成 `r'0'`、`r'1'`。
- $n$ 最大为 $2 \times 10^5$ 时答案至多约 $2 \times 10^{10}$，用 `Int64` 累加即可。
