---
oj: dmy
pid: '51'
title: '[R9C] k倍数区间'
difficulty: 普及-
tags:
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$1 \le k \le 10^6$，$0 \le A_i \le 10^9$。

## 思路

设前缀和 $s[i] = \sum_{j=1}^i A_j$，区间 $[L, R]$ 的区间和为 $s[R] - s[L-1]$。区间和是 $k$ 的倍数等价于 $s[R] \bmod k = s[L-1] \bmod k$。

枚举右端点 $R$，用 $cnt[x]$ 记录 $0 \le i \le R-1$ 中 $s[i] \bmod k = x$ 的个数，则 $s[R] \bmod k$ 的贡献为 $cnt[s[R] \bmod k]$，统计后把 $cnt[s[R] \bmod k]$ 加一。初始 $cnt[0] = 1$（空前缀）。

复杂度：时间 $O(n)$，空间 $O(k)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let line0 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let k = line0[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let cnt = Array<Int64>(k, { _ => 0 })
    cnt[0] = 1
    var s: Int64 = 0
    var ans: Int64 = 0
    for (v in a) {
        s = (s + v) % k
        ans = ans + cnt[s]
        cnt[s] = cnt[s] + 1
    }
    println(ans)
}
```

</details>
