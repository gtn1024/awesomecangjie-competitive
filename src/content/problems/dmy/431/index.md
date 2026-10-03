---
oj: dmy
pid: '431'
title: '[R69E] 协调串'
difficulty: 普及/提高-
tags:
  - 枚举
  - 贪心
timeLimit: 0.6s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^4$，字符串仅包含小写字母。

## 思路

一个保留子序列是协调的，当且仅当它的第一个字符与最后一个字符相同（长度为 $1$ 也允许）。因此对子串 $u$，$f(u)$ 等于 $|u|$ 减去**能保留的最大长度**：要么只保留一个字符，要么保留首尾相同的一对字符（这对字符中间的所有字符都可以一并保留）。

对原串枚举所有子串需要 $O(n^2)$，关键在于固定左端点后能快速递推右端点的答案。

固定左端点 $i$，用 `now` 表示子串 $s[i..j-1]$ 的答案，把右端点从 $j-1$ 扩展到 $j$：

- 若直接删除新字符 $s[j]$，答案为 `now + 1`；
- 若 $s[j]$ 在 $s[i..j-1]$ 中出现过，记其**第一次出现位置**为 $p$，则保留 $s[p]$ 作开头、$s[j]$ 作结尾，中间字符全部保留，需要删除的只有 $p$ 之前的 $p - i$ 个字符；
- 若 $s[j]$ 从未出现过，只能删除它，答案为 `now + 1`。

两种可行方案取最小值：

$$
now = \min(now + 1,\ p - i)
$$

取 $s[j]$ 的第一次出现位置是因为开头越靠前，保留的字符越多、删除越少。每个左端点开始时把出现位置数组清空，向右扫描一边更新 `now` 一边记录首次出现位置，同时把每个子串的 `now` 累加到答案中即可。

## 复杂度

时间 $O(n^2)$，空间 $O(26)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow().split(" ", removeEmpty: true)[0])
    let s = reader.readln().getOrThrow()
    var ans: Int64 = 0
    let pos = Array<Int64>(256, { _ => -1 })
    let nn = n
    for (i in 0..nn) {
        for (k in 0..256) {
            pos[k] = -1
        }
        var now: Int64 = -1
        var j = i
        while (j < nn) {
            let c = s[j]
            let p = pos[Int64(c)]
            if (p >= 0) {
                if (now + 1 < p - i) {
                    now = now + 1
                } else {
                    now = p - i
                }
            } else {
                now = now + 1
                pos[Int64(c)] = j
            }
            ans += now
            j += 1
        }
    }
    println(ans)
}
```

</details>

要点：

- 位置数组按字节值开大小为 $256$，省去字符到 $0..25$ 的换算；`s[j]` 取到的是 UTF-8 字节，小写字母的字节值恰好落在数组下标范围内。
- 答案累加的是所有子串的 $f$ 值之和，单个 $f$ 值不超过 $n - 1$，总和可达 $O(n^3)$ 量级，需要 `Int64`。
