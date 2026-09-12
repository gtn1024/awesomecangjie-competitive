---
oj: dmy
pid: '464'
title: '[R75B] 串移位'
difficulty: 入门
tags:
  - 字符串
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$0 \le k \le 10^{18}$，$s$ 仅由大写英文字母组成。

## 思路

循环左移 $k$ 位后，新串 $t$ 的第 $i$ 个字符来自原串的 $(i + k) \bmod n$ 位，即 $t[i] = s[(i + k) \bmod n]$。于是要统计的就是满足

$$s[i] = s[(i + k) \bmod n]$$

的下标 $i$ 的个数。

先把 $k$ 对 $n$ 取模，记 $d = k \bmod n$，因为移位数每达到 $n$ 就回到原串。取模后 $0 \le d < n$，所有下标运算都落在合法范围内，且 $O(1)$ 取出 $k$ 的巨大值也不会溢出。

随后从 $0$ 到 $n - 1$ 逐个枚举 $i$，比较这两个字符是否相同并计数即可。特别地，当 $d = 0$ 时 $t$ 与 $s$ 完全相同，每个位置都贡献一次答案，这一点无需特判，循环本身就会得到 $n$。

## 复杂度

时间 $O(n)$，空间 $O(n)$（存放读入的字节串）。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(first[0])
    let k = Int64.parse(first[1])
    let s = reader.readln().getOrThrow().toArray()
    let d = k % n
    var ans: Int64 = 0
    var i: Int64 = 0
    while (i < n) {
        if (s[i] == s[(i + d) % n]) {
            ans += 1
        }
        i += 1
    }
    println(ans)
}
```
